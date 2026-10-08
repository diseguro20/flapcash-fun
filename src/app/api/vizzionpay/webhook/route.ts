import { NextResponse } from 'next/server';
import { vizzionPay } from '@/lib/vizzionpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    let rawBody: any = {};
    try {
      rawBody = await req.json();
    } catch {
      const text = await req.text();
      try {
        rawBody = JSON.parse(text);
      } catch {
        rawBody = {};
      }
    }

    console.log('[VizzionPay Webhook Received]:', JSON.stringify(rawBody));

    const headersObj: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersObj[key.toLowerCase()] = val;
    });

    if (!vizzionPay.verifyWebhook(headersObj, rawBody)) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    const event = String(rawBody.event || rawBody.type || rawBody.action || '').toUpperCase();
    const transaction = rawBody.transaction || rawBody.data || {};
    const status = String(transaction.status || rawBody.status || '').toUpperCase();
    const data = transaction.id ? transaction : (rawBody.data || rawBody);

    const externalId = String(
      rawBody.identifier ||
      rawBody.clientIdentifier ||
      rawBody.external_id ||
      rawBody.externalReference ||
      data.identifier ||
      data.clientIdentifier ||
      data.external_id ||
      data.externalReference ||
      rawBody.metadata?.referenceId ||
      rawBody.metadata?.externalId ||
      rawBody.metadata?.userId ||
      ''
    );

    const transactionId = String(
      data.id ||
      data.transactionId ||
      data.transaction_id ||
      rawBody.id ||
      rawBody.transactionId ||
      rawBody.transaction_id ||
      externalId ||
      Date.now()
    );

    const isPaid =
      event.includes('PAID') ||
      event.includes('COMPLETED') ||
      event.includes('APPROVED') ||
      status === 'COMPLETED' ||
      status === 'PAID' ||
      status === 'APPROVED' ||
      status === 'CONFIRMED' ||
      status === 'SUCESSO';

    let rawAmount = Number(
      data.amount ||
      data.chargeAmount ||
      data.value ||
      rawBody.amount ||
      rawBody.value ||
      0
    );

    if (rawAmount > 500 && !String(rawAmount).includes('.')) {
      rawAmount = rawAmount / 100;
    }

    if (isPaid && (externalId || transactionId)) {
      let targetUserId = '';
      if (externalId.startsWith('dep_')) {
        const parts = externalId.split('_');
        targetUserId = parts[1];
      } else if (rawBody.metadata?.userId) {
        targetUserId = rawBody.metadata.userId;
      }

      // Se não encontrou o userId pelo externalId, consulta o registro de depósito gravado previamente
      if (!targetUserId || targetUserId === 'guest') {
        try {
          const depSnap = await getDoc(doc(db, 'deposits', transactionId));
          if (depSnap.exists()) {
            targetUserId = depSnap.data()?.userId;
            if (!rawAmount && depSnap.data()?.amount) {
              rawAmount = Number(depSnap.data().amount);
            }
          }
        } catch (e) {}
      }

      if (targetUserId && targetUserId !== 'guest') {
        try {
          const depositRef = doc(db, 'deposits', transactionId);
          const depositSnap = await getDoc(depositRef);

          if (!depositSnap.exists() || depositSnap.data()?.status !== 'COMPLETED') {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const currentBalance = Number(userSnap.data().balance || 0);
              const currentBonus = Number(userSnap.data().bonusBalance || 0);

              await updateDoc(userRef, {
                balance: Number((currentBalance + rawAmount).toFixed(2)),
                bonusBalance: Number((currentBonus + rawAmount).toFixed(2)),
                updatedAt: new Date().toISOString()
              });

              await setDoc(depositRef, {
                userId: targetUserId,
                amount: rawAmount,
                status: 'COMPLETED',
                transactionId,
                gateway: 'VIZZION_PAY',
                paidAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }, { merge: true });

              console.log(`[VizzionPay Webhook] Saldo creditado para usuário ${targetUserId}: +R$ ${rawAmount}`);
            }
          }
        } catch (dbErr) {
          console.error('[VizzionPay Webhook Firestore Sync Error]:', dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
      transactionId,
      status: isPaid ? 'COMPLETED' : 'RECEIVED'
    }, { status: 200 });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ success: true, warning: err.message }, { status: 200 });
  }
}

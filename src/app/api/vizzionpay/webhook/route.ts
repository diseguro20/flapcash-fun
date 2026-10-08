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
      // payload pode ser vazio ou formato form
      const text = await req.text();
      try {
        rawBody = JSON.parse(text);
      } catch {
        rawBody = {};
      }
    }

    console.log('[VizzionPay Webhook Received]:', JSON.stringify(rawBody));

    // Headers para verificação
    const headersObj: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersObj[key.toLowerCase()] = val;
    });

    if (!vizzionPay.verifyWebhook(headersObj, rawBody)) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    // Suporte amplo a formatos de webhook Vizzion Pay e acquirers
    const event = String(rawBody.event || rawBody.type || rawBody.action || '').toUpperCase();
    const status = String(rawBody.status || rawBody.data?.status || '').toUpperCase();
    const data = rawBody.data || rawBody;

    const externalId = String(
      rawBody.external_id ||
      rawBody.externalReference ||
      rawBody.external_reference ||
      data.external_id ||
      data.externalReference ||
      rawBody.custom_id ||
      data.custom_id ||
      rawBody.metadata?.externalId ||
      rawBody.metadata?.userId ||
      ''
    );

    const transactionId = String(rawBody.id || rawBody.transaction_id || data.id || data.transaction_id || externalId || Date.now());

    // Identificação de confirmação de pagamento
    const isPaid =
      event.includes('PAID') ||
      event.includes('COMPLETED') ||
      event.includes('APPROVED') ||
      status === 'COMPLETED' ||
      status === 'PAID' ||
      status === 'APPROVED' ||
      status === 'CONFIRMED' ||
      status === 'SUCESSO';

    // Cálculo do valor
    let rawAmount = Number(
      data.amount_float ||
      rawBody.amount_float ||
      data.value ||
      rawBody.value ||
      data.amount ||
      rawBody.amount ||
      0
    );

    // Se o valor estiver em centavos (> 500 sem ponto decimal para depósitos padrão), converte
    if (rawAmount > 500 && !String(rawAmount).includes('.')) {
      rawAmount = rawAmount / 100;
    }

    if (isPaid && externalId) {
      let targetUserId = '';
      if (externalId.startsWith('dep_')) {
        const parts = externalId.split('_');
        targetUserId = parts[1];
      } else if (rawBody.metadata?.userId) {
        targetUserId = rawBody.metadata.userId;
      } else {
        targetUserId = externalId;
      }

      if (targetUserId && targetUserId !== 'guest') {
        try {
          const depositRef = doc(db, 'deposits', transactionId);
          const depositSnap = await getDoc(depositRef);

          // Previne crédito duplicado para o mesmo webhook
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

              // Salva registro do depósito no Firestore
              await setDoc(depositRef, {
                userId: targetUserId,
                amount: rawAmount,
                status: 'COMPLETED',
                transactionId,
                gateway: 'VIZZION_PAY',
                createdAt: new Date().toISOString()
              }, { merge: true });

              console.log(`[VizzionPay] Saldo creditado para usuário ${targetUserId}: +R$ ${rawAmount}`);
            }
          }
        } catch (dbErr) {
          console.error('[VizzionPay Webhook Firestore Sync Error]:', dbErr);
        }
      }
    }

    // Sempre retorna HTTP 200 para confirmar recebimento ao gateway
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

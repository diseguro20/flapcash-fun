import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { vizzionPay } from '@/lib/vizzionpay';

// Cache em memória para evitar 429 TOO_MANY_REQUESTS na API da Vizzion Pay
const statusCache = new Map<string, { timestamp: number; data: any }>();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get('txId');

    if (!txId) {
      return NextResponse.json({ success: false, message: 'txId is required' }, { status: 400 });
    }

    // 1. Consulta Firestore primeiro para verificar se já foi processado
    let depositData: any = null;
    try {
      const depositRef = doc(db, 'deposits', txId);
      const depositSnap = await getDoc(depositRef);

      if (depositSnap.exists()) {
        depositData = depositSnap.data();
        if (depositData.status === 'COMPLETED') {
          return NextResponse.json({
            success: true,
            transactionId: txId,
            status: 'COMPLETED',
            paid: true,
            amount: depositData.amount
          });
        }
      }
    } catch (e) {
      console.warn('[Status route firestore check warning]:', e);
    }

    // 2. Debounce em memória: se consultado nos últimos 8 segundos, retorna pendente para não sofrer 429
    const cached = statusCache.get(txId);
    if (cached && Date.now() - cached.timestamp < 8000) {
      return NextResponse.json(cached.data);
    }

    // 3. Consulta a API oficial da Vizzion Pay diretamente
    try {
      const tx = await vizzionPay.getTransaction(txId, depositData?.externalReference);
      if (tx && vizzionPay.isTransactionPaid(tx)) {
        const amount = Number(tx.amount || tx.chargeAmount || depositData?.amount || 20);
        const externalRef = String(tx.clientIdentifier || depositData?.externalReference || '');

        let targetUserId = depositData?.userId;
        if (!targetUserId || targetUserId === 'guest') {
          if (externalRef.startsWith('dep_')) {
            targetUserId = externalRef.split('_')[1];
          }
        }

        // Se o pagamento foi confirmado na Vizzion Pay e ainda não computou no Firestore:
        if (targetUserId && targetUserId !== 'guest') {
          try {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const currentBalance = Number(userSnap.data().balance || userSnap.data().cash_balance || 0);
              const currentBonus = Number(userSnap.data().bonusBalance || userSnap.data().bonus_balance || 0);
              const newBalance = Number((currentBalance + amount).toFixed(2));
              const newBonus = Number((currentBonus + amount).toFixed(2));

              await updateDoc(userRef, {
                balance: newBalance,
                cash_balance: newBalance,
                bonusBalance: newBonus,
                updatedAt: new Date().toISOString()
              });
            }

            await setDoc(doc(db, 'deposits', txId), {
              userId: targetUserId,
              amount,
              status: 'COMPLETED',
              transactionId: txId,
              gateway: 'VIZZION_PAY',
              paidAt: new Date().toISOString()
            }, { merge: true });

            console.log(`[VizzionPay Polling] Depósito pago e creditado para ${targetUserId}: R$ ${amount}`);
          } catch (dbErr) {
            console.error('[VizzionPay Polling Firestore sync error]:', dbErr);
          }
        }

        const successResp = {
          success: true,
          transactionId: txId,
          status: 'COMPLETED',
          paid: true,
          amount
        };
        statusCache.set(txId, { timestamp: Date.now(), data: successResp });
        return NextResponse.json(successResp);
      }
    } catch (e: any) {
      console.warn('[Status route Vizzion Pay check notice]:', e.message);
    }

    const pendingResp = {
      success: true,
      transactionId: txId,
      status: 'pending',
      paid: false
    };
    statusCache.set(txId, { timestamp: Date.now(), data: pendingResp });
    return NextResponse.json(pendingResp);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

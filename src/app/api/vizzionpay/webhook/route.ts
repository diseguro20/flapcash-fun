import { NextResponse } from 'next/server';
import { vizzionPay } from '@/lib/vizzionpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    console.log('[VizzionPay Webhook Received]:', JSON.stringify(rawBody));

    // Headers para verificação
    const headersObj: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersObj[key.toLowerCase()] = val;
    });

    if (!vizzionPay.verifyWebhook(headersObj, rawBody)) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    /**
     * Vizzion Pay payload structure:
     * {
     *   event: 'charge.paid' | 'pix.approved',
     *   status: 'paid' | 'approved',
     *   transaction_id: string,
     *   external_id: string, // dep_UID_TIMESTAMP
     *   amount: number
     * }
     */
    const status = (rawBody.status || rawBody.event || '').toLowerCase();
    const externalId = rawBody.external_id || rawBody.external_reference || '';
    const amount = Number(rawBody.amount_float || (rawBody.amount ? rawBody.amount / 100 : 0));

    if (status.includes('paid') || status.includes('approved') || status.includes('success')) {
      if (externalId && externalId.startsWith('dep_')) {
        const parts = externalId.split('_');
        const userId = parts[1];

        if (userId && userId !== 'guest') {
          try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const currentBalance = userSnap.data().balance || 0;
              const currentBonus = userSnap.data().bonusBalance || 0;
              await updateDoc(userRef, {
                balance: Number((currentBalance + amount).toFixed(2)),
                bonusBalance: Number((currentBonus + amount).toFixed(2)) // +100% bônus
              });
              console.log(`[VizzionPay] Saldo creditado para usuário ${userId}: +R$ ${amount}`);
            }
          } catch (e) {
            console.error('[VizzionPay Webhook Firestore Sync Error]:', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

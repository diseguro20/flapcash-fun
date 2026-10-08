import { NextResponse } from 'next/server';
import { vizzionPay } from '@/lib/vizzionpay';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, payerName, payerCpf, payerEmail, userId } = body;

    if (!amount || amount < 20) {
      return NextResponse.json(
        { success: false, message: 'O valor mínimo de depósito é R$ 20,00' },
        { status: 400 }
      );
    }

    const externalReference = `dep_${userId || 'guest'}_${Date.now()}`;
    const pixResult = await vizzionPay.createPixCharge({
      amount: Number(amount),
      payerName: payerName || 'Cliente FlapCash',
      payerCpf,
      payerEmail,
      externalReference
    });

    if (pixResult.success && pixResult.transactionId) {
      try {
        await setDoc(doc(db, 'deposits', pixResult.transactionId), {
          id: pixResult.transactionId,
          userId: userId || 'guest',
          amount: Number(amount),
          status: 'PENDING',
          externalReference,
          pixCode: pixResult.pixCode,
          gateway: 'vizzionpay',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('[Firestore save deposit warning]:', dbErr);
      }
    }

    return NextResponse.json(pixResult);
  } catch (err: any) {
    console.error('API Pix error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

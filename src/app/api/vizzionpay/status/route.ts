import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get('txId');

    if (!txId) {
      return NextResponse.json({ success: false, message: 'txId is required' }, { status: 400 });
    }

    // Consulta Firestore para verificar se o webhook já marcou como pago
    try {
      const depositRef = doc(db, 'deposits', txId);
      const depositSnap = await getDoc(depositRef);

      if (depositSnap.exists()) {
        const data = depositSnap.data();
        if (data.status === 'COMPLETED') {
          return NextResponse.json({
            success: true,
            transactionId: txId,
            status: 'COMPLETED',
            paid: true,
            amount: data.amount
          });
        }
      }
    } catch (e) {
      // continua com status pendente se erro de consulta
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      status: 'pending',
      paid: false
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

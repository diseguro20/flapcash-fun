import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { round_id, units } = body;

    let balance = 0.00;
    if (round_id) {
      try {
        const roundSnap = await getDoc(doc(db, 'rounds', round_id));
        if (roundSnap.exists()) {
          const userId = roundSnap.data().userId;
          if (userId) {
            const userSnap = await getDoc(doc(db, 'users', userId));
            if (userSnap.exists()) {
              balance = userSnap.data().balance || 0;
            }
          }
          await updateDoc(doc(db, 'rounds', round_id), {
            status: 'lost',
            units: Number(units) || 0,
            closedAt: new Date().toISOString()
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({
      ok: true,
      balance
    });
  } catch (err: any) {
    return NextResponse.json({ ok: true, balance: 0.00 });
  }
}

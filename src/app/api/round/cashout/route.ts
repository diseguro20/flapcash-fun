import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { round_id, units } = body;

    let bet = 5;
    let userId = 'usr_demo_player';

    if (round_id) {
      try {
        const roundSnap = await getDoc(doc(db, 'rounds', round_id));
        if (roundSnap.exists()) {
          bet = roundSnap.data().betAmount || 5;
          userId = roundSnap.data().userId || 'usr_demo_player';
        }
      } catch (e) {}
    }

    const cleared = Math.max(1, Number(units) || 1);
    // Multiplicador progressivo oficial por canos superados
    const multiplier = Number(Math.max(1.5, cleared * 1.0).toFixed(2));
    const payout = Number((bet * multiplier).toFixed(2));

    let newBalance = payout;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const cur = Number(userSnap.data().balance ?? userSnap.data().cash_balance ?? 0);
        newBalance = Number((cur + payout).toFixed(2));
        await updateDoc(userRef, {
          balance: newBalance,
          cash_balance: newBalance
        });
      }

      if (round_id) {
        await updateDoc(doc(db, 'rounds', round_id), {
          status: 'won',
          units: cleared,
          payout,
          multiplier,
          closedAt: new Date().toISOString()
        });
      }
    } catch (e) {}

    return NextResponse.json({
      ok: true,
      payout,
      multiplier,
      units: cleared,
      balance: newBalance
    });
  } catch (err: any) {
    console.error('Error in round/cashout:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

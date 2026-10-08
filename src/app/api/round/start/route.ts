import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bet_amount, user_id } = body;

    const bet = Number(bet_amount) || 5;
    const uid = user_id || 'usr_demo_player';

    // Recupera usuário do Firestore ou sessão local
    let currentBalance = 50.00;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        currentBalance = snap.data().balance ?? 50.00;
      } else {
        await setDoc(userRef, {
          uid,
          name: 'Jogador FlapCash',
          balance: 50.00,
          bonusBalance: 0,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Firestore fallback balance:', e);
    }

    if (currentBalance < bet) {
      return NextResponse.json({ error: 'saldo_insuficiente' }, { status: 200 });
    }

    if (bet < 5 || bet > 1000) {
      return NextResponse.json({ error: 'aposta_invalida', min: 5, max: 1000 }, { status: 200 });
    }

    const newBalance = Number((currentBalance - bet).toFixed(2));
    const roundId = 'rnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Registra rodada
    try {
      await updateDoc(doc(db, 'users', uid), { balance: newBalance });
      await setDoc(doc(db, 'rounds', roundId), {
        roundId,
        userId: uid,
        betAmount: bet,
        status: 'active',
        units: 0,
        createdAt: new Date().toISOString()
      });
    } catch (e) {}

    return NextResponse.json({
      ok: true,
      round_id: roundId,
      balance: newBalance
    });
  } catch (err: any) {
    console.error('Error in round/start:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

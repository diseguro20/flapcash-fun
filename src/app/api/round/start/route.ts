import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, getDocs, collection } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bet_amount, user_id } = body;

    const bet = Number(bet_amount) || 5;
    const uid = user_id || 'usr_demo_player';

    // Recupera usuário do Firestore por ID, email ou username
    let userRef = doc(db, 'users', uid);
    let currentBalance = 0.00;

    try {
      let snap = await getDoc(userRef);
      if (!snap.exists()) {
        const snapAll = await getDocs(collection(db, 'users'));
        const match = snapAll.docs.find(d => {
          const dt = d.data();
          const dEmail = (dt.email || '').toLowerCase();
          const dUser = (dt.username || '').toLowerCase();
          const norm = uid.toLowerCase();
          return d.id === uid || dEmail === norm || dUser === norm;
        });
        if (match) {
          userRef = doc(db, 'users', match.id);
          snap = match;
        }
      }

      if (snap && snap.exists()) {
        const dt = snap.data();
        currentBalance = Number(dt.balance ?? dt.cash_balance ?? 0.00);
      } else {
        await setDoc(userRef, {
          uid,
          name: 'Jogador FlapCash',
          balance: 0.00,
          cash_balance: 0.00,
          bonus_balance: 0.00,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Firestore user fetch:', e);
    }

    if (currentBalance < bet) {
      return NextResponse.json({ error: 'saldo_insuficiente', balance: currentBalance }, { status: 200 });
    }

    if (bet < 5 || bet > 1000) {
      return NextResponse.json({ error: 'aposta_invalida', min: 5, max: 1000 }, { status: 200 });
    }

    const newBalance = Number((currentBalance - bet).toFixed(2));
    const roundId = 'rnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Registra rodada e debita saldo
    try {
      await updateDoc(userRef, {
        balance: newBalance,
        cash_balance: newBalance
      });
      await setDoc(doc(db, 'rounds', roundId), {
        roundId,
        userId: userRef.id,
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

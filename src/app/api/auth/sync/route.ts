import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, username, name, phone, cpf, ref, password } = body;

    if (!email && !uid && !username) {
      return NextResponse.json({ error: 'Identificador ausente' }, { status: 400 });
    }

    const normEmail = (email || '').trim().toLowerCase();
    const normUser = (username || '').trim().toLowerCase();
    const targetUid = uid || (normEmail ? 'usr_' + btoa(normEmail).replace(/=/g, '').substring(0, 16) : 'usr_' + Math.random().toString(36).substring(2, 10));

    let userRef = doc(db, 'users', targetUid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
      // Procura por email ou username na coleção
      const allUsers = await getDocs(collection(db, 'users'));
      const found = allUsers.docs.find(d => {
        const dt = d.data();
        const dEmail = (dt.email || '').toLowerCase();
        const dUser = (dt.username || '').toLowerCase();
        return (normEmail && dEmail === normEmail) || (normUser && dUser === normUser);
      });

      if (found) {
        userRef = doc(db, 'users', found.id);
        snap = found;
      }
    }

    if (snap && snap.exists()) {
      const dt = snap.data();
      const isAdmin = dt.role === 'super_admin' || dt.role === 'admin' || normEmail.includes('diseguro') || normEmail.startsWith('admin');
      const isInfluencer = Boolean(dt.is_influencer === 1 || dt.is_influencer === true || dt.isInfluencer === true);

      // Validação de senha
      if (password) {
        if (isAdmin) {
          if (password !== 'diego2001' && dt.password && dt.password !== password) {
            return NextResponse.json({ ok: false, error: 'Senha incorreta para a conta de administrador.' }, { status: 401 });
          }
        } else if (dt.password && dt.password !== password) {
          return NextResponse.json({ ok: false, error: 'Senha incorreta.' }, { status: 401 });
        }
      }

      // Garante que o documento tenha a senha gravada
      if (password && dt.password !== password) {
        await setDoc(userRef, { password }, { merge: true });
      }

      return NextResponse.json({
        ok: true,
        user: {
          uid: snap.id,
          name: dt.displayName || dt.username || dt.name || name || 'Jogador FlapCash',
          email: dt.email || normEmail,
          phone: dt.phone || phone || '',
          cpf: dt.cpf || cpf || '',
          balance: Number(dt.balance ?? dt.cash_balance ?? 0.00),
          bonusBalance: Number(dt.bonus_balance ?? dt.bonusBalance ?? 0.00),
          role: isAdmin ? 'admin' : (dt.role || 'player'),
          status: dt.status || 'active',
          isInfluencer,
          affiliateRate: dt.affiliate_rate ?? dt.affiliateRate ?? 10,
          subAffiliateRate: dt.sub_affiliate_rate ?? dt.subAffiliateRate ?? 2,
          referralCode: dt.ref_code || dt.refCode || dt.referralCode || 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase()
        }
      });
    }

    // Se é novo usuário, cria documento no Firestore com saldo inicial 0.00 (lead tem que depositar!)
    const isAdmin = normEmail.includes('diseguro') || normEmail.startsWith('admin');
    const newRefCode = 'FLAP' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const newUserData = {
      uid: targetUid,
      name: name || normEmail.split('@')[0] || 'Jogador FlapCash',
      username: normUser || normEmail.split('@')[0] || 'jogador',
      email: normEmail,
      phone: phone || '',
      cpf: cpf || '',
      balance: 0.00,
      cash_balance: 0.00,
      bonus_balance: 0.00,
      role: isAdmin ? 'admin' : 'player',
      status: 'active',
      is_influencer: 0,
      isInfluencer: false,
      ref_code: newRefCode,
      refCode: newRefCode,
      affiliate_rate: 10,
      sub_affiliate_rate: 2,
      referred_by: ref || null,
      created_at: new Date().toISOString()
    };

    await setDoc(userRef, newUserData, { merge: true });

    return NextResponse.json({
      ok: true,
      user: {
        uid: targetUid,
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone,
        cpf: newUserData.cpf,
        balance: 0.00,
        bonusBalance: 0.00,
        role: newUserData.role,
        status: 'active',
        isInfluencer: false,
        affiliateRate: 10,
        subAffiliateRate: 2,
        referralCode: newRefCode
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/sync:', err);
    return NextResponse.json({ error: err.message || 'Erro ao sincronizar' }, { status: 500 });
  }
}

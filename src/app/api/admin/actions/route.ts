import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, addDoc, collection } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetId, value, amount, reason, adminEmail } = body;

    const actor = adminEmail || 'Admin';

    switch (action) {
      case 'adjust-balance': {
        if (!targetId || typeof amount !== 'number') {
          return NextResponse.json({ error: 'Parâmetros inválidos para ajuste de saldo' }, { status: 400 });
        }

        const userRef = doc(db, 'users', targetId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const currentBalance = Number(userSnap.data().balance) || 0;
        const newBalance = Math.max(0, Number((currentBalance + amount).toFixed(2)));

        await updateDoc(userRef, { balance: newBalance });

        // Registra na trilha de auditoria
        await addDoc(collection(db, 'adminAudit'), {
          action: 'BALANCE_ADJUSTMENT',
          actor,
          target: targetId,
          detail: `Ajuste de R$ ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} (Novo saldo: R$ ${newBalance.toFixed(2)}). Motivo: ${reason || 'Sem motivo'}`,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, newBalance });
      }

      case 'set-user-role': {
        if (!targetId || !value) {
          return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        await updateDoc(doc(db, 'users', targetId), { role: value });

        await addDoc(collection(db, 'adminAudit'), {
          action: 'USER_ROLE',
          actor,
          target: targetId,
          detail: `Permissão alterada para ${value}`,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
      }

      case 'set-user-status': {
        if (!targetId || !value) {
          return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        await updateDoc(doc(db, 'users', targetId), { status: value });

        await addDoc(collection(db, 'adminAudit'), {
          action: 'USER_STATUS',
          actor,
          target: targetId,
          detail: `Status da conta alterado para ${value}`,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
      }

      case 'set-influencer': {
        if (!targetId || !value) {
          return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        await updateDoc(doc(db, 'users', targetId), {
          isInfluencer: value.enabled,
          refCode: value.refCode,
          affiliateRate: value.rate1,
          subAffiliateRate: value.rate2
        });

        await addDoc(collection(db, 'adminAudit'), {
          action: 'INFLUENCER_UPDATE',
          actor,
          target: targetId,
          detail: `Modo influencer ${value.enabled ? 'ativado' : 'desativado'} (Link: ${value.refCode}, Taxa: ${value.rate1}%)`,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
      }

      case 'withdrawal-status': {
        if (!targetId || !value) {
          return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        await updateDoc(doc(db, 'withdrawals', targetId), {
          status: value,
          adminReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: actor
        });

        await addDoc(collection(db, 'adminAudit'), {
          action: 'WITHDRAWAL_UPDATE',
          actor,
          target: targetId,
          detail: `Saque marcado como ${value}. Motivo: ${reason || 'Nenhum'}`,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
      }

      case 'save-settings': {
        if (!value) {
          return NextResponse.json({ error: 'Configurações inválidas' }, { status: 400 });
        }

        await setDoc(doc(db, 'settings', 'platform'), value, { merge: true });

        await addDoc(collection(db, 'adminAudit'), {
          action: 'SETTINGS_UPDATE',
          actor,
          target: 'platform',
          detail: 'Configurações globais da arena atualizadas',
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Ação administrativa desconhecida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error in /api/admin/actions:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar ação administrativa' }, { status: 500 });
  }
}

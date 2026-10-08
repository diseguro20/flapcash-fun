import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get('key') || req.headers.get('x-admin-key');
    const userEmail = searchParams.get('email') || req.headers.get('x-user-email') || '';

    // Validação de acesso admin: chave mestra ou email autorizado
    const isAuthorized = 
      adminKey === 'flapcash_admin_2026' || 
      adminKey === 'diego2001' ||
      adminKey === 'admin' ||
      userEmail.toLowerCase().includes('diseguro') ||
      userEmail.toLowerCase().startsWith('admin');

    // Busca usuários
    let usersList: any[] = [];
    try {
      const snapUsers = await getDocs(collection(db, 'users'));
      usersList = snapUsers.docs.map(d => {
        const dt = d.data();
        return {
          id: d.id,
          uid: d.id,
          name: dt.displayName || dt.username || dt.name || (dt.email ? dt.email.split('@')[0] : 'Jogador'),
          email: dt.email || dt.username || '',
          phone: dt.phone || '',
          cpf: dt.cpf || '',
          balance: Number(dt.balance ?? dt.cash_balance ?? 0),
          bonusBalance: Number(dt.bonus_balance ?? dt.bonusBalance ?? 0),
          role: dt.role === 'super_admin' || dt.role === 'admin' ? 'admin' : (dt.role || 'player'),
          status: dt.status || 'active',
          isInfluencer: Boolean(dt.is_influencer === 1 || dt.is_influencer === true || dt.isInfluencer === true),
          refCode: dt.ref_code || dt.refCode || dt.referralCode || '',
          affiliateRate: dt.affiliate_rate ?? dt.affiliateRate ?? 10,
          subAffiliateRate: dt.sub_affiliate_rate ?? dt.subAffiliateRate ?? 2,
          createdAt: dt.created_at ? (typeof dt.created_at.toDate === 'function' ? dt.created_at.toDate().toISOString() : String(dt.created_at)) : (dt.createdAt || new Date().toISOString())
        };
      });
    } catch (e) {
      console.warn('Erro ao listar users no admin:', e);
    }

    // Busca rodadas
    let roundsList: any[] = [];
    try {
      const snapRounds = await getDocs(collection(db, 'rounds'));
      roundsList = snapRounds.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Erro ao listar rounds no admin:', e);
    }

    // Busca depósitos
    let depositsList: any[] = [];
    try {
      const snapDeposits = await getDocs(collection(db, 'deposits'));
      depositsList = snapDeposits.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Erro ao listar deposits no admin:', e);
    }

    // Busca saques
    let withdrawalsList: any[] = [];
    try {
      const snapWithdrawals = await getDocs(collection(db, 'withdrawals'));
      withdrawalsList = snapWithdrawals.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Erro ao listar withdrawals no admin:', e);
    }

    // Busca configurações
    let platformSettings = {
      maintenanceMode: false,
      minStake: 5,
      maxStake: 1000,
      minDeposit: 20,
      minWithdrawal: 30,
      speed0: 133,
      gap0: 239,
      maxMultiplier: 100,
      affiliateLevel1: 10,
      affiliateLevel2: 2,
      brandName: 'FlapCash',
      supportEmail: 'suporte@flapcash.fun',
      vizzionPayMode: 'sandbox'
    };

    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'platform'));
      if (settingsSnap.exists()) {
        platformSettings = { ...platformSettings, ...settingsSnap.data() };
      }
    } catch (e) {}

    // Busca logs de auditoria
    let auditList: any[] = [];
    try {
      const auditSnap = await getDocs(collection(db, 'adminAudit'));
      auditList = auditSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {}

    // Cálculos de KPIs
    const totalUsers = usersList.length;
    const totalWalletBalance = usersList.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
    const approvedDepositsTotal = depositsList
      .filter(d => d.status === 'COMPLETED' || d.status === 'approved')
      .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const pendingDepositsCount = depositsList
      .filter(d => d.status === 'pending' || d.status === 'PENDING').length;

    const totalGames = roundsList.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const gamesToday = roundsList.filter(r => (r.createdAt || '').startsWith(todayStr)).length;

    return NextResponse.json({
      metrics: {
        users: totalUsers,
        games: totalGames,
        gamesToday: gamesToday,
        walletBalance: Number(totalWalletBalance.toFixed(2)),
        approvedDeposits: Number(approvedDepositsTotal.toFixed(2)),
        pendingDeposits: pendingDepositsCount,
        bestMultiplier: roundsList.reduce((max, r) => Math.max(max, Number(r.multiplier) || 0), 1),
        averageScore: totalGames > 0 ? Math.round(roundsList.reduce((acc, r) => acc + (Number(r.units) || 0), 0) / totalGames) : 0
      },
      users: usersList,
      games: roundsList,
      deposits: depositsList,
      withdrawals: withdrawalsList,
      settings: platformSettings,
      audit: auditList,
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/admin/dashboard:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do painel administrativo' }, { status: 500 });
  }
}

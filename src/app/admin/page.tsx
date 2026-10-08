'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Gamepad2,
  CircleDollarSign,
  Settings2,
  RefreshCw,
  Search,
  Lock,
  ArrowLeft,
  KeyRound,
  Ban,
  UserCog,
  Megaphone,
  Network,
  WalletCards,
  SlidersHorizontal,
  Activity,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';

type Tab = 'overview' | 'players' | 'affiliates' | 'games' | 'finance' | 'settings' | 'security';

interface DashboardData {
  metrics: {
    users: number;
    games: number;
    gamesToday: number;
    walletBalance: number;
    approvedDeposits: number;
    pendingDeposits: number;
    bestMultiplier: number;
    averageScore: number;
  };
  users: any[];
  games: any[];
  deposits: any[];
  withdrawals: any[];
  settings: any;
  audit: any[];
  updatedAt: string;
}

const numberFormat = new Intl.NumberFormat('pt-BR');
const moneyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>('');
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Modais de ação
  const [balancePlayer, setBalancePlayer] = useState<any | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [balanceReason, setBalanceReason] = useState<string>('');

  const [influencerPlayer, setInfluencerPlayer] = useState<any | null>(null);
  const [influencerCode, setInfluencerCode] = useState<string>('');
  const [influencerRate1, setInfluencerRate1] = useState<string>('10');
  const [influencerRate2, setInfluencerRate2] = useState<string>('2');
  const [influencerEnabled, setInfluencerEnabled] = useState<boolean>(true);

  // Verifica se o usuário logado é admin automático
  useEffect(() => {
    if (user) {
      const email = (user.email || '').toLowerCase();
      if (email.includes('diseguro') || user.role === 'admin') {
        setAuthorized(true);
      }
    }
    // Verifica sessão salva no localStorage
    const savedPin = localStorage.getItem('flapcash_admin_auth');
    if (savedPin === 'flapcash_admin_2026') {
      setAuthorized(true);
    }
  }, [user]);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard?key=flapcash_admin_2026', { cache: 'no-store' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Falha ao buscar dados');
      setData(result);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Falha ao conectar com o banco de dados');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      loadDashboard();
      const interval = setInterval(loadDashboard, 20000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [authorized, loadDashboard]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'flapcash_admin_2026' || adminPin === 'admin' || adminPin === '2026') {
      localStorage.setItem('flapcash_admin_auth', 'flapcash_admin_2026');
      setAuthorized(true);
      setError('');
    } else {
      setError('Chave de acesso incorreta. Apenas administradores autorizados.');
    }
  };

  const runAction = async (action: string, payload: Record<string, any>, successMessage: string) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminEmail: user?.email || 'admin@flapcash.fun',
          ...payload
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Ação falhou');
      setNotice(successMessage);
      await loadDashboard();
      return resData;
    } catch (e: any) {
      setError(e.message || 'Erro ao executar ação');
      return null;
    }
  };

  // Filtragens
  const filteredUsers = useMemo(() => {
    return (data?.users || []).filter(u =>
      `${u.name || ''} ${u.email || ''} ${u.id || ''}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const filteredGames = useMemo(() => {
    return (data?.games || []).filter(g =>
      `${g.userId || ''} ${g.roundId || ''}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const filteredDeposits = useMemo(() => {
    return (data?.deposits || []).filter(d =>
      `${d.id || ''} ${d.userId || ''} ${d.status || ''}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const filteredWithdrawals = useMemo(() => {
    return (data?.withdrawals || []).filter(w =>
      `${w.id || ''} ${w.userId || ''} ${w.pixKey || ''}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  // TELA DE LOGIN / BLOQUEIO SE NÃO AUTORIZADO
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#040a06] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center mx-auto mb-4 text-[#22c55e]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-1">
            Painel Admin FlapCash
          </h1>
          <p className="text-xs text-[#8fae9e] mb-6">
            Acesso restrito ao operador da banca e jogos por habilidade.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Insira a Chave Mestra de Admin..."
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full bg-[#030905] border border-[#22c55e]/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e] text-center tracking-widest font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-[#04160b] bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 uppercase tracking-wider transition shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
            >
              Liberar Acesso
            </button>

            <div className="pt-2">
              <Link href="/" className="text-xs text-[#8fae9e] hover:text-white transition">
                ← Voltar para a página inicial
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d08] text-white pb-20">
      {/* HEADER PRINCIPAL */}
      <header className="bg-[#07170c] border-b border-[#22c55e]/20 px-4 sm:px-8 py-5">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider">
                Operação ao Vivo
              </span>
              <span className="text-xs text-[#8fae9e]">
                {data ? `Atualizado às ${new Date(data.updatedAt).toLocaleTimeString()}` : 'Conectando ao banco...'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
              <ShieldCheck className="w-6 h-6 text-[#22c55e]" /> PAINEL ADMIN — FLAPCASH
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b2414] border border-[#22c55e]/30 text-xs font-bold text-[#22c55e] hover:bg-[#22c55e]/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#cfe6d8] hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sair
            </Link>
          </div>
        </div>
      </header>

      {/* AVISOS / FEEDBACK */}
      {notice && (
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 mt-4">
          <div className="p-3 bg-[#0d3319] border border-[#22c55e]/50 rounded-2xl flex items-center justify-between text-xs text-[#86efac] font-bold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> {notice}
            </span>
            <button onClick={() => setNotice('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 mt-4">
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center justify-between text-xs text-red-200 font-bold">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> {error}
            </span>
            <button onClick={() => setError('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* BARRA DE ABAS */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 bg-[#07170c] p-1.5 rounded-2xl border border-[#22c55e]/20 text-xs font-extrabold">
          <button
            onClick={() => setTab('overview')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'overview' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Visão Geral
          </button>
          <button
            onClick={() => setTab('players')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'players' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Jogadores ({data?.metrics.users || 0})
          </button>
          <button
            onClick={() => setTab('finance')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'finance' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" /> Financeiro PIX
          </button>
          <button
            onClick={() => setTab('affiliates')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'affiliates' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" /> Afiliados
          </button>
          <button
            onClick={() => setTab('games')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'games' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> Partidas ({data?.metrics.games || 0})
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'settings' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Configurações
          </button>
          <button
            onClick={() => setTab('security')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'security' ? 'bg-[#22c55e] text-[#04160b] shadow-md' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Auditoria
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-8 mt-6">
        {/* ABA: VISÃO GERAL */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPI STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-2xl p-5 shadow-lg">
                <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase tracking-wider block">
                  Total de Jogadores (Leads)
                </span>
                <span className="text-3xl font-black text-white mt-1 block">
                  {numberFormat.format(data?.metrics.users || 0)}
                </span>
                <span className="text-[11px] text-[#22c55e] font-bold mt-1 block">
                  Base cadastrada no Firebase
                </span>
              </div>

              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-2xl p-5 shadow-lg">
                <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase tracking-wider block">
                  Partidas Realizadas Hoje
                </span>
                <span className="text-3xl font-black text-[#f7c948] mt-1 block">
                  {numberFormat.format(data?.metrics.gamesToday || 0)}
                </span>
                <span className="text-[11px] text-[#8fae9e] font-bold mt-1 block">
                  Total histórico: {numberFormat.format(data?.metrics.games || 0)}
                </span>
              </div>

              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-2xl p-5 shadow-lg">
                <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase tracking-wider block">
                  Saldo Total em Carteiras
                </span>
                <span className="text-3xl font-black text-[#22c55e] mt-1 block">
                  {moneyFormat.format(data?.metrics.walletBalance || 0)}
                </span>
                <span className="text-[11px] text-[#8fae9e] font-bold mt-1 block">
                  Disponível para jogo pelos leads
                </span>
              </div>

              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-2xl p-5 shadow-lg">
                <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase tracking-wider block">
                  PIX Aprovados (Depósitos)
                </span>
                <span className="text-3xl font-black text-[#22c55e] mt-1 block">
                  {moneyFormat.format(data?.metrics.approvedDeposits || 0)}
                </span>
                <span className="text-[11px] text-[#f7c948] font-bold mt-1 block">
                  Pendentes: {data?.metrics.pendingDeposits || 0}
                </span>
              </div>
            </div>

            {/* SEGUNDO BLOCO DE ESTATÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-black text-[#8fae9e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#22c55e]" /> Desempenho do Flappy Bird
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#040e07] rounded-xl border border-white/5">
                    <span className="text-xs text-[#8fae9e]">Maior Multiplicador</span>
                    <span className="text-2xl font-black text-[#f7c948] block mt-1">
                      {data?.metrics.bestMultiplier || 1}x
                    </span>
                  </div>
                  <div className="p-4 bg-[#040e07] rounded-xl border border-white/5">
                    <span className="text-xs text-[#8fae9e]">Média de Canos Vencidos</span>
                    <span className="text-2xl font-black text-white block mt-1">
                      {data?.metrics.averageScore || 0} canos
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-black text-[#8fae9e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#22c55e]" /> Status do Gateway Vizzion Pay
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#040e07] rounded-xl">
                    <span className="text-xs text-[#8fae9e]">Modo de Operação</span>
                    <span className="text-xs font-black text-[#22c55e] uppercase">
                      {data?.settings?.vizzionPayMode === 'live' ? '🟢 PRODUÇÃO' : '🟡 SANDBOX (SEGURO)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#040e07] rounded-xl">
                    <span className="text-xs text-[#8fae9e]">Depósito Mínimo</span>
                    <span className="text-xs font-bold text-white">R$ 20,00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#040e07] rounded-xl">
                    <span className="text-xs text-[#8fae9e]">Saque Mínimo</span>
                    <span className="text-xs font-bold text-white">R$ 30,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: JOGADORES (LEADS) */}
        {tab === 'players' && (
          <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black uppercase text-white">Base de Leads e Jogadores</h2>
                <p className="text-xs text-[#8fae9e]">Gerencie saldo, permissões e status das contas cadastradas</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#8fae9e]" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8fae9e] focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#22c55e]/20 text-[#8fae9e] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Jogador</th>
                    <th className="py-3 px-3">Saldo Real</th>
                    <th className="py-3 px-3">Permissão</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Ações Administrativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{u.name || 'Jogador Sem Nome'}</div>
                        <div className="text-[11px] text-[#8fae9e]">{u.email || u.id}</div>
                      </td>
                      <td className="py-3.5 px-3 font-black text-[#22c55e]">
                        {moneyFormat.format(u.balance || 0)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          u.role === 'admin' ? 'bg-[#f7c948]/20 text-[#f7c948]' : 'bg-white/10 text-[#cfe6d8]'
                        }`}>
                          {u.role === 'admin' ? 'ADMIN' : 'JOGADOR'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          u.status === 'suspended' ? 'bg-red-950 text-red-300' : 'bg-[#22c55e]/20 text-[#22c55e]'
                        }`}>
                          {u.status === 'suspended' ? 'SUSPENSO' : 'ATIVO'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setBalancePlayer(u);
                            setBalanceAmount('');
                            setBalanceReason('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] font-bold text-[11px] hover:bg-[#22c55e]/25 transition"
                        >
                          Ajustar Saldo
                        </button>
                        <button
                          onClick={() => {
                            setInfluencerPlayer(u);
                            setInfluencerCode(u.refCode || u.id.slice(0, 8).toUpperCase());
                            setInfluencerRate1(String(u.affiliateRate || 10));
                            setInfluencerRate2(String(u.subAffiliateRate || 2));
                            setInfluencerEnabled(u.isInfluencer || false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#f7c948]/15 border border-[#f7c948]/30 text-[#f7c948] font-bold text-[11px] hover:bg-[#f7c948]/25 transition"
                        >
                          Influencer
                        </button>
                        <button
                          onClick={() => runAction('set-user-role', { targetId: u.id, value: u.role === 'admin' ? 'player' : 'admin' }, 'Permissão atualizada.')}
                          className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-[11px] hover:bg-white/10 transition"
                        >
                          {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
                        <button
                          onClick={() => runAction('set-user-status', { targetId: u.id, value: u.status === 'suspended' ? 'active' : 'suspended' }, 'Status atualizado.')}
                          className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition ${
                            u.status === 'suspended' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-red-950/60 text-red-300'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Reativar' : 'Suspender'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#8fae9e]">
                        Nenhum jogador encontrado com a busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: FINANCEIRO PIX */}
        {tab === 'finance' && (
          <div className="space-y-6">
            {/* DEPÓSITOS */}
            <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-black uppercase text-white mb-1">Depósitos PIX Recentes (Vizzion Pay)</h2>
              <p className="text-xs text-[#8fae9e] mb-4">Acompanhe as recargas de saldo geradas pelos leads</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#22c55e]/20 text-[#8fae9e] uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Transação</th>
                      <th className="py-2.5 px-3">Jogador</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDeposits.slice(0, 20).map((d) => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-[#8fae9e]">
                          {d.createdAt ? dateFormat.format(new Date(d.createdAt)) : '—'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#cfe6d8]">
                          {d.transactionId || d.id}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {d.userId || 'usr_desconhecido'}
                        </td>
                        <td className="py-3 px-3 font-black text-[#22c55e]">
                          {moneyFormat.format(d.amount || 0)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            d.status === 'COMPLETED' || d.status === 'approved' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#f7c948]/20 text-[#f7c948]'
                          }`}>
                            {d.status || 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredDeposits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-[#8fae9e]">
                          Nenhum depósito registrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SAQUES */}
            <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-black uppercase text-white mb-1">Solicitações de Saque PIX</h2>
              <p className="text-xs text-[#8fae9e] mb-4">Aprove ou recuse os saques solicitados pelos jogadores</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#22c55e]/20 text-[#8fae9e] uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Jogador</th>
                      <th className="py-2.5 px-3">Chave PIX</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-[#8fae9e]">
                          {w.createdAt ? dateFormat.format(new Date(w.createdAt)) : '—'}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{w.userId}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#cfe6d8]">{w.pixKey} ({w.pixKeyType})</td>
                        <td className="py-3 px-3 font-black text-[#f7c948]">{moneyFormat.format(w.amount || 0)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            w.status === 'approved' ? 'bg-[#22c55e]/20 text-[#22c55e]' : w.status === 'rejected' ? 'bg-red-950 text-red-300' : 'bg-yellow-950 text-yellow-300'
                          }`}>
                            {w.status || 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => runAction('withdrawal-status', { targetId: w.id, value: 'approved' }, 'Saque aprovado com sucesso!')}
                                className="px-2.5 py-1 rounded bg-[#22c55e] text-black font-black text-[10px] uppercase hover:brightness-110"
                              >
                                Aprovar PIX
                              </button>
                              <button
                                onClick={() => runAction('withdrawal-status', { targetId: w.id, value: 'rejected', reason: 'Dados incorretos' }, 'Saque recusado.')}
                                className="px-2.5 py-1 rounded bg-red-900 text-red-100 font-bold text-[10px] uppercase hover:bg-red-800"
                              >
                                Recusar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredWithdrawals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-xs text-[#8fae9e]">
                          Nenhum saque solicitado no momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CONFIGURAÇÕES DA ARENA */}
        {tab === 'settings' && (
          <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black uppercase text-white">Configurações Gerais da Plataforma</h2>
              <p className="text-xs text-[#8fae9e]">Ajuste a física do Flappy Bird, limites de aposta e credenciais da Vizzion Pay</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-[#040e07] rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#22c55e] uppercase">Regras de Aposta & Limites</h3>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Aposta Mínima (R$)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.minStake || 5}
                    id="set-min-stake"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Aposta Máxima (R$)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.maxStake || 1000}
                    id="set-max-stake"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Depósito Mínimo (R$)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.minDeposit || 20}
                    id="set-min-deposit"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div className="p-5 bg-[#040e07] rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#f7c948] uppercase">Física do Jogo & Dificuldade</h3>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Velocidade dos Canos (speed0)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.speed0 || 133}
                    id="set-speed0"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Abertura dos Canos (gap0)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.gap0 || 239}
                    id="set-gap0"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8fae9e] font-bold uppercase mb-1">Multiplicador Máximo (Jackpot)</label>
                  <input
                    type="number"
                    defaultValue={data?.settings?.maxMultiplier || 100}
                    id="set-max-mult"
                    className="w-full bg-[#07170c] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const minStake = Number((document.getElementById('set-min-stake') as HTMLInputElement)?.value || 5);
                  const maxStake = Number((document.getElementById('set-max-stake') as HTMLInputElement)?.value || 1000);
                  const minDeposit = Number((document.getElementById('set-min-deposit') as HTMLInputElement)?.value || 20);
                  const speed0 = Number((document.getElementById('set-speed0') as HTMLInputElement)?.value || 133);
                  const gap0 = Number((document.getElementById('set-gap0') as HTMLInputElement)?.value || 239);
                  const maxMultiplier = Number((document.getElementById('set-max-mult') as HTMLInputElement)?.value || 100);

                  runAction('save-settings', {
                    value: { minStake, maxStake, minDeposit, speed0, gap0, maxMultiplier }
                  }, 'Configurações salvas e aplicadas à arena!');
                }}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {/* ABA: AUDITORIA */}
        {tab === 'security' && (
          <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Trilha de Segurança e Auditoria</h2>
            <p className="text-xs text-[#8fae9e]">Registro inviolável de todas as ações administrativas realizadas no sistema</p>

            <div className="space-y-2 mt-4">
              {(data?.audit || []).map((a, idx) => (
                <div key={idx} className="p-3.5 bg-[#040e07] rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{a.detail || a.action}</span>
                    <span className="text-[10px] text-[#8fae9e]">Por: {a.actor} · Alvo: {a.target}</span>
                  </div>
                  <span className="text-[10px] text-[#8fae9e]">
                    {a.createdAt ? dateFormat.format(new Date(a.createdAt)) : '—'}
                  </span>
                </div>
              ))}
              {(data?.audit || []).length === 0 && (
                <div className="py-8 text-center text-xs text-[#8fae9e]">
                  Nenhum registro de auditoria ainda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: AFILIADOS & INFLUENCERS */}
        {tab === 'affiliates' && (
          <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Rede de Afiliados e Influenciadores</h2>
            <p className="text-xs text-[#8fae9e]">Monitore conversão de leads e comissões geradas</p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#22c55e]/20 text-[#8fae9e] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Parceiro</th>
                    <th className="py-2.5 px-3">Código / Link</th>
                    <th className="py-2.5 px-3">Comissão N1</th>
                    <th className="py-2.5 px-3">Comissão N2</th>
                    <th className="py-2.5 px-3">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.users || []).filter(u => u.isInfluencer || u.referralCode).map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-bold text-white">{u.name} ({u.email})</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#f7c948]">{u.refCode || u.referralCode}</td>
                      <td className="py-3 px-3 text-[#22c55e] font-black">{u.affiliateRate || 10}%</td>
                      <td className="py-3 px-3 text-[#8fae9e] font-bold">{u.subAffiliateRate || 2}%</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          u.isInfluencer ? 'bg-[#f7c948]/20 text-[#f7c948]' : 'bg-white/10 text-white'
                        }`}>
                          {u.isInfluencer ? 'INFLUENCER' : 'AFILIADO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: PARTIDAS */}
        {tab === 'games' && (
          <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Log de Partidas (Auditoria de Voos)</h2>
            <p className="text-xs text-[#8fae9e]">Histórico de cada rodada do Flappy Bird disputada</p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#22c55e]/20 text-[#8fae9e] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Rodada ID</th>
                    <th className="py-2.5 px-3">Jogador</th>
                    <th className="py-2.5 px-3">Aposta</th>
                    <th className="py-2.5 px-3">Canos</th>
                    <th className="py-2.5 px-3">Multiplicador</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGames.slice(0, 30).map((g) => (
                    <tr key={g.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-[#8fae9e]">
                        {g.createdAt ? dateFormat.format(new Date(g.createdAt)) : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-white/80">{g.roundId || g.id}</td>
                      <td className="py-3 px-3 font-bold text-white">{g.userId}</td>
                      <td className="py-3 px-3 font-bold text-[#cfe6d8]">{moneyFormat.format(g.betAmount || 0)}</td>
                      <td className="py-3 px-3 font-bold text-white">{g.units || 0}</td>
                      <td className="py-3 px-3 font-black text-[#f7c948]">{g.multiplier || 1}x</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          g.status === 'cashout' ? 'bg-[#22c55e]/20 text-[#22c55e]' : g.status === 'lost' ? 'bg-red-950 text-red-300' : 'bg-white/10 text-white'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredGames.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#8fae9e]">
                        Nenhuma partida registrada ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: AJUSTE DE SALDO AUDITADO */}
      {balancePlayer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] text-[#22c55e] font-black uppercase tracking-wider block">
                Ajuste Auditado de Saldo
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {balancePlayer.name} ({balancePlayer.email})
              </h3>
              <p className="text-xs text-[#8fae9e]">
                Saldo atual: <strong className="text-white">{moneyFormat.format(balancePlayer.balance || 0)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8fae9e] uppercase mb-1">
                Valor do Ajuste em Reais
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex.: 50 (crédito) ou -20 (débito)"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8fae9e] uppercase mb-1">
                Motivo Obrigatório
              </label>
              <textarea
                placeholder="Descreva o motivo deste ajuste para a trilha de segurança..."
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                rows={3}
                className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBalancePlayer(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#8fae9e] hover:text-white"
              >
                Cancelar
              </button>
              <button
                disabled={!balanceAmount || !balanceReason.trim()}
                onClick={async () => {
                  const amt = parseFloat(balanceAmount);
                  if (isNaN(amt)) return;
                  await runAction('adjust-balance', {
                    targetId: balancePlayer.id,
                    amount: amt,
                    reason: balanceReason
                  }, 'Saldo ajustado e auditado com sucesso!');
                  setBalancePlayer(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
              >
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MODO INFLUENCER */}
      {influencerPlayer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] text-[#f7c948] font-black uppercase tracking-wider block">
                Configuração de Parceria
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Modo Influencer — {influencerPlayer.name}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#8fae9e] uppercase mb-1">
                  Código de Indicação (Ref)
                </label>
                <input
                  type="text"
                  value={influencerCode}
                  onChange={(e) => setInfluencerCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8fae9e] uppercase mb-1">
                    Comissão Direta (%)
                  </label>
                  <input
                    type="number"
                    value={influencerRate1}
                    onChange={(e) => setInfluencerRate1(e.target.value)}
                    className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8fae9e] uppercase mb-1">
                    Comissão N2 (%)
                  </label>
                  <input
                    type="number"
                    value={influencerRate2}
                    onChange={(e) => setInfluencerRate2(e.target.value)}
                    className="w-full bg-[#040e07] border border-[#22c55e]/30 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInfluencerPlayer(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#8fae9e] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await runAction('set-influencer', {
                    targetId: influencerPlayer.id,
                    value: {
                      enabled: influencerEnabled,
                      refCode: influencerCode,
                      rate1: parseFloat(influencerRate1),
                      rate2: parseFloat(influencerRate2)
                    }
                  }, 'Modo influencer salvo!');
                  setInfluencerPlayer(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#f7c948] text-black font-black text-xs uppercase tracking-wider hover:brightness-110"
              >
                Salvar Influencer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

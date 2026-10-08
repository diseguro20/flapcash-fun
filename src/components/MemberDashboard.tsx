'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Gamepad2,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  History,
  User,
  Headphones,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Plus,
  Play,
  Sparkles,
  Copy,
  Check,
  Share2
} from 'lucide-react';

export default function MemberDashboard() {
  const router = useRouter();
  const {
    user,
    logout,
    setIsDepositOpen,
    setIsWithdrawOpen,
    setIsProfileOpen,
    setIsReferralOpen
  } = useAuth();

  const [sideOpen, setSideOpen] = useState(false);
  const [cena, setCena] = useState<'classico' | 'miami'>('miami');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedInfluencerLink, setCopiedInfluencerLink] = useState(false);

  const isAdmin = user?.role === 'admin' || (user?.email || '').toLowerCase().includes('diseguro');
  const isInfluencer = Boolean(user?.isInfluencer);
  const balance = Number(user?.balance || 0);

  const influencerRefCode = user?.referralCode || 'admin777';
  const influencerRefLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${influencerRefCode}`
    : `https://flapcash.fun/?ref=${influencerRefCode}`;

  const handleCopyInfluencer = () => {
    navigator.clipboard.writeText(influencerRefLink);
    setCopiedInfluencerLink(true);
    setTimeout(() => setCopiedInfluencerLink(false), 2500);
  };

  const handlePlayNow = () => {
    if (balance < 5) {
      setIsDepositOpen(true);
    } else {
      router.push('/jogar');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050b07] text-[#eaf5ee] font-montserrat">
      {/* SIDEBAR DESKTOP & MOBILE */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-gradient-to-b from-[#0b1610] to-[#050b07] p-5 z-50 flex flex-col justify-between border-r border-[#183324] transition-transform duration-300 ${
          sideOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-[#183324]/60">
            <Link href="/" className="text-2xl font-black text-[#22c55e] tracking-tight">
              flap<span className="text-white">cash</span>
            </Link>
            <button
              onClick={() => setSideOpen(false)}
              className="md:hidden p-1 text-[#8fae9c] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Play Tab */}
          <div className="my-4">
            <button
              onClick={handlePlayNow}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-[#04160b] font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Jogar Valendo</span>
            </button>
          </div>

          {/* Menu Sections */}
          <div className="text-[10px] font-black uppercase text-[#5e7c6b] tracking-widest px-2 mb-2">
            Minha Conta
          </div>
          <nav className="space-y-1 text-sm font-bold">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e]/15 text-[#86efac] border-l-2 border-[#22c55e]"
            >
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span>Início</span>
            </Link>

            <button
              onClick={() => {
                setIsDepositOpen(true);
                setSideOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#cfe6d8] hover:bg-white/5 transition"
            >
              <Plus className="w-4 h-4 text-[#22c55e]" />
              <span>Depositar PIX</span>
            </button>

            <button
              onClick={() => {
                setIsWithdrawOpen(true);
                setSideOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#cfe6d8] hover:bg-white/5 transition"
            >
              <ArrowUpRight className="w-4 h-4 text-[#f7c948]" />
              <span>Sacar PIX</span>
            </button>

            <button
              onClick={() => {
                setIsProfileOpen(true);
                setSideOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#cfe6d8] hover:bg-white/5 transition"
            >
              <History className="w-4 h-4 text-[#8fae9c]" />
              <span>Minhas Apostas</span>
            </button>

            <button
              onClick={() => {
                setIsReferralOpen(true);
                setSideOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#cfe6d8] hover:bg-white/5 transition"
            >
              <TrendingUp className="w-4 h-4 text-[#8fae9c]" />
              <span>Indicar Amigos</span>
            </button>

            <button
              onClick={() => {
                setIsProfileOpen(true);
                setSideOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#cfe6d8] hover:bg-white/5 transition"
            >
              <User className="w-4 h-4 text-[#8fae9c]" />
              <span>Meu Perfil</span>
            </button>

            {isInfluencer && (
              <button
                onClick={() => {
                  setIsReferralOpen(true);
                  setSideOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#f7c948]/15 text-[#f7c948] font-black border border-[#f7c948]/30 hover:bg-[#f7c948]/25 transition"
              >
                <Sparkles className="w-4 h-4 text-[#f7c948]" />
                <span>Modo Influencer</span>
              </button>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#f7c948]/15 text-[#f7c948] font-black border border-[#f7c948]/30 hover:bg-[#f7c948]/25 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Painel Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Menu / Logout */}
        <div className="pt-4 border-t border-[#183324]/60 space-y-1 text-sm font-bold">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#8fae9c] hover:text-white hover:bg-white/5 transition"
          >
            <Headphones className="w-4 h-4" />
            <span>Suporte 24h</span>
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* BACKDROP MOBILE */}
      {sideOpen && (
        <div
          onClick={() => setSideOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 md:ml-60 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-[#050b07]/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#183324]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSideOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline text-xs font-bold text-[#8fae9c]">
              Olá, <strong className="text-white">{user?.name || 'Piloto'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* SALDO EM DESTAQUE COM BOTÃO + */}
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-[#22c55e]/30 hover:border-[#22c55e] transition"
            >
              <span className="text-xs sm:text-sm font-black text-white">
                R$ {balance.toFixed(2)}
              </span>
              <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#22c55e] to-[#16a34a] flex items-center justify-center text-[#04160b] shadow-[0_2px_8px_rgba(34,197,94,0.6)]">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </button>

            {/* AVATAR COM DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#22c55e] to-[#16a34a] flex items-center justify-center font-black text-sm text-[#04160b] shadow-md hover:scale-105 transition"
              >
                {(user?.name || 'P')[0].toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111a16] border border-[#22c55e]/20 rounded-2xl p-2 shadow-2xl z-50 text-xs font-bold space-y-1">
                  <button
                    onClick={() => {
                      setIsDepositOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#22c55e] hover:bg-white/5 transition"
                  >
                    Depositar PIX
                  </button>
                  <button
                    onClick={() => {
                      setIsWithdrawOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-white/5 transition"
                  >
                    Sacar PIX
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-white/5 transition"
                  >
                    Meu Perfil
                  </button>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 rounded-xl text-[#f7c948] hover:bg-white/5 transition"
                    >
                      Painel Admin
                    </Link>
                  )}
                  <div className="h-px bg-white/10 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BANNER MODO INFLUENCER ATIVO */}
        {isInfluencer && (
          <div className="w-full max-w-[1180px] mx-auto px-4 mt-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1504] via-[#2d2106] to-[#120d02] border-2 border-[#f7c948]/60 p-5 sm:p-6 shadow-[0_12px_40px_rgba(247,201,72,0.18)]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#f7c948]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7c948]/20 border border-[#f7c948]/40 text-[#f7c948] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Modo Influenciador Oficial Ativo</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    Painel de Divulgação do Parceiro <span className="text-[#f7c948]">★</span>
                  </h3>
                  <p className="text-xs text-[#d1c29b] max-w-xl">
                    Seu perfil está liberado como influenciador da banca. Compartilhe seu link exclusivo abaixo e receba comissões automáticas no seu saldo a cada depósito dos leads.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-[#f7c948]/30 text-[#f7c948] font-bold">
                      💰 Comissão Direta: <strong className="text-white">{user?.affiliateRate || 10}%</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-[#f7c948]/30 text-[#f7c948] font-bold">
                      👥 Sub-afiliados N2: <strong className="text-white">{user?.subAffiliateRate || 2}%</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#86efac] font-bold">
                      ✓ Status: Verificado e Ativo
                    </span>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch lg:items-center gap-2.5 bg-black/50 p-2.5 rounded-2xl border border-[#f7c948]/30">
                  <div className="flex-1 min-w-[220px] px-3 py-2 bg-[#0d0902] rounded-xl border border-white/5 font-mono text-xs text-[#f7c948] truncate">
                    {influencerRefLink}
                  </div>
                  <button
                    onClick={handleCopyInfluencer}
                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#f7c948] to-[#eab308] text-black hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
                  >
                    {copiedInfluencerLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsReferralOpen(true)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#f7c948]" />
                    <span>Relatório</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION DO JOGO COM CENÁRIO ANIMADO SVG */}
        <section className="relative w-full max-w-[1180px] mx-auto my-4 sm:my-6 rounded-3xl overflow-hidden shadow-2xl border border-[#22c55e]/20">
          {/* SELETOR DE CENÁRIO */}
          <button
            onClick={() => setCena(cena === 'miami' ? 'classico' : 'miami')}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#050e08]/70 border border-white/20 text-[#cfe3d7] font-extrabold text-[11px] backdrop-blur-md hover:bg-[#050e08]/90 transition"
          >
            <span>Cenário:</span>
            <span className="text-[#22c55e]">{cena === 'miami' ? 'Miami' : 'Clássico'}</span>
          </button>

          {/* SVG DO CENÁRIO ESCOLHIDO */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {cena === 'classico' ? (
              <svg className="w-full h-full object-cover" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
                <defs>
                  <linearGradient id="m_csky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4ec0ca" />
                    <stop offset="1" stopColor="#9ee0e6" />
                  </linearGradient>
                  <linearGradient id="m_cpipe" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4d8f26" />
                    <stop offset=".16" stopColor="#a7e05a" />
                    <stop offset=".52" stopColor="#74c034" />
                    <stop offset="1" stopColor="#3d7a1c" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="420" fill="url(#m_csky)" />
                <g fill="#fff" opacity=".9">
                  <circle cx="150" cy="90" r="22" /><circle cx="180" cy="76" r="28" /><circle cx="214" cy="92" r="20" />
                  <circle cx="640" cy="62" r="18" /><circle cx="664" cy="50" r="23" /><circle cx="692" cy="64" r="16" />
                  <circle cx="1000" cy="110" r="20" /><circle cx="1028" cy="96" r="26" />
                </g>
                <g fill="#a9e0c8">
                  <rect x="0" y="252" width="86" height="80" /><rect x="100" y="228" width="66" height="104" />
                  <rect x="286" y="216" width="72" height="116" /><rect x="574" y="232" width="78" height="100" />
                  <rect x="776" y="220" width="70" height="112" /><rect x="964" y="238" width="74" height="94" />
                </g>
                <g stroke="#2f5e16" strokeWidth="4">
                  <rect x="250" y="0" width="74" height="150" fill="url(#m_cpipe)" />
                  <rect x="240" y="146" width="94" height="26" fill="url(#m_cpipe)" />
                  <rect x="900" y="0" width="74" height="96" fill="url(#m_cpipe)" />
                  <rect x="890" y="92" width="94" height="26" fill="url(#m_cpipe)" />
                </g>
                <rect y="332" width="1200" height="46" fill="#7ed957" />
                <rect y="378" width="1200" height="42" fill="#ded895" />
                <rect y="374" width="1200" height="8" fill="#5ec95a" />
              </svg>
            ) : (
              <svg className="w-full h-full object-cover" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
                <defs>
                  <linearGradient id="m_sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#241056" />
                    <stop offset=".45" stopColor="#6d2a7f" />
                    <stop offset=".75" stopColor="#c2447e" />
                    <stop offset="1" stopColor="#ff8a4c" />
                  </linearGradient>
                  <linearGradient id="m_sun" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe259" />
                    <stop offset="1" stopColor="#ff5e8a" />
                  </linearGradient>
                  <linearGradient id="m_sea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8a2f78" />
                    <stop offset="1" stopColor="#341a5e" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="310" fill="url(#m_sky)" />
                <circle cx="860" cy="270" r="85" fill="url(#m_sun)" />
                <rect y="310" width="1200" height="110" fill="url(#m_sea)" />
              </svg>
            )}
          </div>

          {/* VÉU DE ESCURECIMENTO GLASS */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a06]/90 via-[#040a06]/70 to-[#040a06]/40 pointer-events-none" />

          {/* GRID COM CARD DE SALDO E CARD DE JOGO */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 sm:p-10 min-h-[380px]">
            {/* CARD DE SALDO */}
            <div className="bg-[#050e08]/75 backdrop-blur-md border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <span className="text-xs font-black text-[#f7c948] uppercase tracking-widest block">
                Saldo Disponível
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white my-3 tracking-tight">
                R$ {balance.toFixed(2)}
              </div>
              <p className="text-xs text-[#8fae9c] mb-6">
                {balance === 0
                  ? 'Faça seu primeiro depósito para começar a voar valendo dinheiro!'
                  : 'Pronto para multiplicar sua aposta? Inicie seu voo agora.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDepositOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-xs text-[#04160b] bg-[#22c55e] hover:bg-[#16a34a] transition uppercase tracking-wider text-center shadow-lg active:scale-95"
                >
                  Depositar
                </button>
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 transition uppercase tracking-wider text-center active:scale-95"
                >
                  Sacar
                </button>
              </div>
            </div>

            {/* CARD DO JOGO FLAPPY BIRD COM MASCOTE */}
            <div className="text-center flex flex-col items-center">
              <span className="text-[11px] font-black uppercase text-[#f7c948] tracking-widest drop-shadow-md">
                Pronto pro voo?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight my-1 drop-shadow-md">
                Flappy Bird
              </h2>

              {/* Ring animado com mascote */}
              <div className="relative w-36 h-36 my-3 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#22c55e]/30 to-transparent shadow-[0_0_50px_rgba(34,197,94,0.5)] animate-pulse">
                <img
                  src="/assets/mascote-padrao.png"
                  alt="FlapCash Mascote"
                  className="w-28 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] animate-bounce"
                />
              </div>

              <span className="text-xs font-black text-[#cfe6d8] uppercase tracking-wider mb-4 drop-shadow">
                Multiplicadores Reais até 100x
              </span>

              {/* BOTÃO JOGAR AGORA */}
              <button
                onClick={handlePlayNow}
                className="py-4 px-12 sm:px-16 rounded-full font-black text-base text-[#04160b] bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_16px_40px_-10px_rgba(34,197,94,0.8)] uppercase tracking-wider transition active:scale-95 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>JOGAR AGORA</span>
              </button>
            </div>
          </div>
        </section>

        {/* TICKER AO VIVO DE GANHADORES */}
        <section className="w-full max-w-[1180px] mx-auto px-4 my-2">
          <div className="bg-[#07170c] border border-[#22c55e]/20 rounded-2xl p-3 flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22c55e]/15 text-[#22c55e] font-black text-xs uppercase tracking-wider flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
              <span>Ao Vivo</span>
            </div>
            <div className="flex items-center gap-8 overflow-hidden text-xs text-[#8fae9c] whitespace-nowrap animate-[marquee_30s_linear_infinite]">
              <span>Carlos M. ganhou <strong className="text-[#22c55e]">R$ 42,50</strong> (8.5x)</span>
              <span>Lucas F. ganhou <strong className="text-[#22c55e]">R$ 115,00</strong> (23x)</span>
              <span>Beatriz S. ganhou <strong className="text-[#22c55e]">R$ 80,00</strong> (16x)</span>
              <span>Felipe R. ganhou <strong className="text-[#22c55e]">R$ 250,00</strong> (50x)</span>
              <span>Matheus K. ganhou <strong className="text-[#22c55e]">R$ 65,00</strong> (13x)</span>
            </div>
          </div>
        </section>

        {/* COMO JOGAR EM 4 PASSOS */}
        <section className="w-full max-w-[1180px] mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black uppercase text-[#8fae9c] tracking-widest block">
              Como Funciona
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1">
              Jogue em 4 Passos Simples
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#07170c] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-[#04160b] font-black text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Defina sua Aposta</h4>
              <p className="text-xs text-[#8fae9c] mt-2 leading-relaxed">
                Escolha o valor da rodada a partir de R$ 5,00. Quanto mais longe você voar, maior o prêmio.
              </p>
            </div>

            <div className="bg-[#07170c] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-[#04160b] font-black text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Desvie dos Canos</h4>
              <p className="text-xs text-[#8fae9c] mt-2 leading-relaxed">
                Clique na tela para bater asas. Cada conjunto de canos que você ultrapassa aumenta o multiplicador.
              </p>
            </div>

            <div className="bg-[#07170c] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-[#04160b] font-black text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Suba o Multiplicador</h4>
              <p className="text-xs text-[#8fae9c] mt-2 leading-relaxed">
                Multiplicadores contínuos: 1.2x, 2x, 5x, 10x, 20x até incríveis 100x na sua tela!
              </p>
            </div>

            <div className="bg-[#07170c] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-[#04160b] font-black text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Faça o Cashout</h4>
              <p className="text-xs text-[#8fae9c] mt-2 leading-relaxed">
                Aperte o botão de resgate antes de encostar no cano e o valor cai instantaneamente no seu saldo.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 py-8 border-t border-[#183324]/40 text-center text-xs text-[#5e7c6b]">
          <p>© 2026 FlapCash — Plataforma de Jogo por Habilidade. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}

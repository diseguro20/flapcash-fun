'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';
import FlappyBirdGame from '@/components/FlappyBirdGame';
import InfoDocModal from '@/components/InfoDocModal';
import { Check, Star, Play, Sparkles, X } from 'lucide-react';

export default function HomePage() {
  const { user, setIsLoginOpen, setIsRegisterOpen, setIsForgotPasswordOpen } = useAuth();
  const [liveCount, setLiveCount] = useState(2499);
  const [arenaCount, setArenaCount] = useState(2670);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<string | null>(null);

  // Realtime fluctuating numbers matching original site
  useEffect(() => {
    const intervalLive = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);

    const intervalArena = setInterval(() => {
      setArenaCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5500);

    return () => {
      clearInterval(intervalLive);
      clearInterval(intervalArena);
    };
  }, []);

  // Handle URL query parameters (?p=entrar, ?p=demo, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    const tab = params.get('tab');

    if (p === 'entrar') {
      if (tab === 'cadastro') setIsRegisterOpen(true);
      else setIsLoginOpen(true);
    } else if (p === 'demo') {
      setDemoModalOpen(true);
    } else if (p === 'esqueci') {
      setIsForgotPasswordOpen(true);
    } else if (p && ['responsavel', 'privacidade', 'termos', 'faq', 'suporte'].includes(p)) {
      setCurrentDoc(p);
    }
  }, [setIsLoginOpen, setIsRegisterOpen, setIsForgotPasswordOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <header className="relative text-center -mt-[66px] pt-[84px] pb-20 overflow-hidden bg-[#050d08]">
        {/* Scenario Background SVG */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
          <svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" className="w-[116%] h-[116%] -top-[8%] -left-[8%] blur-xl">
            <defs>
              <linearGradient id="hcs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4ec0ca" />
                <stop offset="1" stopColor="#9ee0e6" />
              </linearGradient>
              <linearGradient id="hcp" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#4d8f26" />
                <stop offset=".18" stopColor="#a7e05a" />
                <stop offset=".55" stopColor="#74c034" />
                <stop offset="1" stopColor="#3d7a1c" />
              </linearGradient>
            </defs>
            <rect width="1200" height="620" fill="url(#hcs)" />
            <g fill="#fff" opacity=".92">
              <circle cx="180" cy="120" r="34" />
              <circle cx="224" cy="100" r="42" />
              <circle cx="272" cy="122" r="30" />
              <circle cx="700" cy="90" r="28" />
              <circle cx="736" cy="72" r="36" />
              <circle cx="774" cy="92" r="24" />
            </g>
            <g fill="url(#hcp)">
              <rect x="150" y="0" width="96" height="230" />
              <rect x="150" y="360" width="96" height="260" />
              <rect x="560" y="0" width="96" height="150" />
              <rect x="560" y="280" width="96" height="340" />
              <rect x="950" y="0" width="96" height="290" />
              <rect x="950" y="420" width="96" height="200" />
            </g>
            <rect y="480" width="1200" height="140" fill="#ded895" />
            <rect y="480" width="1200" height="26" fill="#7ec850" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-[#040e08]/70 via-[#050d08]/90 to-[#050d08]" />
        </div>

        {/* Sparks particles */}
        <div className="sparks" aria-hidden="true">
          <i style={{ left: '10%', width: 3, height: 3, animationDuration: '18s', animationDelay: '-14s', opacity: 0, background: 'var(--yellow)' }} />
          <i style={{ left: '15%', width: 4, height: 4, animationDuration: '16s', animationDelay: '-11s', opacity: 0, background: 'var(--green)' }} />
          <i style={{ left: '24%', width: 3, height: 3, animationDuration: '16s', animationDelay: '-3s', opacity: 0, background: 'var(--yellow)' }} />
          <i style={{ left: '64%', width: 4, height: 4, animationDuration: '11s', animationDelay: '-5s', opacity: 0, background: 'var(--green)' }} />
          <i style={{ left: '73%', width: 4, height: 4, animationDuration: '15s', animationDelay: '-6s', opacity: 0, background: 'var(--green)' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1080px] mx-auto px-5 flex flex-col items-center">
          {/* Pill counter */}
          <span className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/5 text-[#cfe6d8] font-bold text-xs sm:text-[13.5px] py-2 px-4 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse" />
            <span><b className="text-white font-black">{liveCount.toLocaleString('pt-BR')}</b> jogadores voando agora</span>
          </span>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] mt-5 mb-4 uppercase">
            ESCOLHA SUA<br />
            <span className="text-[#f7c948]">SORTE</span> E <span className="text-[#22c55e]">VOE</span>
          </h1>

          <p className="max-w-lg mx-auto text-[#b9d4c6] font-semibold text-sm sm:text-base leading-relaxed">
            Segure o voo, desvie dos canos e transforme cada passagem em <b className="text-[#f7c948] font-extrabold">prêmios de verdade</b>.
          </p>

          {/* Floating Mascot */}
          <div className="relative w-48 h-40 my-3 grid place-items-center">
            <div className="absolute inset-2 rounded-full bg-[#22c55e]/25 filter blur-xl animate-pulse" />
            <img
              src="/imagens/asset_1.png"
              alt="Mascote FlapCash"
              className="relative w-36 sm:w-40 h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)] animate-voa"
            />
          </div>

          <div className="inline-flex items-center bg-white/[0.04] border border-white/5 text-[#cdbfe6] font-extrabold text-xs py-2 px-5 rounded-full mb-6">
            Jogue valendo, pra liberar mais temas!
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full py-4 px-8 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_16px_40px_-14px_rgba(34,197,94,0.9)] uppercase tracking-wider text-base transition animate-ctapulse active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              TESTAR GRÁTIS
            </button>

            {user ? (
              <Link
                href="/painel"
                className="text-xs sm:text-sm font-black text-[#22c55e] hover:underline"
              >
                Acessar meu painel de apostas →
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-xs sm:text-sm font-bold text-[#8fae9e] hover:text-white transition"
              >
                Já tenho conta →
              </button>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col items-center gap-2.5 mt-8 w-full max-w-xs">
            <span className="flex items-center justify-center gap-2 w-full bg-white/[0.05] border border-[#22c55e]/30 text-[#dcefe4] font-extrabold text-xs py-3 px-5 rounded-full backdrop-blur-md shadow-lg">
              <Check className="w-4 h-4 text-[#22c55e] stroke-[3]" />
              Saque via PIX
            </span>
            <span className="flex items-center justify-center gap-2 w-full bg-white/[0.05] border border-[#22c55e]/30 text-[#dcefe4] font-extrabold text-xs py-3 px-5 rounded-full backdrop-blur-md shadow-lg">
              <Check className="w-4 h-4 text-[#22c55e] stroke-[3]" />
              Depósito mín. R$ 20,00
            </span>
            <span className="flex items-center justify-center gap-2 w-full bg-white/[0.05] border border-[#22c55e]/30 text-[#dcefe4] font-extrabold text-xs py-3 px-5 rounded-full backdrop-blur-md shadow-lg">
              <Check className="w-4 h-4 text-[#22c55e] stroke-[3]" />
              Resultado na hora
            </span>
          </div>
        </div>
      </header>

      {/* STATS SECTION */}
      <section className="bg-gradient-to-b from-white/[0.03] to-transparent py-12 border-y border-white/5">
        <div className="max-w-[1080px] mx-auto px-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div className="p-2">
              <div className="text-2xl sm:text-4xl font-black text-[#f7c948] font-mono">
                {arenaCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase text-[#8fae9e] tracking-wider mt-2">
                Jogadores na arena
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-4xl font-black text-[#f7c948] font-mono">
                R$ 12.616
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase text-[#8fae9e] tracking-wider mt-2">
                Prêmios hoje
              </div>
            </div>
            <div className="p-2 col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-4xl font-black text-[#f7c948] font-mono">
                R$ 926
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase text-[#8fae9e] tracking-wider mt-2">
                Maior prêmio hoje
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO JOGAR SECTION */}
      <section className="py-16 px-5 max-w-[1080px] mx-auto" id="como-jogar">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-[#22c55e]" />
            Como Jogar
          </h2>
          <p className="text-xs sm:text-sm text-[#8fae9e] font-semibold mt-2 max-w-md mx-auto">
            Aprenda a faturar com o Flappy Bird em 4 passos simples.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="bg-white/[0.035] border border-white/[0.07] hover:border-[#22c55e]/40 rounded-3xl p-3 pb-5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 mb-3">
              <img src="/imagens/asset_2.webp" alt="Passo 1" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="px-2">
              <h3 className="text-base font-extrabold text-white">1. Deposite via PIX</h3>
              <p className="text-xs text-[#8fae9e] leading-relaxed mt-1.5">
                Coloque saldo na conta de forma rápida e segura pra começar a voar.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/[0.035] border border-white/[0.07] hover:border-[#22c55e]/40 rounded-3xl p-3 pb-5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 mb-3">
              <img src="/imagens/asset_3.webp" alt="Passo 2" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="px-2">
              <h3 className="text-base font-extrabold text-white">2. Voe sem bater</h3>
              <p className="text-xs text-[#8fae9e] leading-relaxed mt-1.5">
                Toque na tela pra manter o pássaro voando e atravessar os canos.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/[0.035] border border-white/[0.07] hover:border-[#22c55e]/40 rounded-3xl p-3 pb-5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 mb-3">
              <img src="/imagens/asset_4.webp" alt="Passo 3" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="px-2">
              <h3 className="text-base font-extrabold text-white">3. Desvie dos obstáculos</h3>
              <p className="text-xs text-[#8fae9e] leading-relaxed mt-1.5">
                Cada cano que você passa soma dinheiro no acumulado da rodada.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/[0.035] border border-white/[0.07] hover:border-[#22c55e]/40 rounded-3xl p-3 pb-5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 mb-3">
              <img src="/imagens/asset_5.webp" alt="Passo 4" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="px-2">
              <h3 className="text-base font-extrabold text-white">4. Bata a meta e saque</h3>
              <p className="text-xs text-[#8fae9e] leading-relaxed mt-1.5">
                Bateu a meta? O cashout libera — saca via PIX ou continua acumulando.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => setDemoModalOpen(true)}
            className="py-3.5 px-8 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_8px_25px_-5px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition"
          >
            Teste grátis agora!
          </button>
        </div>
      </section>

      {/* DEPOIMENTOS SECTION */}
      <section className="py-16 px-5 max-w-[1080px] mx-auto border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-[11px] font-black uppercase text-[#8fae9e] tracking-widest block mb-2">
            Depoimentos
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Quem joga, <span className="text-[#22c55e]">recomenda</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Voice 1 */}
          <div className="bg-white/[0.035] border border-white/[0.07] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-[#f7c948] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f7c948]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#dcece3] font-medium leading-relaxed italic">
                “O passarinho ficou muito bom mano, parece aqueles joguinhos antigos de celular só que mais bonito. Coloquei 50,00 pra testar e consegui fazer 782,00”
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5">
              <div className="font-extrabold text-sm text-white">Bruno Lima</div>
              <div className="text-[11px] font-bold text-[#8fae9e] uppercase tracking-wider mt-0.5">
                Jogador do flapcash
              </div>
            </div>
          </div>

          {/* Voice 2 */}
          <div className="bg-white/[0.035] border border-white/[0.07] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-[#f7c948] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f7c948]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#dcece3] font-medium leading-relaxed italic">
                “Achei que ia ser difícil por causa do passarinho, mas tem que pegar o tempo certo do toque, dá pra ganhar bem fácil uma grana boa”
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5">
              <div className="font-extrabold text-sm text-white">Camila Souza</div>
              <div className="text-[11px] font-bold text-[#8fae9e] uppercase tracking-wider mt-0.5">
                Jogador do flapcash
              </div>
            </div>
          </div>

          {/* Voice 3 */}
          <div className="bg-white/[0.035] border border-white/[0.07] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-[#f7c948] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f7c948]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#dcece3] font-medium leading-relaxed italic">
                “Jogo simples e fácil de ganhar. No começo eu bati 2 vezes no cano, depois peguei a manha. O legal é que cada obstáculo que passa já aparece o valor que ganha, top demais”
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5">
              <div className="font-extrabold text-sm text-white">Rafael Martins</div>
              <div className="text-[11px] font-bold text-[#8fae9e] uppercase tracking-wider mt-0.5">
                Jogador do flapcash
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-5 text-center bg-radial-at-b from-[#22c55e]/15 to-transparent">
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          Pronto pra voar?
        </h2>
        <p className="text-xs sm:text-sm text-[#8fae9e] max-w-md mx-auto mt-3 mb-8">
          Teste sem depositar e veja como funciona. Quando quiser jogar valendo, o saque cai no PIX.
        </p>
        <button
          onClick={() => setDemoModalOpen(true)}
          className="py-4 px-10 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_12px_35px_rgba(34,197,94,0.7)] uppercase tracking-wider text-base transition"
        >
          Testar Grátis
        </button>
      </section>

      {/* FOOTER */}
      <Footer onOpenDoc={(doc) => setCurrentDoc(doc)} />

      {/* DEMO GAME MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute -top-11 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <FlappyBirdGame
              betAmount={10}
              isDemo={true}
              onClose={() => setDemoModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* REGULATION DOC MODAL */}
      <InfoDocModal
        docKey={currentDoc}
        onClose={() => setCurrentDoc(null)}
      />
    </div>
  );
}

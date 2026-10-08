'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FlappyBirdGame from '@/components/FlappyBirdGame';
import { 
  Plus, 
  ArrowUpRight, 
  Users, 
  User, 
  Gamepad2, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';

export default function PainelPage() {
  const { 
    user, 
    setIsDepositOpen, 
    setIsWithdrawOpen, 
    setIsReferralOpen, 
    setIsProfileOpen, 
    setIsLoginOpen 
  } = useAuth();

  const [selectedBet, setSelectedBet] = useState<number>(5);
  const [customBet, setCustomBet] = useState<string>('5');
  const [isPlayingReal, setIsPlayingReal] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const quickBets = [1, 2, 5, 10, 20, 50, 100];

  const handleSelectBet = (val: number) => {
    setSelectedBet(val);
    setCustomBet(val.toString());
  };

  const handleCustomBet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomBet(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedBet(num);
    }
  };

  const handleStartRealGame = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    if (user.balance < selectedBet) {
      setIsDepositOpen(true);
      return;
    }
    setIsDemoMode(false);
    setIsPlayingReal(true);
  };

  const handleStartDemoGame = () => {
    setIsDemoMode(true);
    setIsPlayingReal(true);
  };

  return (
    <div className="min-h-screen bg-[#050d08] pb-24 text-white">
      {/* Top Banner / User Bar */}
      <div className="bg-[#07170c] border-b border-[#22c55e]/15 px-4 sm:px-6 py-4">
        <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#0c2415] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] font-black text-lg shadow-inner">
              {user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white">
                  {user?.name || 'Visitante (Não logado)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] font-black text-[10px] uppercase">
                  VIP 1
                </span>
              </div>
              <span className="text-xs text-[#8fae9e]">
                {user?.email || 'Faça login para salvar seus prêmios'}
              </span>
            </div>
          </div>

          {/* Balance Cards & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-[#0b1f13] border border-[#16311f] rounded-2xl p-2.5 px-4 text-right flex-1 md:flex-initial">
              <span className="text-[10px] text-[#8fae9e] font-black uppercase tracking-wider block leading-none">
                Saldo Real
              </span>
              <span className="text-lg font-black text-[#22c55e]">
                R$ {(user?.balance || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-[#0b1f13] border border-[#16311f] rounded-2xl p-2.5 px-4 text-right flex-1 md:flex-initial">
              <span className="text-[10px] text-[#f7c948] font-black uppercase tracking-wider block leading-none">
                Bônus
              </span>
              <span className="text-lg font-black text-[#f7c948]">
                R$ {(user?.bonusBalance || 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setIsDepositOpen(true)}
              className="py-3 px-5 rounded-2xl font-black text-xs text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_4px_20px_rgba(34,197,94,0.5)] uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Depositar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Bet Configurator & Stats */}
          <div className="lg:col-span-5 space-y-5">
            {/* Betting Card */}
            <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-[#8fae9e] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#22c55e]" /> CONFIGURAÇÃO DO VOO
                </span>
                <span className="text-[11px] font-extrabold text-[#f7c948] bg-[#f7c948]/10 px-2.5 py-1 rounded-full border border-[#f7c948]/20">
                  Jackpot até 100x
                </span>
              </div>

              {/* Quick Bet Chips */}
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-2">
                Valor da Aposta por Partida
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {quickBets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectBet(val)}
                    className={`py-2.5 rounded-xl font-black text-xs transition border ${
                      selectedBet === val
                        ? 'bg-[#22c55e] text-black border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        : 'bg-[#0c2415] text-white border-white/10 hover:border-[#22c55e]/40'
                    }`}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                  Outro Valor (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customBet}
                    onChange={handleCustomBet}
                    className="w-full pl-12 pr-4 py-3 bg-[#0c2415] border border-white/10 rounded-2xl text-white font-black text-base focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              {/* Potential Payouts Table Preview */}
              <div className="p-3.5 bg-[#0b1f13] border border-[#16311f] rounded-2xl mb-5 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8fae9e] font-semibold">
                  <span>1 cano (1.25x):</span>
                  <span className="font-bold text-white">R$ {(selectedBet * 1.25).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8fae9e] font-semibold">
                  <span>3 canos (1.95x):</span>
                  <span className="font-bold text-white">R$ {(selectedBet * 1.95).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8fae9e] font-semibold">
                  <span>5 canos (3.10x):</span>
                  <span className="font-bold text-[#f7c948]">R$ {(selectedBet * 3.10).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8fae9e] font-semibold">
                  <span>10 canos (13.50x):</span>
                  <span className="font-black text-[#22c55e]">R$ {(selectedBet * 13.50).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8fae9e] font-semibold border-t border-white/5 pt-1 mt-1">
                  <span className="font-bold text-[#f7c948]">Jackpot 20 canos (100x):</span>
                  <span className="font-black text-[#f7c948]">R$ {(selectedBet * 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleStartRealGame}
                  className="w-full py-4 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_10px_35px_rgba(34,197,94,0.6)] uppercase tracking-wider text-base transition flex items-center justify-center gap-2 animate-ctapulse active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  JOGAR COM R$ {selectedBet.toFixed(2)}
                </button>

                <button
                  onClick={handleStartDemoGame}
                  className="w-full py-3 px-6 rounded-full font-extrabold text-white bg-white/5 hover:bg-white/10 border border-white/10 uppercase tracking-wider text-xs transition"
                >
                  Treinar no Modo Demo (Grátis)
                </button>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="p-4 bg-[#07170c] border border-white/10 hover:border-[#22c55e]/40 rounded-2xl flex items-center gap-3 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block uppercase">Sacar PIX</span>
                  <span className="text-[10px] text-[#8fae9e]">Cai na hora</span>
                </div>
              </button>

              <button
                onClick={() => setIsReferralOpen(true)}
                className="p-4 bg-[#07170c] border border-white/10 hover:border-[#f7c948]/40 rounded-2xl flex items-center gap-3 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f7c948]/15 flex items-center justify-center text-[#f7c948] group-hover:scale-110 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block uppercase">Afiliados</span>
                  <span className="text-[10px] text-[#8fae9e]">Até 17% comissão</span>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Flappy Bird Interactive Canvas */}
          <div className="lg:col-span-7">
            <div className="bg-[#07170c] border border-[#22c55e]/25 rounded-3xl p-3 sm:p-5 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping" />
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    ARENA DE VOO AO VIVO
                  </span>
                </div>
                <span className="text-xs font-bold text-[#8fae9e]">
                  {isDemoMode ? 'Modo Treino (Demo)' : 'Modo Valendo (PIX)'}
                </span>
              </div>

              {/* O Jogo 100% Original */}
              <div className="w-full h-[580px] rounded-2xl overflow-hidden bg-[#05130c] relative">
                <iframe
                  src={`/game/index.html${isDemoMode ? '?demo=true' : '?demo=false'}`}
                  className="w-full h-full border-0 block"
                  allow="autoplay"
                  title="FlapCash Original Game"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR (Mobile style from original site) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#06120a]/95 backdrop-blur-md border-t border-[#22c55e]/20 py-2.5 px-4 shadow-2xl">
        <div className="max-w-[500px] mx-auto flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[#8fae9e] hover:text-[#22c55e] transition"
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Início</span>
          </Link>

          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex flex-col items-center gap-1 text-[#22c55e] hover:brightness-125 transition"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Depositar</span>
          </button>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex flex-col items-center gap-1 text-[#8fae9e] hover:text-[#22c55e] transition"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Sacar</span>
          </button>

          <button
            onClick={() => setIsReferralOpen(true)}
            className="flex flex-col items-center gap-1 text-[#8fae9e] hover:text-[#22c55e] transition"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Indicar</span>
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center gap-1 text-[#8fae9e] hover:text-[#22c55e] transition"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

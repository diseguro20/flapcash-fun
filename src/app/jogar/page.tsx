'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FlappyBirdGame from '@/components/FlappyBirdGame';
import { ArrowLeft, Plus, Wallet } from 'lucide-react';

export default function JogarPage() {
  const { user, setIsDepositOpen } = useAuth();
  const [bet, setBet] = useState(5);

  return (
    <div className="min-h-screen bg-[#050d08] flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header */}
      <div className="max-w-lg mx-auto w-full flex items-center justify-between mb-3">
        <Link
          href="/painel"
          className="flex items-center gap-1.5 text-xs font-black text-[#8fae9e] hover:text-white transition py-2 px-3 rounded-full bg-white/5 border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c2415] border border-[#22c55e]/30 text-xs font-black text-white">
            <Wallet className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>R$ {(user?.balance || 0).toFixed(2)}</span>
          </div>

          <button
            onClick={() => setIsDepositOpen(true)}
            className="p-1.5 rounded-full bg-[#22c55e] text-black hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Game Center */}
      <div className="flex-1 flex items-center justify-center">
        <FlappyBirdGame
          betAmount={bet}
          isDemo={!user}
        />
      </div>

      {/* Bet Quick Selector below game */}
      <div className="max-w-lg mx-auto w-full mt-4 flex items-center justify-between gap-2 bg-[#07170c] p-2.5 rounded-2xl border border-white/5">
        <span className="text-xs font-bold text-[#8fae9e] uppercase">
          Aposta:
        </span>
        <div className="flex gap-1.5 overflow-x-auto">
          {[1, 2, 5, 10, 20, 50].map((v) => (
            <button
              key={v}
              onClick={() => setBet(v)}
              className={`py-1.5 px-3 rounded-xl font-black text-xs transition ${
                bet === v
                  ? 'bg-[#22c55e] text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              R$ {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

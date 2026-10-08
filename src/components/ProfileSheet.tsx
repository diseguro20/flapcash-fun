'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, User, History, Wallet, LogOut, CheckCircle2, XCircle } from 'lucide-react';

export default function ProfileSheet() {
  const { isProfileOpen, setIsProfileOpen, user, logout, bets, transactions } = useAuth();
  const [tab, setTab] = useState<'profile' | 'bets' | 'transactions'>('profile');

  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#07170c] border border-[#22c55e]/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />

        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] font-black text-xl mb-2">
            {user?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {user?.name || 'Piloto FlapCash'}
          </h2>
          <p className="text-xs text-[#8fae9e]">{user?.email}</p>
        </div>

        {/* Tab navigation */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0c2415] rounded-xl mb-4 border border-white/5">
          <button
            onClick={() => setTab('profile')}
            className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              tab === 'profile' ? 'bg-[#22c55e] text-black' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Dados
          </button>
          <button
            onClick={() => setTab('bets')}
            className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              tab === 'bets' ? 'bg-[#22c55e] text-black' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Voos
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              tab === 'transactions' ? 'bg-[#22c55e] text-black' : 'text-[#8fae9e] hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Extrato
          </button>
        </div>

        {/* Tab 1: Profile info */}
        {tab === 'profile' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#0c2415] border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#8fae9e] font-bold">Saldo Real</span>
              <span className="text-white font-black text-sm">R$ {(user?.balance || 0).toFixed(2)}</span>
            </div>
            <div className="p-3.5 bg-[#0c2415] border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#8fae9e] font-bold">Saldo Bônus</span>
              <span className="text-[#f7c948] font-black text-sm">R$ {(user?.bonusBalance || 0).toFixed(2)}</span>
            </div>
            <div className="p-3.5 bg-[#0c2415] border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#8fae9e] font-bold">Progresso Rollover</span>
              <span className="text-white font-bold">
                R$ {(user?.rolloverCurrent || 0).toFixed(0)} / R$ {(user?.rolloverTarget || 100).toFixed(0)}
              </span>
            </div>
            <div className="p-3.5 bg-[#0c2415] border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#8fae9e] font-bold">Código de Indicação</span>
              <span className="text-[#22c55e] font-mono font-bold">{user?.referralCode}</span>
            </div>

            <button
              onClick={() => {
                logout();
                setIsProfileOpen(false);
              }}
              className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-xs bg-red-950/60 border border-red-500/30 text-red-200 hover:bg-red-900/60 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        )}

        {/* Tab 2: Bet history */}
        {tab === 'bets' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {bets.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#8fae9e]">Nenhum voo registrado ainda.</p>
            ) : (
              bets.map((b) => (
                <div key={b.id} className="p-3 bg-[#0c2415] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {b.result === 'cashout' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      {b.result === 'cashout' ? 'Resgatado' : 'Bateu no cano'}
                      {b.isDemo && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">DEMO</span>}
                    </div>
                    <span className="text-[10px] text-[#8fae9e]">
                      {b.pipesCleared} canos · {b.multiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black ${b.wonAmount > 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
                      {b.wonAmount > 0 ? `+R$ ${b.wonAmount.toFixed(2)}` : `-R$ ${b.betAmount.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Transactions */}
        {tab === 'transactions' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#8fae9e]">Nenhuma movimentação ainda.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-[#0c2415] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white capitalize block">
                      {tx.type === 'deposit' ? 'Depósito PIX' : 'Saque PIX'}
                    </span>
                    <span className="text-[10px] text-[#8fae9e] uppercase">
                      Status: {tx.status}
                    </span>
                  </div>
                  <div className="text-right font-black">
                    <span className={tx.type === 'deposit' ? 'text-[#22c55e]' : 'text-amber-400'}>
                      {tx.type === 'deposit' ? '+' : '-'}R$ {tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Copy, Check, Users, Gift, TrendingUp, DollarSign, Sparkles } from 'lucide-react';

export default function ReferralSheet() {
  const { isReferralOpen, setIsReferralOpen, user, updateBalance } = useAuth();
  const [copied, setCopied] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const isInfluencer = Boolean(user?.isInfluencer);
  const refCode = user?.referralCode || 'FLAPVIP';
  const refLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${refCode}` 
    : `https://flapcash.fun/?ref=${refCode}`;

  const commissionAvailable = 45.80; // Comissões simuladas para enriquecer a experiência

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemCommission = async () => {
    if (commissionAvailable <= 0 || redeemed) return;
    await updateBalance(commissionAvailable);
    setRedeemed(true);
    setTimeout(() => {
      alert(`R$ ${commissionAvailable.toFixed(2)} resgatados com sucesso para seu saldo real!`);
    }, 200);
  };

  if (!isReferralOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      <div className={`relative w-full max-w-xl bg-[#07170c] border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
        isInfluencer ? 'border-[#f7c948]/50 shadow-[0_20px_60px_-15px_rgba(247,201,72,0.25)]' : 'border-[#22c55e]/30 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)]'
      }`}>
        <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent ${
          isInfluencer ? 'via-[#f7c948]' : 'via-[#22c55e]'
        } to-transparent`} />

        <button
          onClick={() => setIsReferralOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABEÇALHO DO MODO INFLUENCER OU AFILIADO PADRÃO */}
        {isInfluencer ? (
          <div className="mb-5 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1504] via-[#2d2106] to-[#120d02] border-2 border-[#f7c948]/60 p-5 shadow-[0_12px_40px_rgba(247,201,72,0.18)]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7c948]/20 border border-[#f7c948]/40 text-[#f7c948] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modo Influenciador Oficial Ativo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Painel de Divulgação do Parceiro <span className="text-[#f7c948]">★</span>
              </h2>
              <p className="text-xs text-[#d1c29b]">
                Seu perfil está liberado como influenciador da banca. Compartilhe seu link exclusivo abaixo e receba comissões automáticas no seu saldo a cada depósito dos leads.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-black/50 border border-[#f7c948]/40 text-[#f7c948] font-bold">
                  💰 Comissão Direta: <strong className="text-white">{user?.affiliateRate || 10}%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/50 border border-[#f7c948]/40 text-[#f7c948] font-bold">
                  👥 Sub-afiliados N2: <strong className="text-white">{user?.subAffiliateRate || 2}%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#86efac] font-bold">
                  ✓ Status: Verificado e Ativo
                </span>
              </div>
            </div>

            {/* Link Box do Influencer */}
            <div className="mt-4 p-3 bg-black/60 rounded-2xl border border-[#f7c948]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                readOnly
                value={refLink}
                className="flex-1 px-3 py-2.5 bg-[#0d0902] rounded-xl border border-white/5 font-mono text-xs text-[#f7c948] truncate"
              />
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#f7c948] to-[#eab308] text-black hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado! ✓' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7c948]/15 border border-[#f7c948]/30 text-[#f7c948] text-xs font-black tracking-wider uppercase mb-2">
                <Gift className="w-3.5 h-3.5" />
                PROGRAMA DE AFILIADOS FLAPCASH
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                INDIQUE E <span className="text-[#22c55e]">LUCRE</span>
              </h2>
              <p className="text-xs text-[#8fae9e] mt-0.5">
                Ganhe até 17% de comissão vitalícia em 3 níveis de indicados
              </p>
            </div>

            {/* Link box padrão */}
            <div className="mb-5 p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl">
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-2">
                Seu Link Exclusivo de Indicação
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="w-full px-3 py-2.5 bg-[#07170c] border border-white/10 rounded-xl text-white text-xs font-mono truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl font-black text-xs bg-[#22c55e] text-black hover:brightness-110 flex items-center gap-1.5 transition flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Níveis de comissão */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-3 bg-[#0c2415] border border-white/5 rounded-2xl">
            <span className="text-xs font-black text-[#22c55e] block">NÍVEL 1</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {isInfluencer ? `${user?.affiliateRate || 10}%` : '10%'}
            </span>
            <span className="text-[10px] text-[#8fae9e] font-semibold">Diretos</span>
          </div>
          <div className="p-3 bg-[#0c2415] border border-white/5 rounded-2xl">
            <span className="text-xs font-black text-[#f7c948] block">NÍVEL 2</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {isInfluencer ? `${user?.subAffiliateRate || 2}%` : '5%'}
            </span>
            <span className="text-[10px] text-[#8fae9e] font-semibold">Sub-indicados</span>
          </div>
          <div className="p-3 bg-[#0c2415] border border-white/5 rounded-2xl">
            <span className="text-xs font-black text-[#38bdf8] block">NÍVEL 3</span>
            <span className="text-xl font-black text-white block mt-0.5">2%</span>
            <span className="text-[10px] text-[#8fae9e] font-semibold">Rede</span>
          </div>
        </div>

        {/* Dashboard comissões */}
        <div className="p-4 bg-[#081a0e] border border-[#22c55e]/20 rounded-2xl flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-[#8fae9e] font-bold block uppercase">
              Comissão Disponível
            </span>
            <span className="text-2xl font-black text-[#22c55e]">
              R$ {redeemed ? '0,00' : commissionAvailable.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleRedeemCommission}
            disabled={redeemed}
            className="py-2.5 px-4 rounded-full font-black text-xs bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black uppercase tracking-wider hover:brightness-110 transition disabled:opacity-40"
          >
            {redeemed ? 'Resgatado' : 'Transferir p/ Saldo'}
          </button>
        </div>

        <div className="text-center text-xs text-[#8fae9e]">
          Seus ganhos são creditados a cada depósito válido realizado por seus indicados.
        </div>
      </div>
    </div>
  );
}

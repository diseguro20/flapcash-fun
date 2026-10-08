'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Copy, Check, Gift, TrendingUp, Sparkles, MessageCircle, Send, Share2 } from 'lucide-react';

export default function ReferralSheet() {
  const { isReferralOpen, setIsReferralOpen, user, updateBalance } = useAuth();
  const [copied, setCopied] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const isInfluencer = Boolean(user?.isInfluencer);
  
  // Código exclusivo garantido para todo e qualquer lead
  const refCode = user?.referralCode || (user?.uid ? 'REF' + user.uid.replace(/\D/g, '').slice(-5) : 'FLAPVIP');
  
  // Link oficial de divulgação
  const appOrigin = typeof window !== 'undefined' && window.location.origin.includes('http')
    ? window.location.origin
    : 'https://flapcash-fun.vercel.app';
  const refLink = `${appOrigin}/?ref=${refCode}`;

  const commissionAvailable = 45.80;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `🚨 Jogue Flappy Bird valendo PIX de verdade na FlapCash! Cadastre-se pelo meu link oficial e receba bônus de 100% no seu primeiro depósito: ${refLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTelegram = () => {
    const text = `🚨 Jogue Flappy Bird valendo PIX de verdade na FlapCash! Cadastre-se pelo meu link oficial: ${refLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`, '_blank');
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
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition z-10"
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
                Painel de Divulgação VIP <span className="text-[#f7c948]">★</span>
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
                  ✓ Status: Ativo
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-xs font-black tracking-wider uppercase mb-2">
              <Gift className="w-3.5 h-3.5" />
              PROGRAMA OFICIAL DE AFILIADOS FLAPCASH
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              INDIQUE AMIGOS E <span className="text-[#22c55e]">LUCRO NO PIX</span>
            </h2>
            <p className="text-xs text-[#8fae9e] mt-0.5">
              Ganhe até 17% de comissão a cada depósito de qualquer pessoa que entrar pelo seu link!
            </p>
          </div>
        )}

        {/* BOX PRINCIPAL DO LINK DE INDICAÇÃO PARA TODOS OS LEADS */}
        <div className="mb-5 p-4 bg-[#0b1f13] border border-[#22c55e]/30 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#22c55e]" />
              <span>Seu Link de Divulgação Oficial</span>
            </label>
            <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] text-[10px] font-black uppercase">
              Ativo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={refLink}
              className="flex-1 px-3 py-2.5 bg-[#07170c] border border-white/10 rounded-xl text-white text-xs font-mono font-bold truncate select-all focus:outline-none focus:border-[#22c55e]"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-[#04160b] hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 transition flex-shrink-0 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado! ✓' : 'Copiar Link'}</span>
            </button>
          </div>

          {/* BOTÕES DE COMPARTILHAMENTO DIRETO */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
            <button
              onClick={shareWhatsApp}
              className="py-2.5 px-3 rounded-xl font-black text-xs bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] hover:bg-[#25d366]/30 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Enviar no WhatsApp</span>
            </button>
            <button
              onClick={shareTelegram}
              className="py-2.5 px-3 rounded-xl font-black text-xs bg-[#229ed9]/20 border border-[#229ed9]/40 text-[#229ed9] hover:bg-[#229ed9]/30 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Enviar no Telegram</span>
            </button>
          </div>
        </div>

        {/* Níveis de comissão */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-3 bg-[#0c2415] border border-[#22c55e]/20 rounded-2xl">
            <span className="text-[11px] font-black text-[#22c55e] block uppercase">NÍVEL 1</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {isInfluencer ? `${user?.affiliateRate || 10}%` : '10%'}
            </span>
            <span className="text-[10px] text-[#8fae9e] font-bold">Amigos Diretos</span>
          </div>
          <div className="p-3 bg-[#0c2415] border border-[#f7c948]/20 rounded-2xl">
            <span className="text-[11px] font-black text-[#f7c948] block uppercase">NÍVEL 2</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {isInfluencer ? `${user?.subAffiliateRate || 2}%` : '5%'}
            </span>
            <span className="text-[10px] text-[#8fae9e] font-bold">Sub-indicados</span>
          </div>
          <div className="p-3 bg-[#0c2415] border border-[#38bdf8]/20 rounded-2xl">
            <span className="text-[11px] font-black text-[#38bdf8] block uppercase">NÍVEL 3</span>
            <span className="text-xl font-black text-white block mt-0.5">2%</span>
            <span className="text-[10px] text-[#8fae9e] font-bold">Rede Vitalícia</span>
          </div>
        </div>

        {/* Dashboard comissões */}
        <div className="p-4 bg-[#081a0e] border border-[#22c55e]/25 rounded-2xl flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-[#8fae9c] font-black block uppercase tracking-wider">
              Comissão Disponível
            </span>
            <span className="text-2xl font-black text-[#22c55e]">
              R$ {redeemed ? '0,00' : commissionAvailable.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleRedeemCommission}
            disabled={redeemed}
            className="py-2.5 px-5 rounded-full font-black text-xs bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-[#04160b] uppercase tracking-wider hover:brightness-110 active:scale-95 transition disabled:opacity-40 shadow-lg"
          >
            {redeemed ? 'Transferido ✓' : 'Transferir p/ Saldo'}
          </button>
        </div>

        <div className="text-center text-xs text-[#8fae9e] leading-relaxed">
          💡 Todas as comissões caem automaticamente no seu saldo a cada depósito que seus amigos fizerem!
        </div>
      </div>
    </div>
  );
}

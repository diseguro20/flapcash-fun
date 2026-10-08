'use client';

import React from 'react';
import { X } from 'lucide-react';

interface InfoDocModalProps {
  docKey: string | null;
  onClose: () => void;
}

export default function InfoDocModal({ docKey, onClose }: InfoDocModalProps) {
  if (!docKey) return null;

  const docsContent: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
    responsavel: {
      title: 'Jogo Responsável',
      subtitle: 'flapcash · atualizado em 2026',
      content: (
        <div className="space-y-4 text-xs text-[#cfe3d7] leading-relaxed">
          <p>
            O flapcash é uma plataforma de entretenimento e habilidade. Nossa prioridade é garantir que todos os usuários tenham uma experiência divertida, segura e saudável.
          </p>
          <div className="p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl">
            <h4 className="font-extrabold text-white text-sm mb-1">Diretrizes Fundamentais:</h4>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li>Destinado exclusivamente para maiores de 18 anos.</li>
              <li>Defina limites para o seu tempo e valor de jogo antes de iniciar.</li>
              <li>Nunca utilize fundos destinados a compromissos financeiros essenciais.</li>
              <li>Não tente recuperar perdas aumentando o valor das apostas.</li>
            </ul>
          </div>
        </div>
      )
    },
    privacidade: {
      title: 'Política de Privacidade',
      subtitle: 'flapcash · atualizado em 2026',
      content: (
        <div className="space-y-4 text-xs text-[#cfe3d7] leading-relaxed">
          <p>
            Sua privacidade é levada a sério. Todas as transações financeiras e dados pessoais são protegidos por criptografia de ponta a ponta (SSL/TLS 256 bits).
          </p>
          <div className="p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl">
            <h4 className="font-extrabold text-white text-sm mb-1">Tratamento de Dados:</h4>
            <p className="mt-1">
              Coletamos apenas informações necessárias para a operacionalização dos pagamentos via PIX e segurança da sua conta. Seus dados nunca são vendidos ou compartilhados com terceiros não autorizados.
            </p>
          </div>
        </div>
      )
    },
    termos: {
      title: 'Termos de Uso',
      subtitle: 'flapcash · atualizado em 2026',
      content: (
        <div className="space-y-4 text-xs text-[#cfe3d7] leading-relaxed">
          <p>
            Ao acessar o flapcash, você concorda com nossos termos de serviço, regras operacionais e políticas de saque.
          </p>
          <div className="p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl">
            <h4 className="font-extrabold text-white text-sm mb-1">Regras das Partidas:</h4>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li>O cashout é válido apenas se executado antes da colisão do pássaro no obstáculo.</li>
              <li>Depósitos são creditados em poucos instantes após a confirmação via PIX.</li>
              <li>Saques são enviados para a chave PIX informada pelo próprio usuário.</li>
            </ul>
          </div>
        </div>
      )
    },
    faq: {
      title: 'Perguntas Frequentes (FAQ)',
      subtitle: 'flapcash · tire suas dúvidas',
      content: (
        <div className="space-y-3 text-xs text-[#cfe3d7]">
          <div className="p-3 bg-[#0b1f13] border border-[#16311f] rounded-xl">
            <h4 className="font-extrabold text-white text-sm">Como funciona o flapcash?</h4>
            <p className="mt-1">Você define o valor do voo, inicia a decolagem e a cada cano ultrapassado o seu multiplicador aumenta. Clique em SACAR antes de bater para embolsar o lucro!</p>
          </div>
          <div className="p-3 bg-[#0b1f13] border border-[#16311f] rounded-xl">
            <h4 className="font-extrabold text-white text-sm">Qual o valor mínimo de depósito e saque?</h4>
            <p className="mt-1">Depósito mínimo: R$ 20,00. Saque mínimo: R$ 30,00 via PIX direto na sua conta.</p>
          </div>
          <div className="p-3 bg-[#0b1f13] border border-[#16311f] rounded-xl">
            <h4 className="font-extrabold text-white text-sm">O saque cai na hora?</h4>
            <p className="mt-1">Sim! Utilizamos o gateway automatizado Vizzion Pay com transferências PIX instantâneas 24h.</p>
          </div>
        </div>
      )
    },
    suporte: {
      title: 'Suporte Técnico',
      subtitle: 'flapcash · atendimento ao usuário',
      content: (
        <div className="space-y-4 text-xs text-[#cfe3d7] leading-relaxed">
          <p>
            Nossa equipe de suporte está de prontidão para solucionar qualquer dúvida sobre depósitos, saques ou funcionamento dos jogos.
          </p>
          <div className="p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl text-center space-y-3">
            <p className="font-bold text-white text-sm">E-mail oficial de atendimento:</p>
            <p className="text-[#22c55e] font-mono font-black text-sm">suporte@flapcash.fun</p>
            <p className="text-[11px] text-[#8fae9e]">Atendimento diário das 08h às 02h.</p>
          </div>
        </div>
      )
    }
  };

  const current = docsContent[docKey] || docsContent.termos;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
          {current.title}
        </h2>
        <p className="text-xs text-[#8fae9e] mb-5">{current.subtitle}</p>

        {current.content}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-full font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition text-center"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

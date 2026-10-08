'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  onOpenDoc?: (doc: string) => void;
}

export default function Footer({ onOpenDoc }: FooterProps) {
  return (
    <footer className="bg-[#040a06] border-t border-white/5 py-14 px-5">
      <div className="max-w-[1080px] mx-auto">
        <div className="font-black text-[#22c55e] text-xl mb-4 flex items-center">
          flapcash
        </div>
        <div className="text-[#cbe0d4] font-bold text-sm">
          © 2026 flapcash. Todos os direitos reservados.
        </div>
        <div className="text-[#8fae9e] font-medium text-xs leading-relaxed mt-3 max-w-2xl">
          Plataforma de entretenimento interativo. Conteúdo destinado estritamente a maiores de 18 anos. Jogue com responsabilidade — aposte apenas valores recreativos e nunca com o intuito de recuperar prejuízos anteriores.
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10 max-w-lg">
          <div>
            <h4 className="text-[11px] font-black tracking-widest uppercase text-[#8fae9e] mb-4">
              Regulamentos
            </h4>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenDoc?.('responsavel')}
                className="block text-left text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Jogo responsável
              </button>
              <button
                type="button"
                onClick={() => onOpenDoc?.('privacidade')}
                className="block text-left text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Política de Privacidade
              </button>
              <button
                type="button"
                onClick={() => onOpenDoc?.('termos')}
                className="block text-left text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Termos de Uso
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black tracking-widest uppercase text-[#8fae9e] mb-4">
              Ajuda
            </h4>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenDoc?.('faq')}
                className="block text-left text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Perguntas Frequentes
              </button>
              <a
                href="/#como-jogar"
                className="block text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Como Jogar
              </a>
              <button
                type="button"
                onClick={() => onOpenDoc?.('suporte')}
                className="block text-left text-[#cfe3d7] font-bold text-sm hover:text-[#22c55e] transition"
              >
                Suporte Técnico
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

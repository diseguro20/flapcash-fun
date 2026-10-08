'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Plus, User, Wallet, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, setIsLoginOpen, setIsRegisterOpen, setIsDepositOpen, setIsProfileOpen } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06120a]/90 backdrop-blur-md border-b border-[#22c55e]/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#22c55e] transition">
            flap<span className="text-[#22c55e]">cash</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Balance Card */}
              <div
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c2415] border border-[#22c55e]/30 cursor-pointer hover:border-[#22c55e] transition"
              >
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase leading-none">
                    Saldo Real
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    R$ {user.balance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Deposit Button */}
              <button
                onClick={() => setIsDepositOpen(true)}
                className="flex items-center gap-1.5 py-2 px-3.5 sm:px-5 rounded-full font-black text-xs sm:text-sm text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_4px_18px_rgba(34,197,94,0.5)] uppercase tracking-wider transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Depositar</span>
              </button>

              {/* Profile icon */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[#22c55e]/50 text-white transition"
              >
                <User className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center justify-center font-extrabold rounded-full cursor-pointer bg-gradient-to-b from-[#22c55e] to-[#16a34a] text-[#04160b] py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm shadow-[0_8px_22px_-10px_rgba(34,197,94,0.9)] hover:brightness-110 transition active:scale-95"
              >
                Registre-se
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center justify-center font-extrabold rounded-full cursor-pointer bg-transparent text-[#22c55e] border-[1.6px] border-[#22c55e]/55 py-2 px-3.5 sm:py-2 sm:px-5 text-xs sm:text-sm hover:bg-[#22c55e]/15 transition active:scale-95"
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

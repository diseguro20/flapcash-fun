'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function JogarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [initialSrc, setInitialSrc] = useState<string>('');

  useEffect(() => {
    setMounted(true);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'EXIT_GAME') {
        router.push('/');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  useEffect(() => {
    // Só define o link do jogo após a autenticação ter carregado completamente
    if (mounted && !loading && !initialSrc) {
      if (user) {
        const isInfluencer = Boolean(user.isInfluencer);
        setInitialSrc(
          `/game/index.html?demo=false&uid=${encodeURIComponent(user.uid)}&balance=${encodeURIComponent(user.balance)}&influencer=${isInfluencer ? 'true' : 'false'}`
        );
      } else {
        setInitialSrc('/game/index.html?demo=true');
      }
    }
  }, [mounted, loading, user, initialSrc]);

  if (!mounted || loading || !initialSrc) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#05130c] z-[9999] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#22c55e] mb-4" />
        <p className="text-sm font-black tracking-widest uppercase text-[#8fae9e]">
          Carregando Arena FlapCash...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#05130c] z-[9999] overflow-hidden">
      <iframe
        src={initialSrc}
        className="w-full h-full border-0 block"
        allow="autoplay"
        title="FlapCash Original Game"
      />
    </div>
  );
}

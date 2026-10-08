'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';

export default function JogarPage() {
  const { user } = useAuth();
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
    if (mounted && !initialSrc) {
      if (user) {
        const isInfluencer = Boolean(user.isInfluencer);
        setInitialSrc(
          `/game/index.html?demo=false&uid=${encodeURIComponent(user.uid)}&balance=${encodeURIComponent(user.balance)}&influencer=${isInfluencer ? 'true' : 'false'}`
        );
      } else {
        setInitialSrc('/game/index.html?demo=true');
      }
    }
  }, [mounted, user, initialSrc]);

  if (!mounted || !initialSrc) return null;

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

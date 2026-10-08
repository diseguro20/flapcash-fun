'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function JogarPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#05130c] z-[9999] overflow-hidden">
      <iframe
        src={`/game/index.html${user ? '?demo=false' : '?demo=true'}`}
        className="w-full h-full border-0 block"
        allow="autoplay"
        title="FlapCash Original Game"
      />
    </div>
  );
}

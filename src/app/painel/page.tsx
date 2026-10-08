'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import MemberDashboard from '@/components/MemberDashboard';

export default function PainelPage() {
  const { user, setIsLoginOpen } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoginOpen(true);
    }
  }, [user, setIsLoginOpen]);

  return <MemberDashboard />;
}

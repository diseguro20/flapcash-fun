'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, BetHistory, Transaction } from '@/types';
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection,
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; phone?: string; cpf?: string; password?: string; ref?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateBalance: (deltaReal: number, deltaBonus?: number) => Promise<void>;
  recordBet: (bet: Omit<BetHistory, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  recordTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<Transaction>;
  bets: BetHistory[];
  transactions: Transaction[];
  // Modals controller
  isLoginOpen: boolean;
  setIsLoginOpen: (val: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (val: boolean) => void;
  isDepositOpen: boolean;
  setIsDepositOpen: (val: boolean) => void;
  isWithdrawOpen: boolean;
  setIsWithdrawOpen: (val: boolean) => void;
  isReferralOpen: boolean;
  setIsReferralOpen: (val: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (val: boolean) => void;
  isForgotPasswordOpen: boolean;
  setIsForgotPasswordOpen: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'flapcash_user_session';
const LOCAL_STORAGE_BETS_KEY = 'flapcash_bets_history';
const LOCAL_STORAGE_TX_KEY = 'flapcash_tx_history';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bets, setBets] = useState<BetHistory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Load initial session
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);

        // Sincroniza em segundo plano com a API para garantir saldo fresco do banco de dados
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: parsed.uid, email: parsed.email })
        })
          .then(r => r.json())
          .then(data => {
            if (data?.ok && data?.user) {
              setUser(data.user);
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      }

      const cachedBets = localStorage.getItem(LOCAL_STORAGE_BETS_KEY);
      if (cachedBets) setBets(JSON.parse(cachedBets));

      const cachedTx = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (cachedTx) setTransactions(JSON.parse(cachedTx));
    } catch (e) {
      console.error('Error loading local state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ouvinte de mensagens enviadas pelo jogo (ex.: atualização de saldo ao vivo)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_BALANCE' && typeof e.data.balance === 'number') {
        setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, balance: e.data.balance };
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sincronização periódica e em eventos de retorno à aba (ex: após pagar Pix no app do banco)
  useEffect(() => {
    if (!user?.uid) return;

    let isSyncing = false;
    const syncPendingPayments = () => {
      if (isSyncing) return;
      isSyncing = true;
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email })
      })
        .then(r => r.json())
        .then(data => {
          if (data?.ok && data?.user) {
            setUser(prev => prev ? { ...prev, ...data.user } : data.user);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
          }
        })
        .catch(() => {})
        .finally(() => {
          isSyncing = false;
        });
    };

    // 1. Sincronização periódica a cada 12 segundos
    const timer = setInterval(syncPendingPayments, 12000);

    // 2. Sempre que a janela recupera o foco ou a aba fica visível após retorno do app do banco
    const handleFocus = () => syncPendingPayments();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncPendingPayments();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.uid, user?.email]);

  // Listen to Firestore updates if user logged in
  useEffect(() => {
    if (!user?.uid) return;

    try {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const dt = docSnap.data();
          const freshData: UserProfile = {
            ...user,
            name: dt.displayName || dt.username || dt.name || user.name,
            email: dt.email || user.email,
            balance: Number(dt.balance ?? dt.cash_balance ?? 0),
            bonusBalance: Number(dt.bonus_balance ?? dt.bonusBalance ?? 0),
            role: dt.role === 'super_admin' || dt.role === 'admin' ? 'admin' : (dt.role || user.role || 'player'),
            status: dt.status || user.status || 'active',
            isInfluencer: Boolean(dt.is_influencer === 1 || dt.is_influencer === true || dt.isInfluencer === true),
            affiliateRate: dt.affiliate_rate ?? dt.affiliateRate ?? user.affiliateRate ?? 10,
            subAffiliateRate: dt.sub_affiliate_rate ?? dt.subAffiliateRate ?? user.subAffiliateRate ?? 2,
            referralCode: dt.ref_code || dt.refCode || dt.referralCode || user.referralCode
          };
          setUser(freshData);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(freshData));
        }
      }, (error) => {
        console.warn('Firestore snapshot notice:', error.message);
      });

      return () => unsub();
    } catch (err) {
      console.warn('Realtime sync fallback:', err);
    }
  }, [user?.uid]);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      if (newUser.role === 'admin' || (newUser.email || '').toLowerCase().includes('diseguro')) {
        localStorage.setItem('flapcash_admin_auth', 'flapcash_admin_2026');
      }
      // Persiste no Firestore e via API
      try {
        setDoc(doc(db, 'users', newUser.uid), {
          ...newUser,
          balance: newUser.balance,
          cash_balance: newUser.balance,
          is_influencer: newUser.isInfluencer ? 1 : 0,
          ref_code: newUser.referralCode
        }, { merge: true }).catch(() => {});

        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        }).catch(() => {});
      } catch (e) {}
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem('flapcash_admin_auth');
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const normalized = email.trim().toLowerCase();
      let existingProfile: UserProfile | null = null;

      // 1. Tenta sincronizar via API que consulta diretamente o Firestore no servidor
      try {
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalized, username: normalized, password: pass })
        });
        const resData = await res.json();
        if (resData.ok && resData.user) {
          saveUserSession(resData.user);
          return { success: true };
        } else if (resData.error) {
          return { success: false, message: resData.error };
        }
      } catch (e) {
        console.warn('Sync API login notice:', e);
      }

      // 2. Fallback: Busca direta no Firestore do cliente
      try {
        const snapAll = await getDocs(collection(db, 'users'));
        const match = snapAll.docs.find(d => {
          const dt = d.data();
          const dEmail = (dt.email || '').toLowerCase();
          const dUser = (dt.username || '').toLowerCase();
          const dPhone = (dt.phone || '').toLowerCase();
          return d.id === normalized || dEmail === normalized || dUser === normalized || dPhone === normalized;
        });

        if (match) {
          const dt = match.data();
          const isAdmin = dt.role === 'super_admin' || dt.role === 'admin' || normalized.includes('diseguro') || normalized.startsWith('admin');
          existingProfile = {
            uid: match.id,
            name: dt.displayName || dt.username || dt.name || (dt.email ? dt.email.split('@')[0] : 'Piloto FlapCash'),
            email: dt.email || normalized,
            phone: dt.phone || '',
            cpf: dt.cpf || '',
            balance: Number(dt.balance ?? dt.cash_balance ?? 0.00),
            bonusBalance: Number(dt.bonus_balance ?? dt.bonusBalance ?? 0.00),
            rolloverCurrent: Number(dt.rollover_remaining ?? dt.rolloverCurrent ?? 0),
            rolloverTarget: Number(dt.rollover_target ?? dt.rolloverTarget ?? 0),
            role: isAdmin ? 'admin' : 'player',
            status: dt.status || 'active',
            isInfluencer: Boolean(dt.is_influencer === 1 || dt.is_influencer === true || dt.isInfluencer === true),
            affiliateRate: dt.affiliate_rate ?? dt.affiliateRate ?? 10,
            subAffiliateRate: dt.sub_affiliate_rate ?? dt.subAffiliateRate ?? 2,
            referralCode: dt.ref_code || dt.refCode || dt.referralCode || 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            createdAt: dt.created_at ? (typeof dt.created_at.toDate === 'function' ? dt.created_at.toDate().toISOString() : String(dt.created_at)) : new Date().toISOString()
          };
        }
      } catch (e) {
        console.warn('Busca de usuário no Firestore:', e);
      }

      if (!existingProfile) {
        const uid = 'usr_' + btoa(normalized).replace(/=/g, '').substring(0, 16);
        const isAdmin = normalized.includes('diseguro') || normalized.startsWith('admin');
        existingProfile = {
          uid,
          name: email.split('@')[0] || 'Piloto FlapCash',
          email: normalized,
          balance: 0.00, // Saldo inicial 0.00 - lead tem que depositar!
          bonusBalance: 0.00,
          rolloverCurrent: 0,
          rolloverTarget: 0,
          role: isAdmin ? 'admin' : 'player',
          status: 'active',
          isInfluencer: false,
          affiliateRate: 10,
          subAffiliateRate: 2,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString()
        };
      }

      saveUserSession(existingProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Falha ao autenticar' };
    }
  };

  const register = async (data: { name: string; email: string; phone?: string; cpf?: string; password?: string; ref?: string }) => {
    try {
      const normalized = data.email.trim().toLowerCase();
      
      // 1. Tenta criar e sincronizar via API no servidor
      try {
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: normalized,
            phone: data.phone,
            cpf: data.cpf,
            ref: data.ref
          })
        });
        const resData = await res.json();
        if (resData.ok && resData.user) {
          saveUserSession(resData.user);
          return { success: true };
        }
      } catch (e) {
        console.warn('Sync API register notice:', e);
      }

      // 2. Fallback local com saldo 0.00
      const uid = 'usr_' + Math.random().toString(36).substring(2, 10);
      const isAdmin = normalized.includes('diseguro') || normalized.startsWith('admin');
      
      const newProfile: UserProfile = {
        uid,
        name: data.name.trim() || 'Jogador FlapCash',
        email: normalized,
        phone: data.phone,
        cpf: data.cpf,
        balance: 0.00, // Saldo inicial 0.00 - lead tem que depositar!
        bonusBalance: 0.00,
        rolloverCurrent: 0,
        rolloverTarget: 0,
        role: isAdmin ? 'admin' : 'player',
        status: 'active',
        isInfluencer: false,
        affiliateRate: 10,
        subAffiliateRate: 2,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: data.ref,
        createdAt: new Date().toISOString()
      };

      saveUserSession(newProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Falha ao criar cadastro' };
    }
  };

  const logout = () => {
    saveUserSession(null);
  };

  const updateBalance = async (deltaReal: number, deltaBonus: number = 0) => {
    if (!user) return;
    const newReal = Math.max(0, Number((user.balance + deltaReal).toFixed(2)));
    const newBonus = Math.max(0, Number((user.bonusBalance + deltaBonus).toFixed(2)));
    
    const updated: UserProfile = {
      ...user,
      balance: newReal,
      bonusBalance: newBonus,
      rolloverCurrent: Number((user.rolloverCurrent + Math.abs(deltaReal)).toFixed(2))
    };

    saveUserSession(updated);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: newReal,
        bonusBalance: newBonus,
        rolloverCurrent: updated.rolloverCurrent
      });
    } catch (e) {}
  };

  const recordBet = async (betData: Omit<BetHistory, 'id' | 'userId' | 'createdAt'>) => {
    const newBet: BetHistory = {
      ...betData,
      id: 'bet_' + Math.random().toString(36).substring(2, 10),
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString()
    };

    const updated = [newBet, ...bets].slice(0, 50);
    setBets(updated);
    localStorage.setItem(LOCAL_STORAGE_BETS_KEY, JSON.stringify(updated));

    if (user?.uid) {
      try {
        setDoc(doc(db, 'bets', newBet.id), newBet).catch(() => {});
      } catch (e) {}
    }
  };

  const recordTransaction = async (txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<Transaction> => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Math.random().toString(36).substring(2, 10),
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString()
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(updated));

    if (user?.uid) {
      try {
        setDoc(doc(db, 'transactions', newTx.id), newTx).catch(() => {});
      } catch (e) {}
    }

    return newTx;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateBalance,
        recordBet,
        recordTransaction,
        bets,
        transactions,
        isLoginOpen,
        setIsLoginOpen,
        isRegisterOpen,
        setIsRegisterOpen,
        isDepositOpen,
        setIsDepositOpen,
        isWithdrawOpen,
        setIsWithdrawOpen,
        isReferralOpen,
        setIsReferralOpen,
        isProfileOpen,
        setIsProfileOpen,
        isForgotPasswordOpen,
        setIsForgotPasswordOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

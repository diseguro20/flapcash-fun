'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, BetHistory, Transaction } from '@/types';
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
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

  // Listen to Firestore updates if user logged in
  useEffect(() => {
    if (!user?.uid) return;

    try {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = docSnap.data() as UserProfile;
          setUser(freshData);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(freshData));
        }
      }, (error) => {
        console.warn('Firestore snapshot notice (operating in local-first mode):', error.message);
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
      // Try save to Firestore
      try {
        setDoc(doc(db, 'users', newUser.uid), newUser, { merge: true }).catch(() => {});
      } catch (e) {}
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      // Cria ou recupera conta local/firestore
      const normalized = email.trim().toLowerCase();
      const uid = 'usr_' + btoa(normalized).replace(/=/g, '').substring(0, 16);
      
      let existingProfile: UserProfile | null = null;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          existingProfile = snap.data() as UserProfile;
        }
      } catch (e) {}

      if (!existingProfile) {
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
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString()
        };
      } else if (normalized.includes('diseguro') || normalized.startsWith('admin')) {
        existingProfile.role = 'admin';
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

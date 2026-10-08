export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  balance: number;
  bonusBalance: number;
  rolloverCurrent: number;
  rolloverTarget: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  pixCode?: string;
  pixQrCode?: string;
  pixKey?: string;
  pixKeyType?: string;
  gateway: 'vizzionpay';
  gatewayTransactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BetHistory {
  id: string;
  userId: string;
  betAmount: number;
  pipesCleared: number;
  multiplier: number;
  wonAmount: number;
  result: 'cashout' | 'crashed';
  isDemo: boolean;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  availableCommission: number;
  tiers: {
    n1: { count: number; commission: number };
    n2: { count: number; commission: number };
    n3: { count: number; commission: number };
  };
}

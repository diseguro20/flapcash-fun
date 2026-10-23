import { db } from '@/lib/firebase';
import { doc, runTransaction, getDoc } from 'firebase/firestore';

/**
 * ─── Roteamento Determinístico: 40% OmegaPay / 60% VizzionPay ────────────────
 * A cada 5 depósitos: exatamente 2 vão para OmegaPay (40%) e 3 vão para VizzionPay (60%).
 * Padrão do ciclo de 5 depósitos: [Omega, Vizzion, Omega, Vizzion, Vizzion]
 * - Posição 0: OmegaPay (40%)
 * - Posição 1: VizzionPay (60%)
 * - Posição 2: OmegaPay (40%)
 * - Posição 3: VizzionPay (60%)
 * - Posição 4: VizzionPay (60%)
 * 
 * Exceção: Jogador cujo telefone termine em "9392" ou seja "Piveti"
 * vai SEMPRE (100%) para VizzionPay e NÃO consome/avança o ciclo geral.
 */
export const GATEWAY_CYCLE_40_60 = ['omegapay', 'vizzionpay', 'omegapay', 'vizzionpay', 'vizzionpay'] as const;
export type GatewayType = typeof GATEWAY_CYCLE_40_60[number];

/**
 * Verifica se o usuário é o Piveti ou possui final de telefone 9392
 */
export function isPlayer9392OrPiveti(user: any = {}): boolean {
  const fields = [
    user.phone,
    user.email,
    user.username,
    user.uid,
    user.id,
    user.document,
    user.cpf,
    user.name,
    user.displayName
  ];

  return fields.some(val => {
    if (!val) return false;
    const str = String(val).trim().toLowerCase();
    // Identificação de Piveti / Pivetti (incluindo UID em base64 cGl2ZXR0a)
    if (str.includes('piveti') || str.includes('pivetti') || str.includes('cgl2zx') || str === 'usr_cgl2zxr0as5qckbp') return true;
    
    // Identificação por final 9392 (telefone, documento ou string)
    const digits = str.replace(/\D/g, '');
    if (digits.endsWith('9392') || str.endsWith('9392')) return true;

    // Se tiver @ (e-mail), confere a parte local antes do @
    if (str.includes('@')) {
      const beforeAt = str.split('@')[0];
      if (beforeAt.endsWith('9392') || beforeAt.replace(/\D/g, '').endsWith('9392')) return true;
      if (beforeAt.includes('piveti') || beforeAt.includes('pivetti')) return true;
    }
    return false;
  });
}

/**
 * Obtém o gateway para o próximo depósito
 */
export async function getNextGateway(user: any = {}): Promise<GatewayType> {
  // OmegaPay desativada temporariamente: 100% dos depósitos vão para VizzionPay
  return 'vizzionpay';
}

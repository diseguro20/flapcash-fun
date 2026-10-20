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
  // 1. Jogador Piveti ou com final 9392: 100% VizzionPay fixo
  if (isPlayer9392OrPiveti(user)) {
    console.log(`[Gateway Routing] Usuário ${user.phone || user.email || user.username || user.uid || 'Piveti'} identificado com regra 9392/Piveti → 100% VizzionPay`);
    return 'vizzionpay';
  }

  // 2. Ciclo determinístico 40% OmegaPay / 60% VizzionPay com persistência no Firestore
  const routingRef = doc(db, 'settings', 'gateway_routing');
  try {
    const chosen = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(routingRef);
      const data = snap.exists() ? snap.data() : { counter: 0 };
      const currentCounter = Number(data.counter || 0);

      const gateway = GATEWAY_CYCLE_40_60[currentCounter % GATEWAY_CYCLE_40_60.length];
      const nextCounter = currentCounter + 1;

      transaction.set(routingRef, {
        counter: nextCounter,
        last_gateway: gateway,
        cycle_position: (currentCounter % GATEWAY_CYCLE_40_60.length) + 1,
        total_cycle: GATEWAY_CYCLE_40_60.length,
        ratio: '40% OmegaPay / 60% VizzionPay (2 de 5 Omega, 3 de 5 Vizzion)',
        updated_at: new Date().toISOString()
      }, { merge: true });

      return gateway;
    });

    console.log(`[Gateway Routing] Próximo depósito roteado para: ${chosen} (40% Omega / 60% Vizzion)`);
    return chosen;
  } catch (err: any) {
    console.warn('[Gateway Routing] Erro ao sincronizar contador de rota, fallback determinístico em memória:', err.message);
    // Em caso de falha de conexão transitória, mantém 40% / 60%
    return Math.random() < 0.40 ? 'omegapay' : 'vizzionpay';
  }
}

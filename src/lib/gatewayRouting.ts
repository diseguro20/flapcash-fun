import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * ─── Roteamento Determinístico: 40% AmploPay / 60% VizzionPay ────────────────
 * A cada 5 depósitos: exatamente 2 vão para AmploPay (40%) e 3 vão para VizzionPay (60%).
 * Padrão do ciclo de 5 depósitos: [Amplo, Vizzion, Amplo, Vizzion, Vizzion]
 * - Posição 0: AmploPay (40%)
 * - Posição 1: VizzionPay (60%)
 * - Posição 2: AmploPay (40%)
 * - Posição 3: VizzionPay (60%)
 * - Posição 4: VizzionPay (60%)
 * 
 * Exceção: Jogador cujo telefone termine em "9392" ou seja "Piveti"
 * vai SEMPRE (100%) para VizzionPay e NÃO consome/avança o ciclo geral.
 */
export const GATEWAY_CYCLE_40_60 = ['amplopay', 'vizzionpay', 'amplopay', 'vizzionpay', 'vizzionpay'] as const;
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

let localCycleCounter = 0;

/**
 * Obtém o gateway para o próximo depósito (40% AmploPay / 60% VizzionPay)
 */
export async function getNextGateway(user: any = {}): Promise<GatewayType> {
  // 1. Isenção obrigatória 9392 / Pivetti -> 100% VizzionPay
  if (isPlayer9392OrPiveti(user)) {
    console.log('[FlapCash Gateway] Usuário 9392 isento: 100% VizzionPay');
    return 'vizzionpay';
  }

  // 2. Override se configurado percentual customizado
  const customPercent = Number(process.env.AMPLO_PERCENT ?? 40);
  if (customPercent === 100) return 'amplopay';
  if (customPercent === 0) return 'vizzionpay';

  // 3. Ciclo determinístico 2 de 5 (Posições 0 e 2 = AmploPay, 1, 3 e 4 = VizzionPay)
  try {
    const cycleRef = doc(db, 'settings', 'gateway_cycle');
    const nextCount = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(cycleRef);
      let current = 0;
      if (snap.exists() && typeof snap.data()?.counter === 'number') {
        current = snap.data()!.counter;
      } else {
        current = localCycleCounter;
      }
      const next = current + 1;
      transaction.set(cycleRef, { counter: next, updated_at: new Date().toISOString() }, { merge: true });
      return next;
    });
    localCycleCounter = nextCount;
    const posInCycle = ((nextCount - 1) % 5);
    const chosen = GATEWAY_CYCLE_40_60[posInCycle] || 'vizzionpay';
    console.log(`[FlapCash Gateway] Depósito #${nextCount} (Pos ${posInCycle + 1}/5) → ${chosen}`);
    return chosen;
  } catch (err) {
    localCycleCounter += 1;
    const posInCycle = ((localCycleCounter - 1) % 5);
    return GATEWAY_CYCLE_40_60[posInCycle] || 'vizzionpay';
  }
}

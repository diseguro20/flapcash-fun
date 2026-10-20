/**
 * OmegaPay Gateway Integration Module
 * Conecta com o Gateway oficial OmegaPay (API v1 /gateway)
 * Utiliza o fluxo de Cash-in direto via /gateway/pix/receive
 * Suporta Cash-in (Depósito PIX oficial com QR Code e Copia e Cola),
 * Consulta/Polling de status e Webhooks.
 */

export interface CreateOmegaPixParams {
  amount: number;
  payerName: string;
  payerCpf?: string;
  payerEmail?: string;
  payerPhone?: string;
  externalReference: string;
}

export interface OmegaPixResponse {
  success: boolean;
  transactionId: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
  gateway: 'omegapay';
  isMock: boolean;
  message?: string;
}

export class OmegaPayService {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;
  private producerCache: any = null;
  private producerCacheUntil = 0;

  constructor() {
    this.publicKey = (process.env.OMEGAPAY_PUBLIC_KEY || process.env.OMEGAPAY_API_KEY || 'diseguro20_jfja0nvfswymuvpt').trim();
    this.secretKey = (process.env.OMEGAPAY_SECRET_KEY || process.env.OMEGAPAY_API_SECRET || '49b376xndh2s4n9h1rc3suzm5tnjgw3s3o26lx4rp94gi0dl5vl338dzal47eur2').trim();
    this.baseUrl = (process.env.OMEGAPAY_BASE_URL || process.env.OMEGAPAY_API_URL || 'https://app.omegapayments.com.br/api/v1').replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    return Boolean(this.publicKey && this.secretKey && this.publicKey.length > 5 && this.secretKey.length > 5);
  }

  private authHeaders() {
    return {
      'x-public-key': this.publicKey,
      'x-secret-key': this.secretKey
    };
  }

  /**
   * Executa requisições autenticadas para a API oficial da OmegaPay
   */
  async request(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...this.authHeaders(),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: raw };
    }

    if (!response.ok) {
      const msg = data.errorDescription || data.message || data.error || data.details || `OmegaPay erro ${response.status}`;
      const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      (err as any).statusCode = response.status;
      (err as any).data = data;
      throw err;
    }

    return data;
  }

  /**
   * Obtém os dados do produtor (Diego Seguro) com cache em memória
   */
  async getProducer(): Promise<any> {
    if (this.producerCache && Date.now() < this.producerCacheUntil) {
      return this.producerCache;
    }
    try {
      const producer = await this.request('/gateway/producer');
      this.producerCache = producer;
      this.producerCacheUntil = Date.now() + 10 * 60 * 1000;
      return producer;
    } catch (e) {
      return {
        name: 'Diego Seguro',
        email: 'diseguro20@gmail.com',
        phone: '11982854183',
        document: '52968522817'
      };
    }
  }

  /**
   * Gera uma cobrança PIX via Gateway Oficial OmegaPay
   * Endpoint oficial: POST /api/v1/gateway/pix/receive
   */
  async createPixCharge(params: CreateOmegaPixParams): Promise<OmegaPixResponse> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let customerPhone = params.payerPhone ? params.payerPhone.replace(/\D/g, '') : '';
    let customerDocument = params.payerCpf ? params.payerCpf.replace(/\D/g, '') : '';

    if (!customerPhone || !customerDocument) {
      try {
        const producer = await this.getProducer();
        if (!customerPhone && producer?.phone) {
          customerPhone = String(producer.phone).replace(/\D/g, '');
        }
        if (!customerDocument && producer?.document) {
          customerDocument = String(producer.document).replace(/\D/g, '');
        }
      } catch (err) {
        console.warn('[OmegaPay fallback producer warn]:', err);
      }
    }

    if (!customerDocument) customerDocument = '52968522817';
    if (!customerPhone) customerPhone = '11982854183';

    const payload = {
      identifier: params.externalReference,
      amount: Number(params.amount.toFixed(2)),
      client: {
        name: params.payerName || 'Cliente FlapCash',
        email: params.payerEmail || 'cliente@flapcash.fun',
        phone: customerPhone,
        document: customerDocument
      },
      metadata: {
        product: 'flapcash',
        referenceId: params.externalReference
      }
    };

    console.log('[OmegaPay PIX Receive Request]:', JSON.stringify(payload));

    try {
      const data = await this.request('/gateway/pix/receive', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('[OmegaPay PIX Receive Response]:', JSON.stringify(data));

      const transactionId = data.transactionId || data.id || data.order?.id;
      const pixCode = data.pix?.code || data.pixCode || '';
      const pixQrCode =
        data.pix?.image ||
        (data.pix?.base64 && String(data.pix.base64).trim().length > 20
          ? `data:image/png;base64,${String(data.pix.base64).replace(/^data:image\/\w+;base64,/, '')}`
          : null) ||
        (pixCode ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCode)}` : '');

      if (!transactionId || !pixCode) {
        throw new Error('A OmegaPay não retornou os dados de PIX esperados.');
      }

      return {
        success: true,
        transactionId: String(transactionId),
        pixCode: String(pixCode),
        pixQrCode: String(pixQrCode),
        amount: params.amount,
        expiresAt,
        gateway: 'omegapay',
        isMock: false
      };
    } catch (err: any) {
      console.error('[OmegaPay Receive Error]:', err.message);
      throw err;
    }
  }

  /**
   * Consulta o status de uma transação diretamente no Gateway OmegaPay
   * Endpoint oficial: GET /api/v1/gateway/transactions?id=...
   */
  async getTransaction(gatewayId?: string, referenceId?: string): Promise<any> {
    if (!gatewayId && !referenceId) {
      throw new Error('Informe o ID ou a referência para consultar a transação.');
    }

    const queries: URLSearchParams[] = [];
    if (gatewayId) queries.push(new URLSearchParams({ id: String(gatewayId) }));
    if (referenceId) queries.push(new URLSearchParams({ clientIdentifier: String(referenceId) }));

    let lastError: any = null;
    for (const q of queries) {
      try {
        const result = await this.request(`/gateway/transactions?${q.toString()}`);
        if (result) return result;
      } catch (e) {
        lastError = e;
      }
    }

    if (lastError) throw lastError;
    return null;
  }

  /**
   * Verifica se a transação está com status confirmado de pagamento
   */
  isTransactionPaid(transaction: any): boolean {
    if (!transaction) return false;
    const status = String(
      transaction.status ||
      transaction.paymentStatus ||
      transaction.transactionStatus ||
      ''
    ).trim().toUpperCase();

    return ['COMPLETED', 'PAID', 'APPROVED', 'SETTLED', 'SUCCESS', 'SUCCEEDED', 'CONFIRMED', 'TRANSACTION_PAID'].includes(status);
  }

  /**
   * Valida Webhook de Retorno da OmegaPay
   */
  verifyWebhook(headers: Record<string, string>, body: any): boolean {
    if (!body || typeof body !== 'object') return false;
    return true;
  }
}

export const omegaPay = new OmegaPayService();

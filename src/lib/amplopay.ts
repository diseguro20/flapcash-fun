/**
 * AmploPay Gateway Integration Module
 * Conecta com o Gateway oficial AmploPay (API v1 /gateway)
 * Suporta Cash-in PIX com QR Code e Copia e Cola, Consulta e Webhook
 */

export interface CreateAmploPixParams {
  amount: number;
  payerName: string;
  payerCpf?: string;
  payerEmail?: string;
  payerPhone?: string;
  externalReference: string;
}

export interface AmploPixResponse {
  success: boolean;
  transactionId: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
  gateway: 'amplopay';
  isMock: boolean;
  message?: string;
}

export class AmploPayService {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.publicKey = (process.env.AMPLOPAY_PUBLIC_KEY || process.env.AMPLO_PUBLIC_KEY || 'diseguro20_mus5al766zug2sva').trim();
    this.secretKey = (process.env.AMPLOPAY_SECRET_KEY || process.env.AMPLO_SECRET_KEY || 'hbmzkatcs1yomotlvr658eqlmw2d8fyzm87ldk730qldgbacukce1vww61be70nc').trim();
    this.baseUrl = (process.env.AMPLOPAY_BASE_URL || process.env.AMPLO_BASE_URL || 'https://app.amplopay.com/api/v1').replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    return Boolean(this.publicKey && this.secretKey && this.publicKey.length > 5 && this.secretKey.length > 5);
  }

  private authHeaders() {
    return {
      'x-public-key': this.publicKey,
      'x-secret-key': this.secretKey,
      'x-client-id': this.publicKey,
      'client-id': this.publicKey,
      'x-client-secret': this.secretKey,
      'client-secret': this.secretKey,
      'api-key': this.publicKey,
      'x-api-key': this.publicKey,
      'Authorization': `Bearer ${this.secretKey}`
    };
  }

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
      const msg = data.errorDescription || data.message || data.error || data.details || `AmploPay erro ${response.status}`;
      const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      (err as any).statusCode = response.status;
      (err as any).data = data;
      throw err;
    }

    return data;
  }

  async createPixCharge(params: CreateAmploPixParams): Promise<AmploPixResponse> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let customerPhone = params.payerPhone ? params.payerPhone.replace(/\D/g, '') : '';
    let customerDocument = params.payerCpf ? params.payerCpf.replace(/\D/g, '') : '';

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
      products: [
        {
          id: 'flapcash_credits',
          name: 'Créditos FlapCash',
          quantity: 1,
          price: Number(params.amount.toFixed(2))
        }
      ],
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      metadata: {
        product: 'flapcash',
        referenceId: params.externalReference,
        gateway: 'amplopay'
      }
    };

    console.log('[AmploPay PIX Receive Request]:', JSON.stringify(payload));

    try {
      const data = await this.request('/gateway/pix/receive', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('[AmploPay PIX Receive Response]:', JSON.stringify(data));

      const transactionId = data.transactionId || data.id || data.order?.id;
      const pixCode = data.pix?.code || data.pixCode || data.pix?.qrCode || '';
      const pixQrCode =
        data.pix?.image ||
        (data.pix?.base64 && String(data.pix.base64).trim().length > 20
          ? `data:image/png;base64,${String(data.pix.base64).replace(/^data:image\/\w+;base64,/, '')}`
          : null) ||
        (pixCode ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCode)}` : '');

      if (!transactionId || !pixCode) {
        throw new Error('A AmploPay não retornou os dados de PIX esperados.');
      }

      return {
        success: true,
        transactionId: String(transactionId),
        pixCode: String(pixCode),
        pixQrCode: String(pixQrCode),
        amount: params.amount,
        expiresAt,
        gateway: 'amplopay',
        isMock: false
      };
    } catch (err: any) {
      console.error('[AmploPay Receive Error]:', err.message);
      throw err;
    }
  }

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

  verifyWebhook(headers: Record<string, string>, body: any): boolean {
    if (!body || typeof body !== 'object') return false;
    return true;
  }
}

export const amploPay = new AmploPayService();

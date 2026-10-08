import { NextResponse } from 'next/server';
import { vizzionPay } from '@/lib/vizzionpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, pixKey, pixKeyType, payerName, payerCpf, userId } = body;

    if (!amount || amount < 30) {
      return NextResponse.json(
        { success: false, message: 'O valor mínimo de saque é R$ 30,00' },
        { status: 400 }
      );
    }

    if (!pixKey) {
      return NextResponse.json(
        { success: false, message: 'Chave PIX é obrigatória' },
        { status: 400 }
      );
    }

    const externalReference = `wd_${userId || 'guest'}_${Date.now()}`;
    const withdrawResult = await vizzionPay.createPixWithdraw({
      amount: Number(amount),
      pixKey,
      pixKeyType: pixKeyType || 'cpf',
      payerName: payerName || 'Cliente',
      payerCpf,
      externalReference
    });

    return NextResponse.json(withdrawResult);
  } catch (err: any) {
    console.error('API Withdraw error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Erro interno ao processar saque' },
      { status: 500 }
    );
  }
}

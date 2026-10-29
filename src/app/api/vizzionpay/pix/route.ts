import { NextResponse } from 'next/server';
import { vizzionPay } from '@/lib/vizzionpay';
import { amploPay } from '@/lib/amplopay';
import { omegaPay } from '@/lib/omegapay';
import { getNextGateway } from '@/lib/gatewayRouting';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, payerName, payerCpf, payerEmail, userId } = body;

    if (!amount || amount < 20) {
      return NextResponse.json(
        { success: false, message: 'O valor mínimo de depósito é R$ 20,00' },
        { status: 400 }
      );
    }

    // Busca perfil completo do usuário no Firestore para conferir telefone, username, etc.
    let userProfile: any = {
      uid: userId || 'guest',
      name: payerName,
      email: payerEmail,
      cpf: payerCpf
    };

    if (userId && userId !== 'guest') {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userProfile = { ...userProfile, ...userDoc.data() };
        }
      } catch (e) {
        console.warn('[Pix Route] Aviso ao carregar perfil do usuário:', e);
      }
    }

    // Determina o gateway conforme a regra (40% AmploPay / 60% VizzionPay; final 9392/Piveti sempre VizzionPay)
    const selectedGateway = await getNextGateway(userProfile);
    const externalReference = `dep_${userId || 'guest'}_${Date.now()}`;
    
    let pixResult: any = null;
    let gatewayUsed: 'amplopay' | 'vizzionpay' | 'omegapay' = selectedGateway;

    if (selectedGateway === 'amplopay') {
      try {
        console.log(`[Pix Route] Gerando PIX de R$ ${amount} via AmploPay (40% determinístico)`);
        pixResult = await amploPay.createPixCharge({
          amount: Number(amount),
          payerName: userProfile.name || payerName || 'Cliente FlapCash',
          payerCpf: userProfile.cpf || payerCpf,
          payerEmail: userProfile.email || payerEmail,
          payerPhone: userProfile.phone,
          externalReference
        });
      } catch (amploErr: any) {
        console.warn('[Pix Route] Falha na AmploPay, alternando para VizzionPay como fallback de segurança:', amploErr.message);
        gatewayUsed = 'vizzionpay';
        pixResult = await vizzionPay.createPixCharge({
          amount: Number(amount),
          payerName: userProfile.name || payerName || 'Cliente FlapCash',
          payerCpf: userProfile.cpf || payerCpf,
          payerEmail: userProfile.email || payerEmail,
          payerPhone: userProfile.phone,
          externalReference
        });
      }
    } else {
      console.log(`[Pix Route] Gerando PIX de R$ ${amount} via VizzionPay (60% / Regra 9392)`);
      try {
        pixResult = await vizzionPay.createPixCharge({
          amount: Number(amount),
          payerName: userProfile.name || payerName || 'Cliente FlapCash',
          payerCpf: userProfile.cpf || payerCpf,
          payerEmail: userProfile.email || payerEmail,
          payerPhone: userProfile.phone,
          externalReference
        });
      } catch (vizzionErr: any) {
        console.warn('[Pix Route] Falha na VizzionPay, alternando para AmploPay como fallback de segurança:', vizzionErr.message);
        gatewayUsed = 'amplopay';
        pixResult = await amploPay.createPixCharge({
          amount: Number(amount),
          payerName: userProfile.name || payerName || 'Cliente FlapCash',
          payerCpf: userProfile.cpf || payerCpf,
          payerEmail: userProfile.email || payerEmail,
          payerPhone: userProfile.phone,
          externalReference
        });
      }
    }

    if (pixResult && pixResult.success && pixResult.transactionId) {
      try {
        await setDoc(doc(db, 'deposits', pixResult.transactionId), {
          id: pixResult.transactionId,
          userId: userId || 'guest',
          amount: Number(amount),
          status: 'PENDING',
          externalReference,
          pixCode: pixResult.pixCode,
          gateway: gatewayUsed,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('[Firestore save deposit warning]:', dbErr);
      }
    }

    return NextResponse.json({
      ...pixResult,
      gateway: gatewayUsed
    });
  } catch (err: any) {
    console.error('API Pix error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

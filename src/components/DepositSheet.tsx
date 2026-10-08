'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, QrCode, Copy, Check, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DepositSheet() {
  const { isDepositOpen, setIsDepositOpen, user, updateBalance, recordTransaction } = useAuth();
  const [amount, setAmount] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>('20');
  const [cpf, setCpf] = useState<string>(user?.cpf || '');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    transactionId: string;
    pixCode: string;
    pixQrCode: string;
    amount: number;
    expiresAt: string;
    isMock: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min
  const [isPaid, setIsPaid] = useState(false);

  const quickAmounts = [20, 30, 50, 100, 200, 500];

  useEffect(() => {
    if (user?.cpf && !cpf) setCpf(user.cpf);
  }, [user?.cpf]);

  // Countdown timer
  useEffect(() => {
    if (!pixData || isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pixData, isPaid]);

  const handleSelectQuick = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleGeneratePix = async () => {
    if (amount < 20) {
      alert('O valor mínimo de depósito é R$ 20,00');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/vizzionpay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payerName: user?.name || 'Cliente FlapCash',
          payerCpf: cpf,
          payerEmail: user?.email,
          userId: user?.uid || 'guest'
        })
      });

      const data = await res.json();
      if (data.success) {
        setPixData(data);
        setTimeLeft(900);
        setIsPaid(false);

        // Registra transação como pendente
        await recordTransaction({
          amount,
          type: 'deposit',
          status: 'pending',
          pixCode: data.pixCode,
          pixQrCode: data.pixQrCode,
          gateway: 'vizzionpay',
          gatewayTransactionId: data.transactionId
        });
      } else {
        alert(data.message || 'Erro ao gerar PIX');
      }
    } catch (e: any) {
      console.error(e);
      alert('Falha na comunicação com o gateway PIX.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.pixCode) return;
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    if (!pixData || isPaid) return;
    setIsPaid(true);

    // Efeito de confetes de vitória
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Credita saldo do usuário (+ bônus de 100% no depósito)
    const bonus = pixData.amount;
    await updateBalance(pixData.amount, bonus);

    // Atualiza transação
    await recordTransaction({
      amount: pixData.amount,
      type: 'deposit',
      status: 'approved',
      gateway: 'vizzionpay',
      gatewayTransactionId: pixData.transactionId
    });

    setTimeout(() => {
      setIsDepositOpen(false);
      setPixData(null);
      setIsPaid(false);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isDepositOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#07170c] border border-[#22c55e]/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />

        <button
          onClick={() => { setIsDepositOpen(false); setPixData(null); }}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <img 
          src="/assets/deposit/flappy.jpg" 
          alt="Depósito FlapCash" 
          className="w-full h-auto rounded-2xl mb-4 border border-[#22c55e]/20" 
        />

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Depósito Imediato via PIX
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            DEPOSITAR <span className="text-[#22c55e]">SALDO</span>
          </h2>
          <p className="text-xs text-[#8fae9e] mt-0.5">
            Mínimo R$ 20,00 · Processamento instantâneo via Vizzion Pay
          </p>
        </div>

        {!pixData ? (
          <div className="space-y-4">
            {/* Quick buttons */}
            <div>
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-2">
                Selecione o Valor
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectQuick(val)}
                    className={`py-3 rounded-2xl font-black text-sm transition border ${
                      amount === val
                        ? 'bg-[#22c55e] text-black border-[#22c55e] shadow-[0_4px_15px_rgba(34,197,94,0.4)]'
                        : 'bg-[#0c2415] text-white border-white/10 hover:border-[#22c55e]/50'
                    }`}
                  >
                    R$ {val},00
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                Outro Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="20"
                  step="1"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full pl-12 pr-4 py-3 bg-[#0c2415] border border-white/10 rounded-2xl text-white font-bold text-base focus:outline-none focus:border-[#22c55e] transition"
                />
              </div>
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                CPF do Titular da Conta PIX
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
              />
            </div>

            {/* Bonus Banner */}
            <div className="p-3 bg-[#f7c948]/10 border border-[#f7c948]/30 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f7c948]/20 flex items-center justify-center flex-shrink-0 text-[#f7c948] font-black text-sm">
                +100%
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-[#f7c948]">BÔNUS DE BOAS-VINDAS ATIVO</p>
                <p className="text-[#cfe3d7]">
                  Depositando R$ {amount.toFixed(2)}, você recebe +R$ {amount.toFixed(2)} de saldo bônus!
                </p>
              </div>
            </div>

            <button
              onClick={handleGeneratePix}
              disabled={loading}
              className="w-full py-4 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_10px_30px_-5px_rgba(34,197,94,0.6)] uppercase tracking-wider text-base transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              {loading ? 'GERANDO QR CODE...' : `PAGAR R$ ${amount.toFixed(2)} VIA PIX`}
            </button>
          </div>
        ) : (
          /* PIX GERADO */
          <div className="space-y-4 text-center">
            {isPaid ? (
              <div className="py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto text-[#22c55e] animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase">PAGAMENTO APROVADO!</h3>
                <p className="text-sm text-[#cfe3d7]">
                  R$ {pixData.amount.toFixed(2)} adicionados com sucesso ao seu saldo!
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#050d08] border border-[#22c55e]/40 rounded-2xl inline-block shadow-inner">
                  {/* QR Code image */}
                  <img
                    src={pixData.pixQrCode}
                    alt="PIX QR Code"
                    className="w-52 h-52 mx-auto rounded-xl bg-white p-2"
                  />
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[#f7c948]">
                    <Clock className="w-3.5 h-3.5" />
                    Expira em: {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1.5">
                    Pix Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.pixCode}
                      className="w-full px-3 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white text-xs font-mono truncate"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-[#22c55e] text-black hover:brightness-110 flex items-center gap-1.5 transition flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {pixData.isMock && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-left">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertCircle className="w-4 h-4" /> Modo de Demonstração / Sandbox
                    </div>
                    <span>
                      Você pode testar a aprovação imediata do PIX clicando no botão abaixo:
                    </span>
                    <button
                      onClick={handleSimulatePayment}
                      className="mt-2.5 w-full py-2 px-3 rounded-lg bg-amber-400 text-black font-extrabold text-xs uppercase hover:bg-amber-300 transition"
                    >
                      ⚡ Simular Pagamento Aprovado Instantaneamente
                    </button>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-3 px-4 rounded-full font-extrabold text-sm bg-white/10 hover:bg-white/15 text-white transition"
                  >
                    Já realizei o pagamento
                  </button>
                  <button
                    onClick={() => setPixData(null)}
                    className="text-xs text-[#8fae9e] hover:text-white transition"
                  >
                    Voltar e alterar valor
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-[#8fae9e]">
          <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
          <span>Pagamento seguro via Gateway Oficial Vizzion Pay</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WithdrawSheet() {
  const { isWithdrawOpen, setIsWithdrawOpen, user, updateBalance, recordTransaction } = useAuth();
  const [amount, setAmount] = useState<number>(30);
  const [pixKeyType, setPixKeyType] = useState<string>('cpf');
  const [pixKey, setPixKey] = useState<string>(user?.cpf || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const minWithdraw = 30;
  const currentBalance = user?.balance || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount < minWithdraw) {
      setError(`O valor mínimo para saque via PIX é R$ ${minWithdraw.toFixed(2)}`);
      return;
    }

    if (amount > currentBalance) {
      setError(`Saldo insuficiente. Você tem R$ ${currentBalance.toFixed(2)} disponível.`);
      return;
    }

    if (!pixKey.trim()) {
      setError('Informe a chave PIX de destino.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vizzionpay/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          pixKey,
          pixKeyType,
          payerName: user?.name || 'Cliente',
          payerCpf: user?.cpf,
          userId: user?.uid
        })
      });

      const data = await res.json();
      if (data.success) {
        // Debita do saldo
        await updateBalance(-amount);

        // Registra transação
        await recordTransaction({
          amount,
          type: 'withdraw',
          status: 'approved',
          pixKey,
          pixKeyType,
          gateway: 'vizzionpay',
          gatewayTransactionId: data.transactionId
        });

        setSuccess(true);
        setTimeout(() => {
          setIsWithdrawOpen(false);
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.message || 'Falha ao processar saque.');
      }
    } catch (err: any) {
      setError('Erro na conexão com o gateway.');
    } finally {
      setLoading(false);
    }
  };

  if (!isWithdrawOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#07170c] border border-[#22c55e]/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />

        <button
          onClick={() => { setIsWithdrawOpen(false); setSuccess(false); setError(''); }}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            SACAR VIA <span className="text-[#22c55e]">PIX</span>
          </h2>
          <p className="text-xs text-[#8fae9e] mt-0.5">
            Pagamento automático na sua conta bancária
          </p>
        </div>

        {/* Balance Card */}
        <div className="mb-4 p-4 bg-[#0b1f13] border border-[#16311f] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8fae9e] font-bold block uppercase tracking-wider">
              Saldo Disponível para Saque
            </span>
            <span className="text-2xl font-black text-[#22c55e]">
              R$ {currentBalance.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#8fae9e] font-bold block uppercase tracking-wider">
              Mínimo
            </span>
            <span className="text-sm font-black text-white">
              R$ {minWithdraw.toFixed(2)}
            </span>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-[#22c55e] mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-white uppercase">SOLICITAÇÃO RECEBIDA!</h3>
            <p className="text-sm text-[#cfe3d7]">
              Seu saque de <b className="text-[#22c55e]">R$ {amount.toFixed(2)}</b> foi enviado para processamento no PIX.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1.5">
                Tipo de Chave PIX
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cpf', label: 'CPF' },
                  { id: 'email', label: 'E-mail' },
                  { id: 'phone', label: 'Celular' },
                  { id: 'random', label: 'Aleatória' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPixKeyType(item.id)}
                    className={`py-2 rounded-xl font-bold text-xs transition border ${
                      pixKeyType === item.id
                        ? 'bg-[#22c55e] text-black border-[#22c55e]'
                        : 'bg-[#0c2415] text-white border-white/10 hover:border-[#22c55e]/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                Sua Chave PIX ({pixKeyType.toUpperCase()})
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Insira sua chave PIX aqui"
                className="w-full px-4 py-3 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#b9d4c6] uppercase tracking-wider">
                  Valor do Saque (R$)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance)}
                  className="text-xs font-bold text-[#22c55e] hover:underline"
                >
                  Sacar tudo
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min={minWithdraw}
                  max={currentBalance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0c2415] border border-white/10 rounded-xl text-white font-bold text-base focus:outline-none focus:border-[#22c55e] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || currentBalance < minWithdraw}
              className="w-full py-4 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_10px_30px_-5px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-5 h-5" />
              {loading ? 'PROCESSANDO SAQUE...' : `SACAR R$ ${amount.toFixed(2)} AGORA`}
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-[#8fae9e]">
          <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
          <span>Saques processados 24 horas por dia via Vizzion Pay</span>
        </div>
      </div>
    </div>
  );
}

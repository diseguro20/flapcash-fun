'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export default function AuthModals() {
  const { 
    isLoginOpen, setIsLoginOpen,
    isRegisterOpen, setIsRegisterOpen,
    isForgotPasswordOpen, setIsForgotPasswordOpen,
    login, register 
  } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError('Informe seu e-mail ou usuário');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    const res = await login(loginEmail, loginPass);
    setLoginLoading(false);
    if (res.success) {
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPass('');
    } else {
      setLoginError(res.message || 'Erro ao entrar');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName) {
      setRegError('Preencha os campos obrigatórios');
      return;
    }
    setRegLoading(true);
    setRegError('');
    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      cpf: regCpf,
      password: regPass
    });
    setRegLoading(false);
    if (res.success) {
      setIsRegisterOpen(false);
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegCpf('');
      setRegPass('');
    } else {
      setRegError(res.message || 'Erro ao cadastrar');
    }
  };

  return (
    <>
      {/* MODAL DE LOGIN (Inspirado no visual de asset_6.jpg) */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] overflow-hidden">
            {/* Top decorative badge */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />
            
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-black tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Área de Membros
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                VOLTE PARA <span className="text-[#22c55e]">GANHAR MAIS</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8fae9e] font-medium mt-1">
                Entre na sua conta e aproveite ofertas, voos e recompensas!
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1.5">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#b9d4c6] uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsLoginOpen(false); setIsForgotPasswordOpen(true); }}
                    className="text-xs font-bold text-[#22c55e] hover:underline"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_8px_25px_-5px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition disabled:opacity-50"
              >
                {loginLoading ? 'Entrando...' : 'ENTRAR NA CONTA'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-[#8fae9e]">
                Ainda não tem conta no flapcash?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
                  className="font-extrabold text-[#22c55e] hover:underline"
                >
                  Cadastre-se grátis →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO (Inspirado no visual de asset_7.jpg) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)] max-h-[92vh] overflow-y-auto">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#f7c948] via-[#22c55e] to-[#f7c948]" />

            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f7c948]/15 border border-[#f7c948]/40 text-[#f7c948] text-xs font-black tracking-wider uppercase mb-2">
                🎁 BÔNUS DE ATÉ R$ 100,00
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                CADASTRE-SE <span className="text-[#22c55e]">E GANHE</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8fae9e] font-medium mt-1">
                Bônus exclusivos para começar a voar com tudo!
              </p>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                    Telefone / Celular
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                    CPF (Para PIX)
                  </label>
                  <input
                    type="text"
                    value={regCpf}
                    onChange={(e) => setRegCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b9d4c6] uppercase tracking-wider mb-1">
                  Criar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c2415] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#22c55e] transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-[#8fae9e]">
                <ShieldCheck className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Ambiente 100% criptografado e regulamentado.</span>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_8px_25px_-5px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition disabled:opacity-50"
              >
                {regLoading ? 'Criando Conta...' : 'CADASTRAR E RECEBER BÔNUS'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-[#8fae9e]">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
                  className="font-extrabold text-[#22c55e] hover:underline"
                >
                  Entrar aqui →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECUPERAR SENHA (Inspirado em paginas/home.html) */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#07170c] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)]">
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Recuperar <span className="text-[#22c55e]">Senha</span>
            </h2>
            <p className="text-xs text-[#8fae9e] mb-6">flapcash · atualizado em 2026</p>

            <div className="space-y-4">
              <div className="bg-[#0b1f13] border border-[#16311f] rounded-2xl p-4">
                <h3 className="font-extrabold text-sm text-white mb-1">Como recuperar sua senha</h3>
                <p className="text-xs text-[#cfe3d7] leading-relaxed">
                  A troca de senha é feita com segurança por meio do nosso atendimento ao vivo, para garantir que quem solicita é o verdadeiro titular da conta. Chame nosso suporte informando o e-mail cadastrado.
                </p>
              </div>

              <div className="bg-[#0b1f13] border border-[#16311f] rounded-2xl p-4">
                <h3 className="font-extrabold text-sm text-white mb-1">O que o suporte NUNCA pede</h3>
                <p className="text-xs text-[#cfe3d7] leading-relaxed">
                  Nenhum atendente do flapcash vai solicitar o pagamento de taxas bancárias ou códigos de segurança do banco para "liberar" saques.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setIsForgotPasswordOpen(false); setIsLoginOpen(true); }}
                className="flex-1 py-3 px-5 rounded-full font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition text-center"
              >
                ← Voltar ao Login
              </button>
              <button
                onClick={() => alert('Canal de atendimento: Suporte 24h via WhatsApp ou E-mail suporte@flapcash.fun')}
                className="flex-1 py-3 px-5 rounded-full font-black text-sm bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black uppercase tracking-wider hover:brightness-110 transition text-center"
              >
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

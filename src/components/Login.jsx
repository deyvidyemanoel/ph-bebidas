import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const CREDENTIALS = { user: 'phbebidas', pass: 'ph2024' };

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === CREDENTIALS.user && password === CREDENTIALS.pass) {
        onLogin();
      } else {
        setError('Usuário ou senha incorretos.');
        setLoading(false);
      }
    }, 600);
  };

  const ic = `w-full bg-dark-600 border rounded-xl px-4 py-3 text-white placeholder-gray-600
    focus:outline-none transition-colors text-sm ${error ? 'border-red-500/50' : 'border-dark-300 focus:border-gold-500'}`;

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-gold-600/30 mx-auto mb-4">
            PH
          </div>
          <h1 className="text-white text-2xl font-black tracking-wide">PH Bebidas</h1>
          <p className="text-gray-500 text-sm mt-1">São Miguel do Tapuio — PI</p>
        </div>

        {/* Card */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white font-bold text-lg mb-1">Acesso ao Sistema</h2>
          <p className="text-gray-500 text-sm mb-6">Entre com suas credenciais para continuar.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">
                Usuário
              </label>
              <input
                className={ic}
                type="text"
                placeholder="Digite o usuário"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  className={ic + ' pr-11'}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Digite a senha"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3.5 bg-gold-500 text-black font-black text-base rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-gray-700 text-xs text-center mt-6">Sistema de Gestão v1.0 · PH Bebidas</p>
      </div>
    </div>
  );
}

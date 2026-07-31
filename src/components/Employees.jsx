import React, { useState } from 'react';
import {
  UserPlus, Search, X, ShieldCheck, User, Users, Power,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useEmployees } from '../hooks/useEmployees';
import { Toast } from './Toast';

function EmployeeModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    nomeCompleto: '', username: '', password: '', cargo: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nomeCompleto.trim()) e.nomeCompleto = 'Nome obrigatório';
    if (!/^[a-z0-9._-]+$/i.test(form.username.trim())) e.username = 'Use apenas letras, números, ponto, - ou _';
    if (form.password.length < 6) e.password = 'Mínimo de 6 caracteres';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const ic = 'w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm transition-colors';
  const lc = 'block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide';

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold">Novo Funcionário</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={lc}>Nome completo *</label>
            <input className={ic} placeholder="Nome do funcionário" value={form.nomeCompleto} onChange={e => setForm({ ...form, nomeCompleto: e.target.value })} autoFocus />
            {errors.nomeCompleto && <p className="text-red-400 text-xs mt-1">{errors.nomeCompleto}</p>}
          </div>
          <div>
            <label className={lc}>Usuário *</label>
            <input className={ic} placeholder="Ex: joao" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} autoCapitalize="off" />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className={lc}>Senha inicial *</label>
            <input className={ic} type="text" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className={lc}>Cargo</label>
            <input className={ic} placeholder="Ex: Atendente, Caixa..." value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} />
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            Novos funcionários entram como não-administradores. Pra promover alguém a
            administrador, é preciso um passo manual no banco (fale com quem administra o Supabase do sistema).
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Criando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, loading, error, createEmployee, setActive } = useEmployees();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showError = (message) => setToast({ type: 'error', message });

  const filtered = employees.filter(e =>
    e.nomeCompleto.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    try {
      await createEmployee(form);
      setShowModal(false);
      setToast({ type: 'success', message: 'Funcionário cadastrado com sucesso!' });
    } catch (err) {
      showError('Não foi possível cadastrar: ' + err.message);
    }
  };

  const handleToggleActive = async (employee) => {
    setTogglingId(employee.id);
    try {
      await setActive(employee.id, !employee.ativo);
    } catch (err) {
      showError('Não foi possível atualizar o funcionário: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funcionários</h2>
          <p className="text-gray-500 text-sm">{employees.length} funcionário(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-gold-400 transition-colors"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Novo Funcionário</span>
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="w-full bg-dark-700 border border-dark-400 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm"
          placeholder="Buscar por nome ou usuário..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Carregando...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{search ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}</p>
          </div>
        ) : (
          filtered.map(emp => (
            <div key={emp.id} className="flex items-center gap-4 px-5 py-4 border-b border-dark-400 last:border-0 hover:bg-dark-600/30 transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0
                ${emp.ativo ? 'bg-gold-500/15 text-gold-400' : 'bg-dark-500 text-gray-600'}`}>
                {emp.nomeCompleto.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium">{emp.nomeCompleto}</p>
                  {emp.isAdmin && (
                    <span className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <ShieldCheck size={10} /> Admin
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${emp.ativo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {emp.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 mt-0.5">
                  <span className="text-gray-500 text-xs flex items-center gap-1"><User size={10} />{emp.username}</span>
                  {emp.cargo && <span className="text-gray-500 text-xs">{emp.cargo}</span>}
                  <span className="text-gray-600 text-xs">desde {formatDate(emp.criadoEm)}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleActive(emp)}
                disabled={togglingId === emp.id}
                title={emp.ativo ? 'Desativar' : 'Ativar'}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50
                  ${emp.ativo
                    ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
              >
                <Power size={12} />
                {emp.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && <EmployeeModal onSave={handleSave} onClose={() => setShowModal(false)} />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

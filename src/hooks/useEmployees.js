import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toInternalEmail } from '../utils/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fromRow = (r, adminIds) => ({
  id: r.id,
  username: r.username,
  nomeCompleto: r.nome_completo,
  cargo: r.cargo ?? '',
  isAdmin: adminIds.has(r.id),
  ativo: r.ativo,
  criadoEm: r.criado_em,
});

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [{ data, error: err }, { data: adminRows, error: adminErr }] = await Promise.all([
      supabase.from('funcionarios').select('*').order('nome_completo'),
      supabase.from('admins').select('user_id'),
    ]);
    if (err || adminErr) { setError((err || adminErr).message); setLoading(false); return; }
    const adminIds = new Set(adminRows.map(a => a.user_id));
    setEmployees(data.map(r => fromRow(r, adminIds)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Cria a conta no Supabase Auth usando um client temporário e isolado (sem
  // persistir sessão), pra não substituir a sessão do admin que está logado
  // no client principal — e só então grava a linha em "funcionarios".
  // Promover alguém a admin não é feito por aqui: é um passo manual via SQL
  // (inserir o id em "admins"), pra não precisar de uma policy de "admins"
  // que também consulte "admins" — mesma auto-referência que causava a
  // recursão em "funcionarios".
  const createEmployee = useCallback(async ({ nomeCompleto, username, password, cargo }) => {
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({
      email: toInternalEmail(username),
      password,
    });
    await tempClient.auth.signOut();
    if (signUpErr) throw signUpErr;

    const newUserId = signUpData.user.id;
    const { data, error: insertErr } = await supabase
      .from('funcionarios')
      .insert({
        id: newUserId,
        username: username.trim().toLowerCase(),
        nome_completo: nomeCompleto,
        cargo: cargo || null,
        ativo: true,
      })
      .select()
      .single();

    if (insertErr) {
      throw new Error(
        'A conta de login foi criada, mas não foi possível salvar o cadastro do funcionário. ' +
        'Verifique em Authentication > Users no painel do Supabase (' + insertErr.message + ')'
      );
    }

    const saved = fromRow(data, new Set());
    setEmployees(prev => [...prev, saved].sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)));
    return saved;
  }, []);

  const setActive = useCallback(async (id, ativo) => {
    const prevSnapshot = employees;
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ativo } : e)));
    const { error: err } = await supabase.from('funcionarios').update({ ativo }).eq('id', id);
    if (err) { setEmployees(prevSnapshot); throw err; }
  }, [employees]);

  return { employees, loading, error, refetch: fetchAll, createEmployee, setActive };
}

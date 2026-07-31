import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toInternalEmail } from '../utils/auth';

const AuthContext = createContext(null);

const mapEmployee = (r, isAdmin) => ({
  id: r.id,
  username: r.username,
  nomeCompleto: r.nome_completo,
  cargo: r.cargo ?? '',
  isAdmin,
  ativo: r.ativo,
  criadoEm: r.criado_em,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Evita disparar handleSession duas vezes para o mesmo user id em seguida
  // (getSession() inicial + o primeiro evento de onAuthStateChange chegam quase juntos).
  const lastHandledUserId = useRef(undefined);

  const handleSession = useCallback(async (nextSession) => {
    if (!nextSession) {
      lastHandledUserId.current = null;
      setSession(null);
      setEmployee(null);
      setLoading(false);
      return;
    }

    if (lastHandledUserId.current === nextSession.user.id) {
      setSession(nextSession);
      setLoading(false);
      return;
    }
    lastHandledUserId.current = nextSession.user.id;

    const { data: emp, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id', nextSession.user.id)
      .maybeSingle();

    if (error) {
      console.error('[auth] erro ao consultar funcionarios:', error);
      await supabase.auth.signOut();
      setAuthError('query-error');
      setSession(null);
      setEmployee(null);
      setLoading(false);
      return;
    }

    if (!emp) {
      console.error('[auth] nenhuma linha em funcionarios para auth.uid()', nextSession.user.id);
      await supabase.auth.signOut();
      setAuthError('not-found');
      setSession(null);
      setEmployee(null);
      setLoading(false);
      return;
    }

    if (!emp.ativo) {
      await supabase.auth.signOut();
      setAuthError('inactive');
      setSession(null);
      setEmployee(null);
      setLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', nextSession.user.id)
      .maybeSingle();

    setSession(nextSession);
    setEmployee(mapEmployee(emp, !!adminRow));
    setAuthError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSession(nextSession);
    });

    return () => sub.subscription.unsubscribe();
  }, [handleSession]);

  const login = useCallback(async (username, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: toInternalEmail(username),
      password,
    });
    if (error) throw error;
    // handleSession roda via onAuthStateChange e pode setar authError('inactive')
    // se o funcionário estiver desativado — a UI de login observa authError.
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ session, employee, loading, authError, login, logout, clearAuthError: () => setAuthError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

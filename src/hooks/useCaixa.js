import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SELECT = '*, aberto_por_func:funcionarios!caixa_aberto_por_fkey(nome_completo), fechado_por_func:funcionarios!caixa_fechado_por_fkey(nome_completo)';

const fromRow = (r) => ({
  id: r.id,
  valorInicial: r.valor_inicial,
  abertoEm: r.aberto_em,
  abertoPor: r.aberto_por,
  abertoPorNome: r.aberto_por_func?.nome_completo ?? null,
  fechadoEm: r.fechado_em,
  valorFinal: r.valor_final,
  fechadoPor: r.fechado_por,
  fechadoPorNome: r.fechado_por_func?.nome_completo ?? null,
  status: r.status,
});

export function useCaixa() {
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from('caixa').select(SELECT).order('aberto_em', { ascending: false });
    if (err) { setError(err.message); setLoading(false); return; }
    setCaixas(data.map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const abrirCaixa = useCallback(async (valorInicial, funcionarioId) => {
    const { data, error: err } = await supabase
      .from('caixa')
      .insert({ valor_inicial: valorInicial, aberto_por: funcionarioId })
      .select(SELECT)
      .single();
    if (err) throw err;
    const saved = fromRow(data);
    setCaixas(prev => [saved, ...prev]);
    return saved;
  }, []);

  const fecharCaixa = useCallback(async (id, valorFinal, funcionarioId) => {
    const prevSnapshot = caixas;
    const { data, error: err } = await supabase
      .from('caixa')
      .update({ status: 'fechado', fechado_em: new Date().toISOString(), valor_final: valorFinal, fechado_por: funcionarioId })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (err) { setCaixas(prevSnapshot); throw err; }
    const saved = fromRow(data);
    setCaixas(prev => prev.map(c => (c.id === id ? saved : c)));
    return saved;
  }, [caixas]);

  const deleteCaixa = useCallback(async (id) => {
    const prevSnapshot = caixas;
    setCaixas(prev => prev.filter(c => c.id !== id));
    const { error: err } = await supabase.from('caixa').delete().eq('id', id);
    if (err) { setCaixas(prevSnapshot); throw err; }
  }, [caixas]);

  const caixaAberto = caixas.find(c => c.status === 'aberto') ?? null;
  const historico = caixas.filter(c => c.status === 'fechado');

  return { caixas, caixaAberto, historico, loading, error, refetch: fetchAll, abrirCaixa, fecharCaixa, deleteCaixa };
}

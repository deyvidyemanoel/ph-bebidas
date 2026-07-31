import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const fromRow = (r) => ({
  id: r.id,
  date: r.date,
  productId: r.product_id,
  productName: r.product_name,
  type: r.type,
  quantity: r.quantity,
  reason: r.reason ?? '',
});

const toRow = (m) => ({
  date: m.date,
  product_id: m.productId,
  product_name: m.productName,
  type: m.type,
  quantity: m.quantity,
  reason: m.reason || '',
});

export function useMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from('movimentacoes').select('*').order('date', { ascending: false });
    if (err) { setError(err.message); setLoading(false); return; }
    setMovements(data.map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addMovement = useCallback(async (movement) => {
    const { data, error: err } = await supabase.from('movimentacoes').insert(toRow(movement)).select().single();
    if (err) throw err;
    const saved = fromRow(data);
    setMovements(prev => [saved, ...prev]);
    return saved;
  }, []);

  const addMovements = useCallback(async (list) => {
    const prevSnapshot = movements;
    const { data, error: err } = await supabase.from('movimentacoes').insert(list.map(toRow)).select();
    if (err) { setMovements(prevSnapshot); throw err; }
    const saved = data.map(fromRow);
    setMovements(prev => [...saved, ...prev]);
    return saved;
  }, [movements]);

  const clearAll = useCallback(async () => {
    const prevSnapshot = movements;
    setMovements([]);
    const { error: err } = await supabase.from('movimentacoes').delete().not('id', 'is', null);
    if (err) { setMovements(prevSnapshot); throw err; }
  }, [movements]);

  // Usado na importação de backup. productIdMap remapeia o vínculo com o produto
  // (que agora tem um novo id gerado pelo banco); se não encontrado, fica nulo.
  const bulkReplace = useCallback(async (importedMovements, { productIdMap }) => {
    const prevSnapshot = movements;
    try {
      const { error: delErr } = await supabase.from('movimentacoes').delete().not('id', 'is', null);
      if (delErr) throw delErr;
      if (importedMovements.length === 0) { setMovements([]); return; }
      const rows = importedMovements.map(m => toRow({ ...m, productId: productIdMap.get(m.productId) ?? null }));
      const { data, error: insErr } = await supabase.from('movimentacoes').insert(rows).select();
      if (insErr) throw insErr;
      setMovements(data.map(fromRow).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      setMovements(prevSnapshot);
      throw err;
    }
  }, [movements]);

  return { movements, loading, error, refetch: fetchAll, addMovement, addMovements, clearAll, bulkReplace };
}

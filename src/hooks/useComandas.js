import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const itemFromRow = (r) => ({
  id: r.id,
  productId: r.product_id,
  name: r.name,
  brand: r.brand ?? '',
  unitPrice: Number(r.unit_price),
  quantity: r.quantity,
  subtotal: Number(r.subtotal),
  isAvulso: r.is_avulso,
});

const comandaFromRow = (r) => ({
  id: r.id,
  customerName: r.customer_name,
  openedAt: r.opened_at,
  items: (r.itens_comanda || []).map(itemFromRow),
});

export function useComandas() {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('comandas')
      .select('*, itens_comanda(*)')
      .order('opened_at');
    if (err) { setError(err.message); setLoading(false); return; }
    setComandas(data.map(comandaFromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createComanda = useCallback(async (customerName) => {
    const { data, error: err } = await supabase
      .from('comandas')
      .insert({ customer_name: customerName })
      .select()
      .single();
    if (err) throw err;
    const saved = comandaFromRow({ ...data, itens_comanda: [] });
    setComandas(prev => [...prev, saved]);
    return saved;
  }, []);

  const addItem = useCallback(async (comandaId, product) => {
    const comanda = comandas.find(c => c.id === comandaId);
    if (!comanda) return;
    const existing = comanda.items.find(i => i.productId === product.id);

    if (existing) {
      const prevSnapshot = comandas;
      const newQty = existing.quantity + 1;
      const newSubtotal = newQty * existing.unitPrice;
      setComandas(prev => prev.map(c => c.id !== comandaId ? c : {
        ...c,
        items: c.items.map(i => i.id === existing.id ? { ...i, quantity: newQty, subtotal: newSubtotal } : i),
      }));
      const { error: err } = await supabase
        .from('itens_comanda')
        .update({ quantity: newQty, subtotal: newSubtotal })
        .eq('id', existing.id);
      if (err) { setComandas(prevSnapshot); throw err; }
      return;
    }

    const { data, error: err } = await supabase
      .from('itens_comanda')
      .insert({
        comanda_id: comandaId,
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        unit_price: product.sellPrice,
        quantity: 1,
        subtotal: product.sellPrice,
        is_avulso: false,
      })
      .select()
      .single();
    if (err) throw err;
    const item = itemFromRow(data);
    setComandas(prev => prev.map(c => c.id !== comandaId ? c : { ...c, items: [...c.items, item] }));
  }, [comandas]);

  const addAvulsoItem = useCallback(async (comandaId, { name, unitPrice }) => {
    const { data, error: err } = await supabase
      .from('itens_comanda')
      .insert({
        comanda_id: comandaId,
        product_id: null,
        name, brand: '',
        unit_price: unitPrice,
        quantity: 1,
        subtotal: unitPrice,
        is_avulso: true,
      })
      .select()
      .single();
    if (err) throw err;
    const item = itemFromRow(data);
    setComandas(prev => prev.map(c => c.id !== comandaId ? c : { ...c, items: [...c.items, item] }));
  }, []);

  const setItemQty = useCallback(async (comandaId, itemId, qty) => {
    const prevSnapshot = comandas;

    if (qty <= 0) {
      setComandas(prev => prev.map(c => c.id !== comandaId ? c : { ...c, items: c.items.filter(i => i.id !== itemId) }));
      const { error: err } = await supabase.from('itens_comanda').delete().eq('id', itemId);
      if (err) { setComandas(prevSnapshot); throw err; }
      return;
    }

    const comanda = comandas.find(c => c.id === comandaId);
    const item = comanda?.items.find(i => i.id === itemId);
    if (!item) return;
    const subtotal = qty * item.unitPrice;
    setComandas(prev => prev.map(c => c.id !== comandaId ? c : {
      ...c,
      items: c.items.map(i => i.id === itemId ? { ...i, quantity: qty, subtotal } : i),
    }));
    const { error: err } = await supabase.from('itens_comanda').update({ quantity: qty, subtotal }).eq('id', itemId);
    if (err) { setComandas(prevSnapshot); throw err; }
  }, [comandas]);

  const clearItems = useCallback(async (comandaId) => {
    const prevSnapshot = comandas;
    setComandas(prev => prev.map(c => c.id !== comandaId ? c : { ...c, items: [] }));
    const { error: err } = await supabase.from('itens_comanda').delete().eq('comanda_id', comandaId);
    if (err) { setComandas(prevSnapshot); throw err; }
  }, [comandas]);

  const deleteComanda = useCallback(async (comandaId) => {
    const prevSnapshot = comandas;
    setComandas(prev => prev.filter(c => c.id !== comandaId));
    const { error: err } = await supabase.from('comandas').delete().eq('id', comandaId);
    if (err) { setComandas(prevSnapshot); throw err; }
  }, [comandas]);

  return {
    comandas, loading, error, refetch: fetchAll,
    createComanda, addItem, addAvulsoItem, setItemQty, clearItems, deleteComanda,
  };
}

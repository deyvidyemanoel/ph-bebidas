import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { INITIAL_PRODUCTS } from '../utils/helpers';

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  brand: r.brand,
  costPrice: Number(r.cost_price),
  sellPrice: Number(r.sell_price),
  quantity: r.quantity,
  minStock: r.min_stock,
  unit: r.unit,
});

const toRow = (p) => ({
  name: p.name,
  category: p.category,
  brand: p.brand,
  cost_price: p.costPrice,
  sell_price: p.sellPrice,
  quantity: p.quantity,
  min_stock: p.minStock,
  unit: p.unit,
});

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from('produtos').select('*').order('name');
    if (err) { setError(err.message); setLoading(false); return; }
    setProducts(data.map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addProduct = useCallback(async (product) => {
    const { data, error: err } = await supabase.from('produtos').insert(toRow(product)).select().single();
    if (err) throw err;
    const saved = fromRow(data);
    setProducts(prev => [...prev, saved]);
    return saved;
  }, []);

  const updateProduct = useCallback(async (product) => {
    const prevSnapshot = products;
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
    const { error: err } = await supabase.from('produtos').update(toRow(product)).eq('id', product.id);
    if (err) { setProducts(prevSnapshot); throw err; }
    return product;
  }, [products]);

  const deleteProduct = useCallback(async (id) => {
    const prevSnapshot = products;
    setProducts(prev => prev.filter(p => p.id !== id));
    const { error: err } = await supabase.from('produtos').delete().eq('id', id);
    if (err) { setProducts(prevSnapshot); throw err; }
  }, [products]);

  // Ajusta o estoque de um único produto (entrada/saída manual em Stock.jsx).
  const adjustStock = useCallback(async (product, type, quantity) => {
    const newQuantity = type === 'entrada' ? product.quantity + quantity : product.quantity - quantity;
    const prevSnapshot = products;
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, quantity: newQuantity } : p)));
    const { error: err } = await supabase.from('produtos').update({ quantity: newQuantity }).eq('id', product.id);
    if (err) { setProducts(prevSnapshot); throw err; }
    return newQuantity;
  }, [products]);

  // Dá baixa no estoque para itens vendidos (PDV/Comanda). items: [{ productId, quantity }]
  const decrementForSale = useCallback(async (items) => {
    const prevSnapshot = products;
    const targets = items
      .map(i => {
        const prod = prevSnapshot.find(p => p.id === i.productId);
        return prod ? { id: prod.id, newQuantity: prod.quantity - i.quantity } : null;
      })
      .filter(Boolean);

    setProducts(prev => prev.map(p => {
      const t = targets.find(x => x.id === p.id);
      return t ? { ...p, quantity: t.newQuantity } : p;
    }));

    try {
      await Promise.all(targets.map(t =>
        supabase.from('produtos').update({ quantity: t.newQuantity }).eq('id', t.id).throwOnError()
      ));
    } catch (err) {
      setProducts(prevSnapshot);
      throw err;
    }
  }, [products]);

  const resetToInitial = useCallback(async () => {
    const prevSnapshot = products;
    setProducts(INITIAL_PRODUCTS);
    try {
      const { error: delErr } = await supabase.from('produtos').delete().not('id', 'is', null);
      if (delErr) throw delErr;
      const rows = INITIAL_PRODUCTS.map(p => toRow(p));
      const { data, error: insErr } = await supabase.from('produtos').insert(rows).select();
      if (insErr) throw insErr;
      setProducts(data.map(fromRow));
    } catch (err) {
      setProducts(prevSnapshot);
      throw err;
    }
  }, [products]);

  // Usado na importação de backup. Recria os produtos e devolve um mapa
  // id-antigo -> id-novo, já que os ids agora são gerados pelo banco.
  const bulkReplace = useCallback(async (importedProducts) => {
    const prevSnapshot = products;
    try {
      const { error: delErr } = await supabase.from('produtos').delete().not('id', 'is', null);
      if (delErr) throw delErr;
      if (importedProducts.length === 0) { setProducts([]); return new Map(); }
      // Insere um a um (em paralelo) para garantir o pareamento correto
      // entre o id antigo (do backup) e o novo id gerado pelo banco.
      const inserted = await Promise.all(importedProducts.map(p =>
        supabase.from('produtos').insert(toRow(p)).select().single().then(({ data, error: insErr }) => {
          if (insErr) throw insErr;
          return data;
        })
      ));
      const idMap = new Map(importedProducts.map((p, i) => [p.id, inserted[i].id]));
      setProducts(inserted.map(fromRow));
      return idMap;
    } catch (err) {
      setProducts(prevSnapshot);
      throw err;
    }
  }, [products]);

  return {
    products, loading, error, refetch: fetchAll,
    addProduct, updateProduct, deleteProduct,
    adjustStock, decrementForSale, resetToInitial, bulkReplace,
  };
}

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const itemFromRow = (r) => ({
  productId: r.product_id,
  name: r.name,
  brand: r.brand ?? '',
  unitPrice: Number(r.unit_price),
  quantity: r.quantity,
  subtotal: Number(r.subtotal),
  isAvulso: r.is_avulso,
});

const itemToRow = (item, vendaId) => ({
  venda_id: vendaId,
  product_id: item.isAvulso ? null : item.productId,
  name: item.name,
  brand: item.brand || '',
  unit_price: item.unitPrice,
  quantity: item.quantity,
  subtotal: item.subtotal,
  is_avulso: !!item.isAvulso,
});

const saleFromRow = (r) => ({
  id: r.id,
  date: r.date,
  items: (r.itens_venda || []).map(itemFromRow),
  total: Number(r.total),
  paymentMethod: r.payment_method,
  amountPaid: Number(r.amount_paid),
  change: Number(r.change),
  customerId: r.customer_id,
  status: r.status,
});

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('vendas')
      .select('*, itens_venda(*)')
      .order('date', { ascending: false });
    if (err) { setError(err.message); setLoading(false); return; }
    setSales(data.map(saleFromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // sale: { items, total, paymentMethod, amountPaid, change, customerId, status }
  const addSale = useCallback(async (sale) => {
    const { data: vendaRow, error: vendaErr } = await supabase
      .from('vendas')
      .insert({
        total: sale.total,
        payment_method: sale.paymentMethod,
        amount_paid: sale.amountPaid,
        change: sale.change,
        customer_id: sale.customerId || null,
        status: sale.status,
      })
      .select()
      .single();
    if (vendaErr) throw vendaErr;

    const { data: itemRows, error: itemsErr } = await supabase
      .from('itens_venda')
      .insert(sale.items.map(i => itemToRow(i, vendaRow.id)))
      .select();
    if (itemsErr) throw itemsErr;

    const saved = saleFromRow({ ...vendaRow, itens_venda: itemRows });
    setSales(prev => [saved, ...prev]);
    return saved;
  }, []);

  const markPaid = useCallback(async (saleId) => {
    const prevSnapshot = sales;
    setSales(prev => prev.map(s => (s.id === saleId ? { ...s, status: 'pago' } : s)));
    const { error: err } = await supabase.from('vendas').update({ status: 'pago' }).eq('id', saleId);
    if (err) { setSales(prevSnapshot); throw err; }
  }, [sales]);

  const deleteSale = useCallback(async (saleId) => {
    const prevSnapshot = sales;
    setSales(prev => prev.filter(s => s.id !== saleId));
    const { error: err } = await supabase.from('vendas').delete().eq('id', saleId);
    if (err) { setSales(prevSnapshot); throw err; }
  }, [sales]);

  const clearAll = useCallback(async () => {
    const prevSnapshot = sales;
    setSales([]);
    const { error: err } = await supabase.from('vendas').delete().not('id', 'is', null);
    if (err) { setSales(prevSnapshot); throw err; }
  }, [sales]);

  // Usado na importação de backup. clientIdMap/productIdMap remapeiam os vínculos
  // (ids antigos do backup -> novos ids gerados pelo banco); sem match, fica nulo.
  const bulkReplace = useCallback(async (importedSales, { clientIdMap, productIdMap }) => {
    const prevSnapshot = sales;
    try {
      const { error: delErr } = await supabase.from('vendas').delete().not('id', 'is', null);
      if (delErr) throw delErr;
      if (importedSales.length === 0) { setSales([]); return; }

      const saved = await Promise.all(importedSales.map(async (sale) => {
        const { data: vendaRow, error: vendaErr } = await supabase
          .from('vendas')
          .insert({
            date: sale.date,
            total: sale.total,
            payment_method: sale.paymentMethod,
            amount_paid: sale.amountPaid,
            change: sale.change,
            customer_id: sale.customerId ? (clientIdMap.get(sale.customerId) ?? null) : null,
            status: sale.status,
          })
          .select()
          .single();
        if (vendaErr) throw vendaErr;

        const remappedItems = sale.items.map(i => ({
          ...i,
          productId: i.isAvulso ? null : (productIdMap.get(i.productId) ?? null),
        }));
        const { data: itemRows, error: itemsErr } = await supabase
          .from('itens_venda')
          .insert(remappedItems.map(i => itemToRow(i, vendaRow.id)))
          .select();
        if (itemsErr) throw itemsErr;

        return saleFromRow({ ...vendaRow, itens_venda: itemRows });
      }));

      setSales(saved.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      setSales(prevSnapshot);
      throw err;
    }
  }, [sales]);

  return { sales, loading, error, refetch: fetchAll, addSale, markPaid, deleteSale, clearAll, bulkReplace };
}

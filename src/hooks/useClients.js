import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone ?? '',
  email: r.email ?? '',
  createdAt: r.created_at,
});

const toRow = (c) => ({
  name: c.name,
  phone: c.phone || null,
  email: c.email || null,
});

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from('clientes').select('*').order('name');
    if (err) { setError(err.message); setLoading(false); return; }
    setClients(data.map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addClient = useCallback(async (client) => {
    const { data, error: err } = await supabase.from('clientes').insert(toRow(client)).select().single();
    if (err) throw err;
    const saved = fromRow(data);
    setClients(prev => [...prev, saved]);
    return saved;
  }, []);

  const updateClient = useCallback(async (client) => {
    const prevSnapshot = clients;
    setClients(prev => prev.map(c => (c.id === client.id ? client : c)));
    const { error: err } = await supabase.from('clientes').update(toRow(client)).eq('id', client.id);
    if (err) { setClients(prevSnapshot); throw err; }
    return client;
  }, [clients]);

  const deleteClient = useCallback(async (id) => {
    const prevSnapshot = clients;
    setClients(prev => prev.filter(c => c.id !== id));
    const { error: err } = await supabase.from('clientes').delete().eq('id', id);
    if (err) { setClients(prevSnapshot); throw err; }
  }, [clients]);

  const clearAll = useCallback(async () => {
    const prevSnapshot = clients;
    setClients([]);
    const { error: err } = await supabase.from('clientes').delete().not('id', 'is', null);
    if (err) { setClients(prevSnapshot); throw err; }
  }, [clients]);

  // Usado na importação de backup. Recria os clientes e devolve um mapa
  // id-antigo -> id-novo, já que os ids agora são gerados pelo banco.
  const bulkReplace = useCallback(async (importedClients) => {
    const prevSnapshot = clients;
    try {
      const { error: delErr } = await supabase.from('clientes').delete().not('id', 'is', null);
      if (delErr) throw delErr;
      if (importedClients.length === 0) { setClients([]); return new Map(); }
      // Insere um a um (em paralelo) para garantir o pareamento correto
      // entre o id antigo (do backup) e o novo id gerado pelo banco.
      const inserted = await Promise.all(importedClients.map(c =>
        supabase.from('clientes').insert(toRow(c)).select().single().then(({ data, error: insErr }) => {
          if (insErr) throw insErr;
          return data;
        })
      ));
      const idMap = new Map(importedClients.map((c, i) => [c.id, inserted[i].id]));
      setClients(inserted.map(fromRow));
      return idMap;
    } catch (err) {
      setClients(prevSnapshot);
      throw err;
    }
  }, [clients]);

  return { clients, loading, error, refetch: fetchAll, addClient, updateClient, deleteClient, clearAll, bulkReplace };
}

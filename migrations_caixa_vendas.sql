-- Vincula vendas ao caixa que estava aberto no momento do registro.
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase, depois de
-- migrations_caixa.sql.

alter table vendas
  add column if not exists caixa_id uuid references caixa(id) on delete set null;

create index if not exists idx_vendas_caixa_id on vendas(caixa_id);

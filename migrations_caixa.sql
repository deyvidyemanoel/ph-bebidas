-- Controle de abertura/fechamento de caixa (fundo de troco).
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase, depois de
-- migrations.sql e update_rls_policies.sql (usa a tabela funcionarios).

create table if not exists caixa (
  id uuid primary key default gen_random_uuid(),
  valor_inicial numeric(10,2) not null default 0,
  aberto_em timestamptz not null default now(),
  aberto_por uuid references funcionarios(id) on delete set null,
  fechado_em timestamptz,
  valor_final numeric(10,2),
  fechado_por uuid references funcionarios(id) on delete set null,
  status text not null default 'aberto' check (status in ('aberto', 'fechado'))
);

-- Garante que só existe um caixa aberto por vez.
create unique index if not exists idx_caixa_unico_aberto on caixa(status) where status = 'aberto';

alter table caixa enable row level security;

drop policy if exists "authenticated full access" on caixa;
create policy "authenticated full access" on caixa
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

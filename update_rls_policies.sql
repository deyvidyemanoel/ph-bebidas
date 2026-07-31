-- PH Bebidas — autenticação real (Supabase Auth) + RLS por usuário autenticado
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase, DEPOIS do migrations.sql original.
--
-- Antes de rodar: em Authentication > Providers > Email, desligue "Confirm email".
-- Os funcionários usam e-mails internos fake (usuario@phbebidas.local) que nunca
-- recebem e-mail de confirmação de verdade — com a confirmação ligada, ninguém
-- criado pela tela de funcionários conseguiria logar.

-- =========================================================
-- Tabela funcionarios
-- =========================================================

create table if not exists funcionarios (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  nome_completo text not null,
  cargo text,
  is_admin boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table funcionarios enable row level security;

drop policy if exists "authenticated read funcionarios" on funcionarios;
drop policy if exists "admin manage funcionarios" on funcionarios;

-- Qualquer autenticado pode ler a lista (necessário para o próprio funcionário
-- checar seu "ativo" logo após o login, e é uma lista pequena/interna).
create policy "authenticated read funcionarios" on funcionarios
  for select to authenticated
  using (auth.uid() is not null);

-- Checar "sou admin?" com uma subquery direto na policy de "funcionarios"
-- causa "infinite recursion detected in policy for relation funcionarios":
-- a subquery reaplica RLS na mesma tabela, que reavalia a mesma policy, em loop.
-- A saída é isolar a checagem numa função SECURITY DEFINER com "row_security = off"
-- explícito — isso desliga a aplicação de RLS durante a execução da função,
-- sem depender de suposições sobre dono da tabela/role. "language plpgsql"
-- também é necessário: funções "language sql" simples podem ser inlineadas
-- pelo planner direto na query que chama, o que anularia esse isolamento.
create or replace function public.is_admin_user()
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
stable
as $$
begin
  return coalesce((select is_admin from funcionarios where id = auth.uid()), false);
end;
$$;
-- Só quem já é admin pode criar/editar/desativar/excluir funcionários.
create policy "admin manage funcionarios" on funcionarios
  for all to authenticated
  using (is_admin_user())
  with check (is_admin_user());

-- =========================================================
-- Reescreve as policies das tabelas de negócio: de "anon liberado"
-- para "só quem estiver autenticado" (requisito principal desta migração).
-- =========================================================

drop policy if exists "anon full access" on produtos;
drop policy if exists "anon full access" on clientes;
drop policy if exists "anon full access" on comandas;
drop policy if exists "anon full access" on itens_comanda;
drop policy if exists "anon full access" on vendas;
drop policy if exists "anon full access" on itens_venda;
drop policy if exists "anon full access" on movimentacoes;

create policy "authenticated full access" on produtos
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on clientes
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on comandas
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on itens_comanda
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on vendas
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on itens_venda
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated full access" on movimentacoes
  for all to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- =========================================================
-- Bootstrap do primeiro admin (rode DEPOIS de criar o usuário manualmente em
-- Authentication > Users > "Add user", com um e-mail tipo admin@phbebidas.local).
-- Troque 'COLE-O-UUID-AQUI' pelo UUID desse usuário (coluna "UID" no painel).
-- =========================================================

-- insert into funcionarios (id, username, nome_completo, cargo, is_admin, ativo)
-- values ('COLE-O-UUID-AQUI', 'admin', 'Administrador', 'Dono', true, true);

-- =========================================================
-- CORREÇÃO DEFINITIVA (rode este bloco): elimina a auto-referência de
-- "funcionarios" na própria policy — causa raiz do "infinite recursion
-- detected in policy for relation funcionarios". SECURITY DEFINER +
-- row_security=off não resolveram aqui (row_security só afeta roles que já
-- bypassam RLS por padrão, não é isso que faltava). A saída definitiva é
-- mover a checagem de admin para uma tabela SEPARADA, que não se
-- autorreferencia — a recursão fica estruturalmente impossível.
-- =========================================================

drop function if exists public.is_admin_user();

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table admins enable row level security;

drop policy if exists "authenticated read admins" on admins;
create policy "authenticated read admins" on admins
  for select to authenticated
  using (auth.uid() is not null);
-- Sem policy de insert/update/delete: promover/remover admin é feito só via
-- SQL Editor, nunca pela API — assim "admins" não precisa checar "admins"
-- pra decidir quem mexe nela (o mesmo tipo de auto-referência do bug acima).

drop policy if exists "admin manage funcionarios" on funcionarios;
create policy "admin manage funcionarios" on funcionarios
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- A coluna "is_admin" fica como um leftover inofensivo em funcionarios (não é
-- mais usada por nenhuma policy nem pelo app — o app já lê "admins" agora).
-- Não vale a pena remover agora: tentar isso deu erro de dependência de uma
-- policy antiga e, como o SQL Editor roda o bloco inteiro como uma
-- transação só, aquele erro desfazia tudo, inclusive a criação de "admins".

-- Bootstrap: adicione o UUID do seu admin (o mesmo do insert em funcionarios
-- acima) na tabela admins:
-- insert into admins (user_id) values ('COLE-O-UUID-AQUI');

-- PH Bebidas — schema Supabase (Postgres)
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

-- =========================================================
-- Tabelas
-- =========================================================

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'outro',
  brand text not null default '',
  cost_price numeric(10,2) not null default 0,
  sell_price numeric(10,2) not null default 0,
  quantity integer not null default 0,
  min_stock integer not null default 10,
  unit text not null default 'unidade',
  created_at timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists comandas (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  opened_at timestamptz not null default now()
);

create table if not exists itens_comanda (
  id uuid primary key default gen_random_uuid(),
  comanda_id uuid not null references comandas(id) on delete cascade,
  product_id uuid references produtos(id) on delete set null,
  name text not null,
  brand text default '',
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1,
  subtotal numeric(10,2) not null default 0,
  is_avulso boolean not null default false
);

create table if not exists vendas (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  total numeric(10,2) not null default 0,
  payment_method text not null default 'dinheiro',
  amount_paid numeric(10,2) not null default 0,
  change numeric(10,2) not null default 0,
  customer_id uuid references clientes(id) on delete set null,
  status text not null default 'pago' check (status in ('pago', 'pendente'))
);

create table if not exists itens_venda (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references vendas(id) on delete cascade,
  product_id uuid references produtos(id) on delete set null,
  name text not null,
  brand text default '',
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1,
  subtotal numeric(10,2) not null default 0,
  is_avulso boolean not null default false
);

create table if not exists movimentacoes (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  product_id uuid references produtos(id) on delete set null,
  product_name text not null,
  type text not null check (type in ('entrada', 'saida')),
  quantity integer not null default 0,
  reason text default ''
);

-- =========================================================
-- Índices (colunas de FK usadas em filtros/joins)
-- =========================================================

create index if not exists idx_itens_comanda_comanda_id on itens_comanda(comanda_id);
create index if not exists idx_itens_comanda_product_id on itens_comanda(product_id);
create index if not exists idx_itens_venda_venda_id on itens_venda(venda_id);
create index if not exists idx_itens_venda_product_id on itens_venda(product_id);
create index if not exists idx_vendas_customer_id on vendas(customer_id);
create index if not exists idx_vendas_date on vendas(date);
create index if not exists idx_movimentacoes_product_id on movimentacoes(product_id);
create index if not exists idx_movimentacoes_date on movimentacoes(date);

-- =========================================================
-- Row Level Security
--
-- O app não usa Supabase Auth (o login é uma checagem fixa no front-end),
-- então as políticas abaixo liberam acesso total para a chave anon,
-- reproduzindo o mesmo modelo de confiança que o localStorage já tinha
-- (qualquer um com a URL/chave do projeto lê e escreve). Se no futuro
-- quiser restringir por usuário, isso exige implementar Supabase Auth
-- de verdade e trocar estas policies por regras baseadas em auth.uid().
-- =========================================================

alter table produtos enable row level security;
alter table clientes enable row level security;
alter table comandas enable row level security;
alter table itens_comanda enable row level security;
alter table vendas enable row level security;
alter table itens_venda enable row level security;
alter table movimentacoes enable row level security;

create policy "anon full access" on produtos for all to anon using (true) with check (true);
create policy "anon full access" on clientes for all to anon using (true) with check (true);
create policy "anon full access" on comandas for all to anon using (true) with check (true);
create policy "anon full access" on itens_comanda for all to anon using (true) with check (true);
create policy "anon full access" on vendas for all to anon using (true) with check (true);
create policy "anon full access" on itens_venda for all to anon using (true) with check (true);
create policy "anon full access" on movimentacoes for all to anon using (true) with check (true);

-- =========================================================
-- Seed: catálogo inicial de produtos (mesmo do INITIAL_PRODUCTS do app)
-- Só roda se a tabela ainda estiver vazia, para não duplicar em reruns.
-- =========================================================

insert into produtos (name, category, brand, cost_price, sell_price, quantity, min_stock, unit)
select * from (values
  ('Skol 350ml Lata',          'cerveja',       'Skol',      2.50,  4.00,  120, 24, 'lata'),
  ('Brahma 600ml',             'cerveja',       'Brahma',    5.00,  8.00,  60,  12, 'garrafa'),
  ('Heineken 330ml Lata',      'cerveja',       'Heineken',  5.50,  9.00,  48,  12, 'lata'),
  ('Coca-Cola 2L',             'refrigerante',  'Coca-Cola', 6.50,  10.00, 30,  10, 'garrafa'),
  ('Coca-Cola Lata 350ml',     'refrigerante',  'Coca-Cola', 2.80,  5.00,  72,  24, 'lata'),
  ('Vodka Smirnoff 998ml',     'destilado',     'Smirnoff',  35.00, 55.00, 15,  5,  'garrafa'),
  ('Whisky J.B. 1L',           'destilado',     'J.B.',      65.00, 99.00, 8,   3,  'garrafa'),
  ('Red Bull 250ml',           'energetico',    'Red Bull',  7.00,  12.00, 5,   12, 'lata'),
  ('Monster Energy 473ml',     'energetico',    'Monster',   7.50,  13.00, 24,  12, 'lata'),
  ('Água Crystal 500ml',       'agua',          'Crystal',   0.80,  2.00,  48,  24, 'garrafa'),
  ('Suco Del Valle Uva 290ml', 'suco',          'Del Valle', 2.20,  4.00,  36,  12, 'unidade'),
  ('Vinho Suave Tinto 750ml',  'vinho',         'Pérgola',   18.00, 28.00, 20,  6,  'garrafa')
) as seed(name, category, brand, cost_price, sell_price, quantity, min_stock, unit)
where not exists (select 1 from produtos);

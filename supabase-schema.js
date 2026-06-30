-- Mamma Mia Delivery — estrutura mínima para o Supabase
-- Rode isso no SQL Editor do Supabase.
-- Depois crie um usuário admin em Authentication > Users.

create extension if not exists "pgcrypto";

create table if not exists public.cardapio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  categoria text not null check (categoria in ('classicas', 'especiais', 'doces')),
  preco numeric(10,2) not null check (preco >= 0),
  imagem_url text,
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  nome_cliente text not null,
  telefone text not null,
  endereco text not null,
  complemento text,
  cep text,
  observacoes text,
  forma_pagamento text,
  subtotal numeric(10,2) not null default 0,
  taxa_entrega numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'recebido',
  created_at timestamptz not null default now()
);

create table if not exists public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  pizza_id uuid references public.cardapio(id) on delete set null,
  nome_pizza text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null
);

-- Segurança
alter table public.cardapio enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;

-- Site público pode ler somente itens disponíveis do cardápio.
drop policy if exists "cardapio_public_select_disponivel" on public.cardapio;
create policy "cardapio_public_select_disponivel"
on public.cardapio for select
to anon
using (disponivel = true);

-- Usuário logado no Supabase Auth pode gerenciar cardápio.
drop policy if exists "cardapio_auth_all" on public.cardapio;
create policy "cardapio_auth_all"
on public.cardapio for all
to authenticated
using (true)
with check (true);

-- Cliente público pode criar pedidos e itens.
drop policy if exists "pedidos_anon_insert" on public.pedidos;
create policy "pedidos_anon_insert"
on public.pedidos for insert
to anon
with check (true);

drop policy if exists "itens_pedido_anon_insert" on public.itens_pedido;
create policy "itens_pedido_anon_insert"
on public.itens_pedido for insert
to anon
with check (true);

-- Admin logado pode consultar pedidos/itens.
drop policy if exists "pedidos_auth_select" on public.pedidos;
create policy "pedidos_auth_select"
on public.pedidos for select
to authenticated
using (true);

drop policy if exists "itens_pedido_auth_select" on public.itens_pedido;
create policy "itens_pedido_auth_select"
on public.itens_pedido for select
to authenticated
using (true);

-- Exemplos iniciais
insert into public.cardapio (nome, descricao, categoria, preco, disponivel)
values
('Margherita', 'Molho de tomate, mussarela, manjericão e azeite.', 'classicas', 39.90, true),
('Calabresa', 'Calabresa fatiada, cebola, mussarela e orégano.', 'classicas', 42.90, true),
('Frango com Catupiry', 'Frango desfiado, catupiry, mussarela e milho.', 'especiais', 49.90, true),
('Chocolate', 'Chocolate ao leite, granulado e morangos opcionais.', 'doces', 44.90, true)
on conflict do nothing;

-- Schema for "Tesouro da Igreja" – financial SaaS for evangelical churches.
create extension if not exists "uuid-ossp";

create type role_enum as enum ('admin', 'pastor', 'tresoureiro');
create type payment_method_enum as enum ('pix', 'dinheiro', 'cartao');
create type transaction_type_enum as enum ('dizimo', 'oferta');
create type report_period_enum as enum ('mensal', 'anual', 'entradas_saidas');

create table churches (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  denomination varchar(120),
  currency varchar(8) not null default 'BRL',
  address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  name varchar(140) not null,
  goal_amount numeric(14,2) not null check (goal_amount > 0),
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  name varchar(120) not null,
  email citext not null unique,
  password_hash varchar(255) not null,
  role role_enum not null default 'tresoureiro',
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  name varchar(120) not null,
  phone varchar(30),
  email varchar(180),
  ministry varchar(80),
  joined_at date not null default current_date,
  notes text,
  created_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  type transaction_type_enum not null,
  amount numeric(12,2) not null check (amount > 0),
  recorded_at timestamptz not null default now(),
  transaction_date date not null default current_date,
  payment_method payment_method_enum not null default 'pix',
  description text,
  created_by uuid references users(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  category varchar(60) not null,
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  description text,
  receipt_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table campaign_contributions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table reports_cache (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id) on delete cascade,
  period_type report_period_enum not null,
  period_start date not null,
  generated_at timestamptz not null default now(),
  total_dizimos numeric(14,2),
  total_ofertas numeric(14,2),
  total_despesas numeric(14,2),
  balance numeric(14,2),
  url_pdf text,
  url_excel text,
  generated_by uuid references users(id) on delete set null
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references churches(id),
  user_id uuid references users(id),
  action varchar(120) not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create unique index idx_reports_cache_unique on reports_cache(church_id, period_type, period_start);
create index idx_transactions_church_date on transactions(church_id, transaction_date desc);
create index idx_expenses_church_date on expenses(church_id, expense_date desc);

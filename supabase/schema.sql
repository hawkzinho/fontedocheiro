-- Fonte do Cheiro

create extension if not exists pgcrypto;

create table if not exists public.perfumes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  marca text not null,
  descricao text,
  familia_olfativa text,
  genero text,
  volume_ml int,
  preco numeric(10,2) not null,
  preco_promocional numeric(10,2),
  imagem_capa text,
  imagens_adicionais text[],
  disponivel boolean default true,
  destaque boolean default false,
  created_at timestamptz default now()
);

create index if not exists perfumes_public_idx
  on public.perfumes (disponivel, destaque, created_at desc);

create index if not exists perfumes_filters_idx
  on public.perfumes (genero, familia_olfativa, created_at desc);

alter table public.perfumes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'perfumes'
  ) then
    alter publication supabase_realtime add table public.perfumes;
  end if;
end $$;

drop policy if exists "select_publico" on public.perfumes;
drop policy if exists "write_admin" on public.perfumes;

create policy "select_publico" on public.perfumes
  for select
  using (disponivel = true or auth.role() = 'authenticated');

create policy "write_admin" on public.perfumes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('perfumes', 'perfumes', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

-- `storage.objects` já é uma tabela gerenciada pelo Supabase Storage com RLS.
-- Em alguns projetos o papel do SQL Editor não é o owner dessa tabela, então
-- tentar dar `alter table ... enable row level security` gera erro 42501.
-- Basta criar as policies abaixo.

drop policy if exists "leitura_publica_storage" on storage.objects;
drop policy if exists "upload_autenticado" on storage.objects;
drop policy if exists "delete_autenticado" on storage.objects;

create policy "leitura_publica_storage" on storage.objects
  for select
  using (bucket_id = 'perfumes');

create policy "upload_autenticado" on storage.objects
  for insert
  with check (
    bucket_id = 'perfumes'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] != '..'
    and octet_length(name) < 200
  );

create policy "delete_autenticado" on storage.objects
  for delete
  using (
    bucket_id = 'perfumes'
    and auth.role() = 'authenticated'
  );

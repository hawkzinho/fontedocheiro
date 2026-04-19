# Fonte do Cheiro

SPA estática em React + Vite para a perfumaria Fonte do Cheiro, com catálogo público, página individual de produto, painel administrativo com autenticação Supabase e deploy gratuito no Cloudflare Pages.

## Stack

- React + Vite
- React Router v6
- Tailwind CSS v3
- Supabase JS SDK v2
- DOMPurify
- Cloudflare Pages

## Estrutura

```text
src/
├── assets/
├── components/
├── hooks/
├── lib/
└── pages/
public/
├── _headers
└── _redirects
supabase/
└── schema.sql
```

## Setup local

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

3. Preencha as variáveis:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_WHATSAPP_NUMBER=5527XXXXXXXXX
```

4. Rode o ambiente local:

```bash
npm run dev
```

## Configuração do Supabase

1. Crie um projeto em `supabase.com`.
2. Vá em `SQL Editor` e rode [supabase/schema.sql](/C:/Users/athos/OneDrive/Área%20de%20Trabalho/fontedocheiro/supabase/schema.sql).
3. Em `Authentication > Settings`, desative `Allow new users to sign up`.
4. Em `Authentication > Users`, clique em `Invite user` e crie o acesso do admin.
5. Em `Project Settings > API`, copie a `URL` e a `anon key` para o `.env.local`.
6. Execute `npm run dev` para testar localmente.
7. No Cloudflare Pages, configure as mesmas 3 variáveis de ambiente.

Observação: o `schema.sql` já adiciona a tabela `perfumes` à publication `supabase_realtime`, necessária para que Home, Catalogo e Produto recebam mudanças em tempo real.

## Segurança implementada

- RLS habilitado na tabela `perfumes`.
- Escrita e deleção restritas a usuários autenticados via Supabase Auth.
- Storage público apenas para leitura; upload e delete exigem autenticação.
- A tabela gerenciada `storage.objects` usa RLS do próprio Supabase, então o script cria policies sem tentar alterar ownership dela.
- Inputs de texto sanitizados antes de gravar no banco.
- HTML da descrição sanitizado com DOMPurify antes de renderizar.
- Upload validado por tipo, extensão e tamanho máximo de 5 MB.
- Nomes de arquivos gerados com `crypto.randomUUID()`.
- Rotas `/admin/*` protegidas por sessão.
- Logout automático após 2 horas de inatividade.
- Headers de segurança no Cloudflare via `public/_headers`.
- Paginação pública de 20 perfumes por request.
- Filtros com deferimento + debounce de 300 ms para evitar spam ao banco.

## Observação sobre sessão

Nesta SPA, o Supabase persiste a sessão no cliente para manter o login entre navegações. Como não existe servidor próprio neste projeto, a proteção principal vem do RLS, da desativação de signups públicos no painel do Supabase e do auto logout por inatividade.

## Deploy no Cloudflare Pages

### Opção 1: Git integration

1. Suba este projeto para GitHub ou GitLab.
2. No Cloudflare, abra `Workers & Pages`.
3. Clique em `Create application` e depois em `Pages`.
4. Conecte o repositório.
5. Use estas configurações:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 20+ (apenas no build)
```

6. Em `Environment variables`, configure exatamente:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_WHATSAPP_NUMBER
```

7. Faça o deploy. O resultado é um site 100% estático servido pela borda do Cloudflare.

### Opção 2: deploy manual com Wrangler

```bash
npx wrangler login
npm run build
npx wrangler pages deploy ./dist --project-name=fonte-do-cheiro
```

## Checklist antes do deploy

- `.env.local` está ignorado no `.gitignore`.
- Nenhuma `service_role key` aparece em arquivos frontend.
- Signups públicos no Supabase Auth estão desativados.
- O usuário admin foi criado manualmente em `Authentication > Users`.
- As mesmas env vars foram configuradas no Cloudflare Pages.
- O bucket `perfumes` foi criado e as policies do Storage foram aplicadas.
- O SPA fallback está ativo via `public/_redirects`.

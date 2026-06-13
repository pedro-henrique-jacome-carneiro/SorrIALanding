# SorrIA Landing Page

Landing page do SorrIA, mini ERP odontologico com recursos de IA para apoio a gestao de clinicas odontologicas.

## Rodar localmente

1. Instale as dependencias:

```powershell
npm.cmd install
```

2. Crie um arquivo `.env` com base no `.env.example`.

3. Inicie o servidor local:

```powershell
npm.cmd start
```

4. Acesse:

```text
http://localhost:5600
```

## Variaveis de ambiente

Configure estas variaveis no `.env` local e tambem no Vercel:

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=orcamento@sorriaerp.com.br
SMTP_PASS=sua_senha_de_app_do_zoho
MAIL_TO=orcamento@sorriaerp.com.br
```

Nunca envie o arquivo `.env` para o GitHub.

## Deploy no Vercel

1. Envie o projeto para um repositorio no GitHub.
2. No Vercel, clique em `Add New Project`.
3. Importe o repositorio do GitHub.
4. Em `Environment Variables`, cadastre as variaveis SMTP.
5. Clique em `Deploy`.

O formulario envia os dados para `/api/orcamento`, que no Vercel roda como uma funcao serverless.

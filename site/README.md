# Latina Informática

Site institucional da Latina Informática, em Novo Hamburgo/RS.

Endereço na Vercel: https://latina-informatica.vercel.app/

Requer Node.js 22.12+ e Bun.

```sh
bun install
bun run dev
```

Para gerar e conferir a versão de publicação:

```sh
bun run build
bun run preview
```

Contatos, mensagens, serviços e categorias ficam em `src/config/site.ts`.

A publicação na Vercel usa `vercel.json`, com a página pré-renderizada em
`dist/client`. O domínio pode ser configurado em Settings → Domains do projeto.

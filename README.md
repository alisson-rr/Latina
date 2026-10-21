# Latina Informática · Loja demonstrativa

Protótipo de e-commerce em português brasileiro para a Latina Informática, a partir da base CommerceKit, com React, TypeScript e Vite. A empresa e seus contatos são reais; produtos, preços, estoques, avaliações, perfis e pedidos são fictícios. Imagens locais, sem dependência de serviços de imagem em runtime.

Dados da empresa concentrados em `src/config.ts`: Latina Informática Ltda., CNPJ 08.365.152/0001-08; Rua Bartolomeu de Gusmão, 645, Sala 04, Canudos, Novo Hamburgo/RS, CEP 93542-000; WhatsApp (51) 92006-6826; Instagram @latinainformatica. E-mail e horários não foram confirmados e não são publicados como oficiais.

## Executar

Use Node.js 24 LTS (ou uma versão compatível com Vite 8):

```sh
npm ci
npm run dev
npm run test
npm run build
```

O build estático fica em `dist/`. O roteamento usa hash e não exige redirecionamentos no servidor.

## Explorar

- Loja: `#/`, catálogo com busca/filtros/ordenação, produto com variantes, favoritos e sacola.
- Compra: `#/checkout`, identificação e endereço, modalidades de entrega, Pix/cartão/boleto simulados e acompanhamento do pedido.
- Conta: `#/conta`, cadastro e entrada de perfis fictícios, perfil, endereços, favoritos, pedidos e cancelamento antes do envio. Alex é o perfil inicial; os pedidos EX são exemplos navegáveis.
- Painel: `#/admin`, métricas calculadas, produtos/preços/estoque, categorias, clientes, cupons, pedidos e configurações. Acesso aberto para a demonstração.
- Suporte: sobre a marca, perguntas frequentes, contato e páginas de privacidade, entrega, trocas e termos.
- Cupom inicial: `BEMVINDO10`. Concluir pedido desconta o estoque; cancelar antes do envio repõe uma única vez. O histórico guarda os preços e endereço do momento da compra.

## Criar uma loja a partir da base

1. Copie o projeto para uma nova pasta, excluindo `.git`, `.openai`, `node_modules` e `dist`. A identidade de hospedagem `.openai` pertence exclusivamente a esta demonstração e não deve ser reutilizada.
2. Edite `src/config.ts`: nome, assinatura, cor, contatos, anúncio, limite de frete e **storageKey único por loja**. Edite `src/seed.ts` para catálogo, categorias, cupons e dados iniciais.
3. Substitua `public/images/`, o favicon, textos editoriais em `src/App.tsx` e metadados de `index.html`. `ASSETS.md` descreve os prompts das imagens desta coleção.
4. Rode a instalação, teste o fluxo e publique como um novo projeto. O painel muda somente os dados do navegador; para valores iniciais publicados, altere a configuração e o seed no código.

Dados são preservados no localStorage deste navegador/origem. Alterar o seed não sobrescreve dados locais já existentes. Para testar um novo seed, use um storageKey novo ou um perfil de navegador limpo.

## Limite da demonstração

Sem servidor, autenticação real, banco compartilhado, envio de e-mail, gateway de pagamento, transportadora, emissão fiscal ou cobrança. Frete, avaliações e dados comerciais são fictícios. Recuperação de conta, contato e newsletter mostram o fluxo sem envio externo. Use somente dados fictícios; perfis não têm senha. Estoque e favoritos são locais; não há sincronização entre abas, navegadores ou dispositivos.

Para operação real, persistência, autorização, preços, estoque, pedidos e integrações precisam ser implementados e validados no servidor. Esta base demonstra a experiência completa de navegação, e não é uma loja habilitada para vender.

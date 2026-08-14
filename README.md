# Meu Dinheiro

Aplicativo financeiro pessoal simples, responsivo e instalável, criado com React e TypeScript. Todos os lançamentos são armazenados somente no `localStorage` do navegador.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Publicação no GitHub Pages

Este repositório usa **Deploy from a branch**. O Vite gera o site pronto na pasta
`docs`, que deve ser versionada junto com o código:

```bash
npm run build
git add docs
git commit
```

Em **Settings → Pages**, escolha **Deploy from a branch**, a branch publicada e
a pasta **`/docs`**. Não selecione a raiz (`/`): ela contém os fontes TypeScript,
que o navegador não consegue executar diretamente.

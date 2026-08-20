# Meu Dinheiro Inteligente

Um aplicativo financeiro pessoal pensado primeiro para iPhone: simples para registrar o dia a dia, mas completo quando você precisar de mais detalhes.

## Principais recursos

- receitas, despesas, transferências e parcelamentos;
- contas, cartões, orçamentos e metas;
- importação de extratos CSV, OFX e QFX;
- categorização automática por palavras-chave;
- identificação e exclusão de lançamentos duplicados;
- diagnóstico financeiro automático baseado em regras, sem enviar dados para IA;
- busca, filtros, comparações mensais e análise por categoria;
- temas claro, escuro e automático conforme o sistema;
- cores de entradas e saídas personalizáveis nos ajustes;
- backup em JSON e exportação em CSV;
- banco de dados local no navegador;
- PWA instalável e funcionamento offline.

## Privacidade

Os dados financeiros ficam armazenados somente no navegador do aparelho. O projeto não envia extratos, saldos ou movimentações para servidores.

## Desenvolvimento

    npm install
    npm run dev

Para gerar a versão de produção:

    npm run build

## GitHub Pages

O fluxo incluído publica automaticamente o aplicativo após cada atualização da branch main.

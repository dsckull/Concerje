# 🛡️ COMPÊNDIO TÉCNICO: CONDO-MANAGER (CONSERJE)
**Data do Relatório:** 30 de Março
**Status Atual:** Ambiente de Desenvolvimento Local Windows (Homologado e 100% Funcional)
**Fase:** Migração Replit -> Windows & Estabilização da Arquitetura Core

---

## 🏗️ 1. Arquitetura do Sistema Consolidada
O sistema opera como um **Monorepo** (`pnpm workspaces`), dividindo-se fundamentalmente em Frontend e Backend, ambos conectados a um BaaS (Backend as a Service).

*   **Database:** PostgreSQL remoto (hospedado no Supabase).
*   **Backend (`api-server`):** Node.js com Express e Drizzle ORM. Roda nativamente na porta `5000`.
*   **Frontend (`conserje`):** Aplicação React / Vite com estilização em TailwindCSS v4 no padrão *Glassmorphism Dark Theme*. Roda nativamente na porta `5173`.
*   **Comunicação API-Client:** Requisições assíncronas assentes na biblioteca `@tanstack/react-query`.

---

## 🚨 2. Resolução de Conflitos e Bugs Sistêmicos (O que consertamos)

Durante a configuração do ambiente no Windows, o sistema apresentou falhas críticas herdadas do ambiente Linux anterior (Replit). Todas foram mapeadas, dissecadas e solucionadas:

### ❌ A. Falha de Binários Nativos e Instalação (PNPM)
*   **O Problema (Sintoma):** O servidor Vite crashava instantaneamente acusando falta do `rollup-win32` ou `esbuild` por ser um arquitetura não suportada.
*   **Diagnóstico:** O arquivo `pnpm-workspace.yaml` possuía configurações `supportedArchitectures` hardcoded para ignorar o Windows (`os: ["!win32"]`). Além disso, havia um script Unix `preinstall` no `package.json` base.
*   **A Solução (Fix):**
    1.  Remoção definitiva do bloqueio de arquitetura no YAML do pnpm.
    2.  Remoção do script `preinstall` de bash.
    3.  Inclusão formal de `node-linker=hoisted` no arquivo `.npmrc` base para consertar problemas de linkagem de dependências simétricas (symlinks) no Windows.

### ❌ B. Tela Preta e Crash Fatal do Frontend (React)
*   **O Problema (Sintoma):** A interface Web exibia tela em branco imediata sem logs aparentes, causando falha geral da UI.
*   **Diagnóstico:** O componente raiz `AppLayout.tsx` e `DashboardPage` tentavam invocar um hook importado chamado `useListAlertas` da biblioteca de cliente abstrata, o qual **não havia sido gerado ou não estava exportado** no escopo. 
*   **A Solução (Fix):** Foi realizada uma reescrita parcial do componente `AppLayout.tsx` utilizando diretamente os primitivos do `@tanstack/react-query` (`useQuery()`) acompanhados da API de `fetch("/api/alertas")`, bypassando o hook corrompido e restaurando a estabilidade da UI de Roteamento (Wouter).

### ❌ C. Falha de Comunicação em Cross-Origin (CORS Local)
*   **O Problema (Sintoma):** As chamadas do Frontend retornavam `404` ou falhavam em originamento (`localhost:5173` para `localhost:5000`).
*   **A Solução (Fix):** Injeção de uma regra de **Proxy no Vite** (`vite.config.ts`), mascarando chamadas para `/api/` no frontend de forma invisível para o motor do Express (`http://localhost:5000`), normalizando a rede e os cookies sem CORS em ambiente local.

### ❌ D. Timeout de Conexão Reversa / Banco de Dados (Supabase)
*   **O Problema (Sintoma):** A API subia sem problemas, porém qualquer Query disparava erro `ENETUNREACH` ou `ENOTFOUND` com a string via IPv6 puro do Drizzle ORM / PG.
*   **Diagnóstico:** O host direto (`db.[ID].supabase.co`) exige rede IPv6 em certos protocolos Node.js e DNS locais de Windows, falhando severamente portas diretas 5432. 
*   **A Solução (Fix):** Embasado nas diretrizes atuais do Supabase Cloud, a API teve como variável fundamental de `DATABASE_URL` a string de um **Transaction Pooler em IPv4** (`aws-1-sa-east-1.pooler.supabase.com:6543`), o qual normalizou as conexões assíncronas do provedor.
*   **Ações Acessórias no DB:** As migrações do Drizzle estavam vazias. Tabelas e Seed data (Moradores, Encomendas, Logs e Alertas) foram criadas com Queries SQL diretas dentro do DB remoto.

---

## ✅ 3. Checklist de Validade (Quality Assurance)
- [x] O frontend em modo desenvolvimento no Vite (`pnpm --filter @workspace/conserje dev`) starta em ~2 segundos com UI ilesa.
- [x] O backend HTTP com Node/Express (`index.mjs`) starta e mantém conexão ao Transaction Pooler da infraestrutura AWS Supabase em Nuvem.
- [x] Teste Autônomo E2E (Fim a Fim) concluído: A dashboard ("Central de Encomendas") lê o Endpoint `GET /api` local, que lê o Banco de Dados Nuvem e renderiza a tabela na UI (Visualizado pelo sub-agente).
- [x] A responsividade Mobile no React está nativa e limpa. Navegação via `wouter` não recarrega página.
- [x] Estilo Dark Mode implementado com consistência visual de componentes Shadcn-ui e bordas tailwind.

---

## 🤖 4. Próxima Fronteira (Ao dev Claude): Design Híbrido LLM
**Atenção para a próxima feature solicitada pelo Arquiteto:**
A integração primária de webhooks via *Telegram Bot + n8n* deve seguir o arquétipo **Multi-Layered (Híbrido)**:

1.  **Camada Determinística Inicial**: Recebimento do Webhook no n8n que dispara Menus estáticos de escolha numérica antes de acionar IA. A opção do menu consumirá REST API da nossa rota `/api` para dados velozes e a custo token $0.
2.  **Camada LLM de Fallback**: Somente inputs não padronizados, áudios ou seleções abertas chegarão ao Prompt de Sistema da API Gemini, garantindo longevidade do *Free Tier API Limit* e baixa latência ao usuário (Morador).

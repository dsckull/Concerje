# Workspace — Conserje

## Overview

Sistema de gestão condominial "Conserje". Interface web de gerenciamento que se integra com automações n8n via WhatsApp. O backend do chatbot é externo (n8n). Este projeto contém apenas o painel de gestão web e a API de dados.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Recharts

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── conserje/           # React dashboard frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
└── scripts/
```

## Database Schema

### `moradores`
- id, nome, apartamento, bloco, telefone (único), status, created_at

### `encomendas`
- id, codigo_rastreio, morador_id (FK), status_valido (pendente/notificado/retirado/extraviado), data_recebimento, foto_url, ocr_confianca

### `logs_interacao`
- id, morador_id (FK), tipo_msg (texto/imagem), acao, perfil_emocional (neutro/colaborativo/estressado/revoltado/mal-intencionado/empolgado/passivo/frustrado/confuso), resultado, created_at

### `alertas_defcom`
- id, nivel_risco (baixo/medio/alto/critico), tipo_ameaca (violencia/criminalidade/emergencia/intimidacao), descricao, resolucao, data_alerta, arquivado, autoridades_acionadas

## Frontend Pages

1. **/ (Dashboard Encomendas)** — Tabela em tempo real com filtros por apartamento e data, ação rápida de status inline
2. **/relatorios (Canal Síndica)** — KPIs, gráfico de pizza de perfis emocionais (Recharts), gráfico de linha de volume diário, tabela de logs
3. **/defcom (Módulo DefCom)** — Cards piscando em vermelho para alertas crítico/alto, botões Arquivar e Acionar Autoridades, tabela completa com filtros

## API Endpoints

- GET/PATCH `/api/encomendas` — Listagem e atualização de status
- GET `/api/moradores` — Listagem de moradores
- GET `/api/logs` — Logs de interação
- GET `/api/logs/stats/perfil-emocional` — Estatísticas emocionais
- GET `/api/logs/stats/acoes` — Volume diário de interações
- GET/PATCH `/api/alertas` — Alertas DefCom

## Integration Notes

- Dados são **inseridos externamente pelo n8n** via webhook
- Este painel apenas **lê e atualiza status** no banco
- Polling automático a cada 30 segundos nas telas de Encomendas e DefCom

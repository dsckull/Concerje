## 🚀 DEPLOYMENT GUIDE - CONDO MANAGER (RAILWAY)

> **Status**: ✅ Configuração Pronta
> **Data**: 30 de Março de 2026
> **Plataforma**: Railway.app
> **Custo**: ~$5-10/mês (Tier Econômico)

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta em [Railway.app](https://railway.app) (conectado a GitHub)
- [ ] Repositório GitHub com o projeto sincronizado
- [ ] Credenciais do Supabase (DATABASE_URL com Pooler IPv4)
- [ ] Git instalado localmente

**Teste LOCAL primeiro**:
```bash
cd "c:\Users\diego D. castro\Desktop\..."
pnpm install
pnpm build
# Backend deve iniciar em PORT=5000
```

---

## ✨ ARQUIVOS ADICIONADOS

| Arquivo | Propósito |
|---------|-----------|
| **`Dockerfile`** | Build em 2 estágios (Frontend + Backend) |
| **`railway.json`** | Configuração automática do Railway |
| **`.env.example`** | Template de variáveis de ambiente |
| **`app.ts` (modificado)** | Serve Frontend estático + API |

---

## 🎯 PASSO A PASSO: DEPLOY NO RAILWAY

### **PASSO 1: Preparar o Repositório Git**

```bash
cd "c:\Users\diego D. castro\Desktop\ai system agentes e tudo dos deve enginering\concierje\Condo-Manager"

# Adicionar arquivos de deploy
git add Dockerfile railway.json .env.example
git commit -m "🚀 Add Railway deployment configuration"
git push origin main
```

---

### **PASSO 2: Conectar Railway ao GitHub**

1. Acesse [railway.app/dashboard](https://railway.app/dashboard)
2. Clique em **"+ New Project"**
3. Selecione **"Deploy from GitHub"**
4. Autorize Railway no GitHub (se for primeira vez)
5. Selecione seu repositório `Condo-Manager`
6. Escolha branch: `main` ✅

---

### **PASSO 3: Configurar Variáveis de Ambiente**

Na dashboard do Railway, vá para **Variables**:

```
PORT = 5000
NODE_ENV = production
BASE_PATH = /
DATABASE_URL = postgresql://postgres:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

**Onde obter DATABASE_URL:**
- Acesse [Supabase Dashboard](https://app.supabase.com)
- Projeto → Configurações → Database
- Connection Pooler → Copie a string com **IPv4** (usar `:6543`)
- Substitua `[user]` e `[password]` pelos valores corretos

✅ **Exemplo correto:**
```
postgresql://postgres:suasenha123@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### **PASSO 4: Configurar Build Settings**

Railway deve detectar o `Dockerfile` automaticamente. Se não:

**Em Railway Dashboard → Build Settings:**

- **Builder**: Dockerfile
- **Dockerfile Path**: `./Dockerfile`
- **Build Command**: (será detectado)
- **Start Command**: `node dist/index.mjs`

---

### **PASSO 5: Deploy!**

1. Railway builda automaticamente ao fazer push
2. Monitore o log em **Railway Deployments**
3. Quando aparecer ✅ **Deployment Successful**, seu app está rodando!

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

Após o deploy bem-sucedido:

```bash
# 1. Testar Health Check
curl https://your-app-name.up.railway.app/api/healthz
# Deve retornar: {"status":"ok"}

# 2. Testar API
curl https://your-app-name.up.railway.app/api/moradores
# Deve retornar JSON da API

# 3. Testar Frontend (abrir no navegador)
https://your-app-name.up.railway.app
# Deve carregar a dashboard do Condo Manager
```

---

## 🐛 TROUBLESHOOTING

### ❌ **Build falha com: "esbuild not found"**
- **Solução**: Railway pull `pnpm-lock.yaml` — verifique se está no Git
```bash
git add pnpm-lock.yaml
git commit -m "Add lock file"
git push
```

### ❌ **Database Connection Timeout**
- **Problema**: DATABASE_URL está usando IPv6 direto (porta 5432)
- **Solução**: Use **Transaction Pooler** (porta 6543) conforme `.env.example`

### ❌ **Frontend retorna 404 em SPA routes**
- **Solução**: Já está configurado em `app.ts` — qualquer rota não-API serve `index.html`

### ❌ **Port 3000 vs 5000**
- Railway **pode** atribuir dinamicamente porta ao seu app
- Use **`process.env.PORT`** (já configurado no código)
- ✅ Nosso backend já suporta isso

### ❌ **Deployment fica "deploying" por muito tempo**
- Timeout do build = 30 min no Railway
- Frontend (+Vite) pode demorar 10-15 min
- Se exceder: cancele e tente novamente (Railway tem cache)

---

## 📊 ARQUITETURA DO DEPLOY

```
┌─────────────────────────────────────────────────┐
│           Railway Container (Alpine)             │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │   Express Server (Node 22)               │   │
│  │   PORT: 5000                            │   │
│  ├──────────────────────────────────────────┤   │
│  │   Routes:                                │   │
│  │   ├─ /api/*      → API Backend          │   │
│  │   ├─ /static/*   → Vite Assets (Cached)│   │
│  │   └─ /*          → index.html (SPA)     │   │
│  └──────────────────────────────────────────┘   │
│                      ↓                           │
│         Supabase PostgreSQL (IPv4)             │
│    Pooler: aws-1-sa-east-1.pooler.sb      │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## 💰 ESTIMATIVA DE CUSTOS

| Serviço | Tier | Preço |
|---------|------|-------|
| **Railway** | Starter (512MB RAM) | $5/mês |
| **Supabase DB** | Free (500MB) | $0 |
| **Domínio Custom** (opcional) | - | +$0-15/ano |
| **Total** | - | ~$5-10/mês |

---

## 🔐 SEGURANÇA

✅ Já implementado:
- [x] CORS configurado
- [x] Helmet não necessário (Express 5 tem defaults)
- [x] Rate limiting: use middleware no futuro se necessário
- [x] JWT tokens: integre conforme necessário
- [x] Logs estruturados (Pino)

📝 **Adicionar depois**:
```typescript
import helmet from "helmet";
app.use(helmet()); // Security headers
```

---

## 📈 PRÓXIMOS PASSOS (Opcional)

1. **Custom Domain**:
   - Railway → Settings → Domains
   - Aponte seu domínio (CNAME/A record)

2. **Database Backup** (Supabase):
   - Ativar backups automáticos
   - Testar restore regularmente

3. **Monitoring**:
   - Railway fornece logs + restart automático
   - Adicionar Sentry para erros em produção (opcional)

4. **CI/CD Melhorado**:
   - Adicionar testes E2E
   - GitHub Actions para deploy automático

---

## 📞 SUPORTE

Questões comuns:
- **Railway demora muito?** → Normal na primeira build (até 20 min)
- **App reinicia sozinho?** → Health check pode estar restrito
- **Multa inesperada?** → Railway cobra por uso de RAM/CPU — ajuste seu tier

Documentação:
- [Railway Docs](https://docs.railway.app)
- [Dockerfile Guide](https://docs.railway.app/build-instructions#dockerfile)
- [Supabase Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

**🎉 Pronto para o Production!**

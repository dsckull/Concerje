## 🚀 DEPLOYMENT GUIDE - CONDO MANAGER (RENDER.COM)

> **Alternativa**: Render.com
> **Status**: ✅ Configuração Compatível
> **Diferenças do Railway**: Pricing diferente, mais rígido com free tier

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta em [Render.com](https://render.com) (conectado a GitHub)
- [ ] Repositório GitHub com o projeto sincronizado
- [ ] Credenciais do Supabase (DATABASE_URL)

---

## 🎯 PASSO A PASSO: DEPLOY NO RENDER

### **PASSO 1: Criar Web Service**

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique **"+ New"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione `Condo-Manager`
5. Preencha:

| Campo | Valor |
|-------|-------|
| **Name** | condo-manager |
| **Environment** | Docker |
| **Branch** | main |
| **Build Command** | (deixe em branco) |
| **Start Command** | `node dist/index.mjs` |

---

### **PASSO 2: Configurar Variáveis de Ambiente**

Em **Render Dashboard → Environment**:

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = postgresql://postgres:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
BASE_PATH = /
```

⚠️ **IMPORTANTE**: Render usa porta `10000` (não pode mudar!)

---

### **PASSO 3: Modificar PORT na Produção (Render)**

Para Render funcionar, você precisa deixar flexível:

**Em `artifacts/api-server/src/app.ts`** (já feito)

O código já suporta `process.env.PORT` dinamicamente.

---

### **PASSO 4: Escolher Plano**

- **Free**: 0.5GB RAM (demora demais, pode ficar inativo)
- **Starter**: 0.5GB RAM, $7/mês (recomendado)
- **Standard**: 2GB RAM, $25/mês

⚠️ **Render Free tier é bem restritivo** — melhor usar Starter ($7/mês)

---

### **PASSO 5: Deploy**

1. Clique em **"Create Web Service"**
2. Render automaticamente:
   - Clona o código
   - Detecta `Dockerfile`
   - Inicia build (15-20 min)
3. Quando aparecer ✅ **Live**, seu app está rodando!

---

## 🔗 URL do Seu App

Formato: `https://condo-manager.onrender.com`

Você pode customizar em **Settings → Custom Domain**

---

## 🐛 TROUBLESHOOTING RENDER

### ❌ **Build fails: "Dockerfile not found"**
- Render deve estar procurando no lugar errado
- Solução: Em **Build Settings**, defina:
  - Build Command: (deixe vazio)
  - Dockerfile: `./Dockerfile`

### ❌ **App constantly restarting**
- Health check pode estar falhando
- Render reinicia se houver crash
- Verifique os logs em **Logs**

### ❌ **Port mismatch error**
- **Render força porta 10000** (não é configurável)
- ✅ Nosso código já suporta: `process.env.PORT`
- Se erro persistir, adicione em `index.ts`:

```typescript
const port = Number(process.env.PORT || 5000);
```

### ❌ **Database timeout**
- Mesma solução que Railway: use **IPv4 Pooler** no Supabase
- Exemplo: `aws-1-sa-east-1.pooler.supabase.com:6543`

### ❌ **Out of Memory (OOM)**
- Render Free é limitado (512MB de RAM)
- Solução: Migrar para **Starter Plan** ($7/mês)

---

## ⚡ RAILWAY vs RENDER

| Aspecto | Railway | Render |
|--------|---------|--------|
| **Free Tier** | $5 crédito/mês | Muito limitado (inativo) |
| **Starter** | $5/mês | $7/mês |
| **Uptime Guarantee** | 99.5% | 99.5% |
| **Deploy Speed** | 15-20 min | 20-30 min |
| **Supports pnpm** | ✅ Sim | ✅ Sim (Dockerfile) |
| **Domain Grátis** | railway.app | onrender.com |
| **Recomendação** | 👍 Melhor relação $ | Mais caro |

**🏆 Recomendação**: Use **RAILWAY** — mais barato e mais rápido.

---

## ✅ COMPARAÇÃO DE CHECKLISTS

### Railway
- [x] Detecta `railway.json` automaticamente
- [x] Mais rápido (cache otimizado)
- [x] Suporta monorepo pnpm
- [x] Mais variáveis de ambiente grátis

### Render
- [x] UI mais intuitiva
- [x] Bom para apps simples
- [x] Supports Dockerfile bem
- [ ] Mais caro
- [ ] Free tier muito limitado

---

## 🎯 RECOMENDAÇÃO FINAL

**Use RAILWAY quando:**
1. Quer melhor relação custo/benefício
2. Monorepo com múltiplos workspaces
3. Quer deploy simples (zero configuração)

**Use RENDER quando:**
1. Preferir UI mais visual
2. Já tem conta ativa
3. Está disposto a pagar mais

**🚀 Minha recomendação: RAILWAY** (que configuramos em `DEPLOYMENT_GUIDE_RAILWAY.md`)

---

## 📞 REFERÊNCIAS

- [Render Docs](https://render.com/docs)
- [Render Docker Guide](https://render.com/docs/docker)
- [Railway vs Render Comparison](https://railway.app) vs [Render](https://render.com)

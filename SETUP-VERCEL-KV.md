# Configuração do Vercel KV (Redis)

Este guia explica como configurar o Vercel KV para armazenar as reservas em produção.

## Por que Vercel KV?

Na Vercel, o sistema de arquivos é **read-only** em produção. Não é possível salvar dados em arquivos JSON como fazíamos localmente. O Vercel KV é um banco de dados Redis serverless perfeito para:

- ✅ Armazenar dados temporários (reservas)
- ✅ Acesso rápido e baixa latência
- ✅ Integração nativa com Vercel
- ✅ Plano gratuito generoso

## Passo a Passo

### 1. Acessar o Dashboard da Vercel

1. Entre em [vercel.com](https://vercel.com)
2. Selecione seu projeto **estacionaaqui**

### 2. Criar Database KV

1. No menu lateral, clique em **Storage**
2. Clique em **Create Database**
3. Selecione **KV (Redis)**
4. Escolha um nome (exemplo: `estacionaaqui-kv`)
5. Selecione a região mais próxima (exemplo: `iad1` - Washington, D.C.)
6. Clique em **Create**

### 3. Conectar ao Projeto

1. Após criar o database, você verá a tela de configuração
2. Clique em **Connect Project**
3. Selecione o projeto **estacionaaqui**
4. Clique em **Connect**

### 4. Verificar Variáveis de Ambiente

As variáveis de ambiente são automaticamente adicionadas ao projeto:

```bash
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

Você pode verificar em: **Settings** > **Environment Variables**

### 5. Redeploy

Após conectar o KV, faça um redeploy:

1. Vá em **Deployments**
2. No último deployment, clique nos três pontos `...`
3. Clique em **Redeploy**
4. Confirme o redeploy

## Desenvolvimento Local

Para testar localmente com Vercel KV:

```bash
# 1. Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Vincular projeto local
vercel link

# 4. Baixar variáveis de ambiente
vercel env pull .env.local
```

Isso criará um arquivo `.env.local` com as variáveis do KV.

**Alternativa**: Durante desenvolvimento, o sistema usa automaticamente o arquivo `data/reservations.json`. Não é necessário configurar KV localmente.

## Verificar se Está Funcionando

Após o redeploy:

1. Acesse sua aplicação em produção
2. Tente criar uma reserva
3. Se funcionar, o KV está configurado corretamente! 🎉

## Monitoramento

Você pode monitorar o uso do KV em:

**Dashboard Vercel** > **Storage** > **estacionaaqui-kv** > **Data**

Lá você verá:
- Chave `reservations` com todas as reservas
- Número de operações (reads/writes)
- Uso de memória

## Limpar Dados (Opcional)

Para limpar todas as reservas:

1. Vá em **Storage** > **estacionaaqui-kv** > **Data**
2. Encontre a chave `reservations`
3. Clique em **Delete**

## Custos

O plano gratuito do Vercel KV inclui:
- **256 MB** de armazenamento
- **3000 comandos/dia**
- **100 GB** de bandwidth/mês

Para este projeto, isso é mais do que suficiente! 💚

## Troubleshooting

### Erro: "KV_REST_API_URL is not defined"

**Solução**: As variáveis de ambiente não foram configuradas. Siga os passos 2-4 novamente.

### Erro: "Unauthorized"

**Solução**: O token KV está incorreto ou expirado. Regenere o token no dashboard da Vercel.

### Reservas não persistem

**Solução**: Verifique se o KV está conectado ao projeto correto. Vá em **Storage** > **estacionaaqui-kv** > **Projects** e confirme.

## Alternativas

Se preferir não usar Vercel KV, outras opções:

1. **Vercel Postgres** - Para dados mais complexos
2. **Supabase** - Postgres gratuito com real-time
3. **Firebase Firestore** - NoSQL do Google
4. **MongoDB Atlas** - MongoDB gerenciado

Mas para este projeto, **Vercel KV é a melhor escolha** pela simplicidade e integração.

---

**Pronto!** Agora seu sistema de reservas funciona perfeitamente em produção. 🚀
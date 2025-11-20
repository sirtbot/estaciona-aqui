# Configuração do Supabase - EstacionaAqui

Este documento explica como configurar o banco de dados Supabase para o sistema EstacionaAqui.

## 📋 Pré-requisitos

- Conta Supabase criada em [https://supabase.com](https://supabase.com)
- Projeto Supabase configurado

## 🔧 Configuração do Banco de Dados

### 1. Executar Script SQL

O script de criação do banco de dados está localizado em:
```
scripts/setup-supabase.sql
```

#### Passos para executar:

1. Acesse o painel do Supabase: [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**
5. Copie todo o conteúdo do arquivo `scripts/setup-supabase.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione `Ctrl+Enter`)

### 2. Verificar Criação da Tabela

Após executar o script, verifique se a tabela foi criada:

1. No menu lateral, clique em **Table Editor**
2. Você deverá ver a tabela **reservations**
3. Clique na tabela para ver sua estrutura

### 3. Estrutura da Tabela

A tabela `reservations` possui a seguinte estrutura:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT | Identificador único (formato: res-{timestamp}) |
| `spot_id` | TEXT | ID da vaga reservada |
| `name` | TEXT | Nome completo do condutor |
| `license_plate` | TEXT | Matrícula do veículo (em maiúsculas) |
| `start_time` | TIMESTAMPTZ | Data/hora de início (UTC) |
| `end_time` | TIMESTAMPTZ | Data/hora de término (UTC) |
| `created_at` | TIMESTAMPTZ | Data/hora de criação do registro |

### 4. Índices Criados

O script cria os seguintes índices para otimizar as consultas:

- `idx_reservations_spot_id` - Para buscas por vaga
- `idx_reservations_end_time` - Para filtrar reservas ativas
- `idx_reservations_start_time` - Para ordenar por data de início
- `idx_reservations_spot_time` - Para verificação de conflitos

### 5. Row Level Security (RLS)

O script habilita RLS e cria políticas que permitem:
- ✅ Leitura pública de todas as reservas
- ✅ Criação pública de reservas
- ✅ Atualização pública de reservas
- ✅ Exclusão pública de reservas

**⚠️ Nota de Segurança**: As políticas atuais permitem acesso público. Para produção, considere implementar autenticação e políticas mais restritivas.

## 🔑 Credenciais

As credenciais do Supabase já estão configuradas em:

### URL do Projeto
```
https://uonkxhaxcyoaiskptxxj.supabase.co
```

### Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmt4aGF4Y3lvYWlza3B0eHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjkyMjEsImV4cCI6MjA3OTIwNTIyMX0.bYXfdI3HR0I1DJ4EoLLggU0FfdHBsASuvmmLtWxV_pw
```

### Arquivos Atualizados
- `/lib/supabase.ts` - Cliente Supabase
- `/scripts/migrate-to-supabase.ts` - Script de migração

## 📦 Migração de Dados Existentes

Se você possui reservas em arquivo JSON local (`data/reservations.json`), pode migrá-las para o Supabase:

```bash
npm run migrate
```

Este comando:
1. Lê o arquivo `data/reservations.json`
2. Filtra apenas reservas ativas (não expiradas)
3. Converte para o formato do Supabase (snake_case)
4. Insere no banco de dados

### Requisitos para Migração
- Arquivo `data/reservations.json` deve existir
- Tabela `reservations` deve estar criada no Supabase
- Credenciais configuradas corretamente

## 🧪 Testar Conexão

Você pode testar se a conexão com o Supabase está funcionando:

### Via Aplicação
1. Execute o servidor de desenvolvimento: `npm run dev`
2. Acesse [http://localhost:3000](http://localhost:3000)
3. Tente criar uma reserva
4. Verifique no Supabase Table Editor se a reserva foi criada

### Via Script de Migração
```bash
npm run migrate
```

Mesmo sem dados para migrar, o script validará a conexão.

## 🔍 Verificar Reservas

### Via Supabase Dashboard
1. Acesse **Table Editor** > **reservations**
2. Visualize todas as reservas
3. Edite ou delete manualmente se necessário

### Via SQL Editor
```sql
-- Ver todas as reservas ativas
SELECT * FROM reservations 
WHERE end_time > NOW() 
ORDER BY start_time;

-- Ver estatísticas
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN end_time > NOW() THEN 1 END) as ativas,
  COUNT(CASE WHEN start_time > NOW() THEN 1 END) as agendadas
FROM reservations;

-- Limpar todas as reservas (cuidado!)
DELETE FROM reservations;
```

## 🐛 Troubleshooting

### Erro: "relation reservations does not exist"
**Solução**: Execute o script `setup-supabase.sql` no SQL Editor

### Erro: "Invalid API key"
**Solução**: Verifique se as credenciais em `/lib/supabase.ts` estão corretas

### Erro: "permission denied for table reservations"
**Solução**: Certifique-se que as políticas RLS foram criadas corretamente

### Reservas não aparecem
**Solução**: 
1. Verifique se a tabela foi criada
2. Execute uma query SQL para verificar se há dados
3. Verifique o console do navegador por erros

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)

## ✅ Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Script SQL executado (`setup-supabase.sql`)
- [ ] Tabela `reservations` criada
- [ ] Políticas RLS configuradas
- [ ] Credenciais atualizadas nos arquivos
- [ ] Teste de conexão realizado
- [ ] Migração de dados (se necessário)

---

Para mais informações sobre o sistema de reservas, consulte:
- `CONFIGURACAO-RESERVAS.md` - Configurações do sistema
- `ADMIN-PANEL.md` - Painel administrativo
- `SISTEMA-LUZES.md` - Sistema de sinalização

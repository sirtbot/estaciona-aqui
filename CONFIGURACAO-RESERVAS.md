# Configuração do Sistema de Reservas

Este documento explica como configurar os parâmetros do sistema de reservas de estacionamento.

## 📍 Localização

Todas as configurações estão centralizadas no arquivo:
```
/lib/reservation-config.ts
```

## ⚙️ Configurações Disponíveis

### 1. Margem de Segurança entre Reservas

**Parâmetro:** `BUFFER_HOURS_BETWEEN_RESERVATIONS`

Define quanto tempo deve passar após o término de uma reserva antes que uma nova reserva possa começar na mesma vaga.

**Valores sugeridos:**
- `0` - Permite reservar imediatamente após o término (sem intervalo)
- `0.5` - 30 minutos de intervalo **(PADRÃO)**
- `1` - 1 hora de intervalo
- `2` - 2 horas de intervalo
- `3` - 3 horas de intervalo

**Exemplo de uso:**
```typescript
export const BUFFER_HOURS_BETWEEN_RESERVATIONS = 0.5; // 30 minutos
```

**Como funciona:**
- Quando um utilizador tenta reservar uma vaga que está ocupada, o sistema automaticamente calcula o horário mínimo disponível
- Este horário é o término da última reserva + margem de segurança
- O diálogo mostra um aviso informando quando a vaga estará disponível
- O seletor de data/hora não permite escolher horários antes deste mínimo

---

### 2. Antecedência Máxima para Reservas

**Parâmetro:** `MAX_ADVANCE_DAYS`

Define quantos dias de antecedência um utilizador pode fazer uma reserva.

**Valor padrão:** `2` (48 horas)

**Exemplo:**
```typescript
export const MAX_ADVANCE_DAYS = 2; // 2 dias de antecedência
```

---

### 3. Durações Disponíveis

**Parâmetro:** `AVAILABLE_DURATIONS`

Lista de opções de duração que aparecem no diálogo de reserva.

**Estrutura:**
```typescript
{
  value: string;    // Valor em horas (pode ser decimal)
  label: string;    // Texto mostrado ao utilizador
  popular: boolean; // Se true, mostra badge "Popular"
}
```

**Exemplo de personalização:**
```typescript
export const AVAILABLE_DURATIONS = [
  { value: "1", label: "1h", popular: false },
  { value: "2", label: "2h", popular: true },
  { value: "4", label: "4h", popular: true },
  { value: "8", label: "8h", popular: false },
] as const;
```

---

### 4. Duração Padrão

**Parâmetro:** `DEFAULT_DURATION`

Define qual duração vem pré-selecionada no diálogo de reserva.

**Valor padrão:** `"2"` (2 horas)

**Exemplo:**
```typescript
export const DEFAULT_DURATION = "2"; // 2 horas
```

---

### 5. Intervalo de Atualização

**Parâmetro:** `REFRESH_INTERVAL_MS`

Define de quanto em quanto tempo (em milissegundos) o sistema atualiza automaticamente as reservas.

**Valor padrão:** `5000` (5 segundos)

**Valores sugeridos:**
- `2000` - 2 segundos (mais responsivo, mais requisições)
- `5000` - 5 segundos **(PADRÃO - equilibrado)**
- `10000` - 10 segundos (menos requisições)
- `30000` - 30 segundos (economia de recursos)

---

## 🎯 Cenários de Uso

### Cenário 1: Estacionamento Rápido (Rotatividade Alta)
```typescript
export const BUFFER_HOURS_BETWEEN_RESERVATIONS = 0;    // Sem intervalo
export const MAX_ADVANCE_DAYS = 1;                     // Apenas 24h
export const DEFAULT_DURATION = "1";                   // 1 hora padrão
export const REFRESH_INTERVAL_MS = 2000;               // Atualização rápida
```

### Cenário 2: Estacionamento Corporativo (Controle Moderado)
```typescript
export const BUFFER_HOURS_BETWEEN_RESERVATIONS = 0.5;  // 30 min intervalo
export const MAX_ADVANCE_DAYS = 2;                     // 48h antecedência
export const DEFAULT_DURATION = "2";                   // 2 horas padrão
export const REFRESH_INTERVAL_MS = 5000;               // Atualização balanceada
```

### Cenário 3: Estacionamento Premium (Controle Rigoroso)
```typescript
export const BUFFER_HOURS_BETWEEN_RESERVATIONS = 1;    // 1h intervalo
export const MAX_ADVANCE_DAYS = 7;                     // 1 semana
export const DEFAULT_DURATION = "4";                   // 4 horas padrão
export const REFRESH_INTERVAL_MS = 10000;              // Atualização lenta
```

---

## 🔄 Como Aplicar Alterações

1. Edite o arquivo `/lib/reservation-config.ts`
2. Modifique os valores desejados
3. Salve o arquivo
4. O sistema aplicará as mudanças automaticamente no próximo carregamento

**Nota:** Não é necessário reiniciar o servidor em modo desenvolvimento (hot reload ativo).

---

## ⚠️ Considerações Importantes

### Margem de Segurança Zero
- Permite reservas consecutivas sem intervalo
- Útil para maximizar ocupação
- **Atenção:** Não considera tempo de limpeza ou transição

### Margem de Segurança Alta (2h+)
- Garante tempo para limpeza, manutenção, etc.
- Reduz taxa de ocupação
- Recomendado para estacionamentos premium

### Intervalo de Atualização Baixo (<3s)
- Interface mais responsiva
- Maior consumo de recursos do servidor
- Mais tráfego de rede

### Intervalo de Atualização Alto (>30s)
- Economia de recursos
- Pode mostrar informações desatualizadas temporariamente
- Recomendado para muitos utilizadores simultâneos

---

## 📊 Monitoramento

Para verificar se as configurações estão corretas:

1. Abra o console do navegador (F12)
2. Ao abrir o diálogo de reserva em vaga ocupada, verifique:
   - Mensagem de aviso com horário mínimo
   - Campo de data/hora desabilitado antes do horário mínimo
   - Switch "Reservar Agora" desabilitado (se houver reserva ativa)

---

## 🐛 Troubleshooting

### Problema: Não consigo reservar após término
**Solução:** Verifique se `BUFFER_HOURS_BETWEEN_RESERVATIONS` não está muito alto

### Problema: Sistema permite reservas sobrepostas
**Solução:** Verifique se o filtro de reservas existentes está sendo passado corretamente no `page.tsx`

### Problema: Interface não atualiza automaticamente
**Solução:** Verifique `REFRESH_INTERVAL_MS` e certifique-se que não há erros na API

---

## 📝 Notas Técnicas

- Todos os cálculos de tempo usam a biblioteca `date-fns`
- Horários são armazenados em UTC no servidor
- Conversão para timezone local é automática
- A validação de conflitos é feita tanto no cliente quanto no servidor

---

Para mais informações sobre o sistema de luzes de sinalização, consulte `SISTEMA-LUZES.md`.
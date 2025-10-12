# 💡 Sistema de Luzes - EstacionaAqui

Sistema visual de indicação de status de vagas em tempo real.

## 🎯 O que é?

Um display visual em tela cheia que mostra se uma vaga está **livre (verde)** ou **ocupada (vermelho)**, com timer mostrando quanto tempo falta para a reserva terminar.

## 📍 URLs

### Visualizar todas as vagas:
```
http://localhost:3000/luz
```

### Visualizar vaga específica:
```
http://localhost:3000/luz/[número]
```

**Exemplos:**
- `/luz/1` - Vaga 1
- `/luz/5` - Vaga 5
- `/luz/15` - Vaga 15
- `/luz/24` - Vaga 24

## 🎨 Visual

### Vaga Livre (Verde)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            [NÚMERO]                 │
│                                     │
│             LIVRE                   │
│                                     │
│                                     │
└─────────────────────────────────────┘
   Fundo: Verde (#10b981)
```

### Vaga Ocupada (Vermelho)
```
┌─────────────────────────────────────┐
│  ◉ (piscando)                       │
│                                     │
│            [NÚMERO]                 │
│                                     │
│            OCUPADO                  │
│                                     │
│          2h 15m 30s                 │
│         (timer em tempo real)       │
│                                     │
│          João Silva                 │
│      (nome do reservante)           │
│                                     │
└─────────────────────────────────────┘
   Fundo: Vermelho (#dc2626)
```

## 🚀 Casos de Uso

### 1. Display em TV/Monitor
Coloque um monitor em cada vaga mostrando:
```
http://seu-servidor.com/luz/1
```

### 2. Tablet na entrada
Liste todas as vagas disponíveis:
```
http://seu-servidor.com/luz
```

### 3. Kiosk de informação
Tela touch com grid de todas as vagas

### 4. Sinalização LED
Integre com hardware RGB via API

## ⚡ Características

### ✅ Atualização Automática
- **Reservas**: Verifica a cada 2 segundos
- **Timer**: Atualiza a cada 1 segundo
- Sem necessidade de recarregar a página

### ✅ Responsivo
- Funciona em qualquer tamanho de tela
- Otimizado para tablets e monitores grandes
- Texto em tamanho grande e legível

### ✅ Indicadores Visuais
- **Verde** = Livre
- **Vermelho** = Ocupado
- **Círculo piscante** = Indicador de ocupação
- **Timer gigante** = Tempo restante
- **Nome do usuário** = Quem reservou

### ✅ Transições Suaves
- Mudança de cor suave (500ms)
- Animações de pulsação
- Efeitos de sombra

## 🔧 Configuração

### Hardware Recomendado

#### Para cada vaga:
- **Raspberry Pi** + Monitor LCD
- **Tablet Android** em modo kiosk
- **iPad** em modo guided access
- **Monitor HDMI** + Chromecast

#### Setup Básico:
```bash
# 1. Configurar dispositivo em modo kiosk
# 2. Abrir navegador em tela cheia
# 3. Acessar URL: http://servidor/luz/[número]
# 4. Configurar auto-reload em caso de erro
```

## 📱 Modo Kiosk

### Android (Chrome):
1. Instalar "Kiosk Browser Lockdown"
2. Configurar URL: `/luz/1`
3. Ativar modo kiosk
4. Desativar sleep/standby

### iOS (Safari):
1. Configurar Guided Access
2. Abrir Safari em tela cheia
3. Navegar para `/luz/1`
4. Ativar Guided Access (3x no botão home)

### Raspberry Pi:
```bash
# Instalar Chromium em kiosk mode
sudo apt-get install chromium-browser unclutter

# /home/pi/.config/lxsession/LXDE-pi/autostart
@chromium-browser --kiosk --noerrdialogs --disable-infobars http://servidor/luz/1
@unclutter -idle 0
@xset s off
@xset -dpms
@xset s noblank
```

## 🎭 Personalização

### Alterar Cores:
Edite `app/luz/[spotNumber]/page.tsx`:

```typescript
// Verde para livre
className="bg-green-500"  // Altere aqui

// Vermelho para ocupado
className="bg-red-600"    // Altere aqui
```

### Alterar Timer:
```typescript
// Intervalo de atualização (linha 52)
const interval = setInterval(fetchReservation, 2000); // 2 segundos
```

### Adicionar Logo:
```tsx
<div className="absolute top-8 left-8">
  <img src="/logo.png" alt="Logo" className="h-16" />
</div>
```

## 🔌 Integração com Hardware

### LED RGB via GPIO:
```python
import RPi.GPIO as GPIO
import requests
import time

RED_PIN = 17
GREEN_PIN = 27

def check_spot(number):
    try:
        r = requests.get(f'http://servidor/api/reservations')
        reservations = r.json()
        # Verificar se vaga está ocupada
        # ...
        return is_occupied
    except:
        return False

while True:
    occupied = check_spot(1)
    if occupied:
        GPIO.output(RED_PIN, GPIO.HIGH)
        GPIO.output(GREEN_PIN, GPIO.LOW)
    else:
        GPIO.output(RED_PIN, GPIO.LOW)
        GPIO.output(GREEN_PIN, GPIO.HIGH)
    time.sleep(2)
```

## 📊 Exemplos de Deploy

### 1. Uma vaga por dispositivo:
```
Monitor 1 → /luz/1
Monitor 2 → /luz/2
Monitor 3 → /luz/3
...
```

### 2. Grid de vagas (entrada):
```
Tablet na entrada → /luz
(mostra todas as vagas em grid)
```

### 3. Sistema misto:
```
Entrada: Grid geral (/luz)
Vaga 1-6: Monitor individual (/luz/1, /luz/2, etc)
Vaga 7-12: LED via API
```

## 🎯 Melhores Práticas

### Display:
- ✅ Use monitores de pelo menos 7 polegadas
- ✅ Brilho alto para ambientes externos
- ✅ Contraste alto para legibilidade
- ✅ Proteção contra sol/chuva se externo

### Rede:
- ✅ WiFi dedicado para displays
- ✅ IP fixo para cada dispositivo
- ✅ Auto-reconexão em caso de queda
- ✅ Backup via 4G se crítico

### Manutenção:
- ✅ Auto-reload diário (às 3h da manhã)
- ✅ Monitoramento de conectividade
- ✅ Alert se dispositivo offline
- ✅ Acesso remoto para debug

## 🔍 Troubleshooting

### Display não atualiza?
```bash
# 1. Verificar conectividade
ping servidor

# 2. Verificar console do navegador (F12)
# Deve mostrar logs a cada 2s

# 3. Limpar cache
Ctrl + Shift + R

# 4. Verificar API
curl http://servidor/api/reservations
```

### Cores erradas?
- Verificar se a reserva está ativa (startTime < now < endTime)
- Verificar spotId vs spotNumber na API
- Limpar localStorage do navegador

### Timer não aparece?
- Verificar formato de data na API (ISO string)
- Verificar timezone do servidor
- Logs no console devem mostrar o cálculo

## 📈 Melhorias Futuras

### Planejadas:
- [ ] Som ao mudar de status
- [ ] QR Code para reserva rápida
- [ ] Histórico de ocupação (gráfico)
- [ ] Modo noturno (dim automático)
- [ ] Suporte a múltiplos idiomas
- [ ] API para integração com sensores físicos

### Avançadas:
- [ ] Machine Learning para prever horários livres
- [ ] Integração com câmeras (detecção de veículo)
- [ ] App mobile para notificações
- [ ] Sistema de filas (lista de espera)

## 🎉 Pronto!

Seu sistema de luzes está configurado e funcionando!

Acesse `/luz` para ver todas as vagas ou `/luz/[número]` para uma vaga específica.

---

**💡 Dica:** Use em TVs/Tablets antigos para dar nova vida a equipamentos parados!
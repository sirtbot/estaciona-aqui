/**
 * Configuração de Reservas
 *
 * Este arquivo centraliza as configurações relacionadas ao sistema de reservas,
 * incluindo margens de segurança e regras de agendamento.
 */

/**
 * Margem de segurança entre reservas (em horas)
 *
 * Define quanto tempo deve passar após o término de uma reserva
 * antes que uma nova reserva possa começar na mesma vaga.
 *
 * Exemplos:
 * - 0: Permite reservar imediatamente após o término
 * - 0.5: 30 minutos de intervalo
 * - 1: 1 hora de intervalo
 * - 2: 2 horas de intervalo
 */
export const BUFFER_HOURS_BETWEEN_RESERVATIONS = 0.5;

/**
 * Número máximo de dias de antecedência para reservas
 */
export const MAX_ADVANCE_DAYS = 2;

/**
 * Durações predefinidas disponíveis para seleção (em horas)
 */
export const AVAILABLE_DURATIONS = [
  { value: "0.5", label: "30 min", popular: false },
  { value: "1", label: "1h", popular: false },
  { value: "2", label: "2h", popular: true },
  { value: "3", label: "3h", popular: true },
  { value: "4", label: "4h", popular: true },
  { value: "6", label: "6h", popular: false },
  { value: "8", label: "8h", popular: false },
  { value: "12", label: "12h", popular: false },
  { value: "24", label: "24h", popular: false },
] as const;

/**
 * Duração padrão selecionada (em horas)
 */
export const DEFAULT_DURATION = "2";

/**
 * Intervalo de atualização automática das reservas (em milissegundos)
 */
export const REFRESH_INTERVAL_MS = 5000;

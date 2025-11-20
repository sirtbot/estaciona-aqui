-- Script de criação da tabela de reservas para o EstacionaAqui
-- Este script deve ser executado no Supabase SQL Editor

-- Criar tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_reservations_spot_id ON reservations(spot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_end_time ON reservations(end_time);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time ON reservations(start_time);

-- Criar índice composto para verificação de conflitos
CREATE INDEX IF NOT EXISTS idx_reservations_spot_time ON reservations(spot_id, start_time, end_time);

-- Habilitar Row Level Security (RLS)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de reservas"
  ON reservations
  FOR SELECT
  USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir criação pública de reservas"
  ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Permitir atualização pública de reservas"
  ON reservations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir exclusão pública
CREATE POLICY "Permitir exclusão pública de reservas"
  ON reservations
  FOR DELETE
  USING (true);

-- Comentários na tabela e colunas
COMMENT ON TABLE reservations IS 'Tabela de reservas de vagas de estacionamento';
COMMENT ON COLUMN reservations.id IS 'Identificador único da reserva (formato: res-{timestamp})';
COMMENT ON COLUMN reservations.spot_id IS 'Identificador da vaga reservada';
COMMENT ON COLUMN reservations.name IS 'Nome completo do condutor';
COMMENT ON COLUMN reservations.license_plate IS 'Matrícula do veículo (em maiúsculas)';
COMMENT ON COLUMN reservations.start_time IS 'Data e hora de início da reserva (UTC)';
COMMENT ON COLUMN reservations.end_time IS 'Data e hora de término da reserva (UTC)';
COMMENT ON COLUMN reservations.created_at IS 'Data e hora de criação do registro';

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://uonkxhaxcyoaiskptxxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmt4aGF4Y3lvYWlza3B0eHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjkyMjEsImV4cCI6MjA3OTIwNTIyMX0.bYXfdI3HR0I1DJ4EoLLggU0FfdHBsASuvmmLtWxV_pw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LocalReservation {
  id: string;
  spotId: string;
  name: string;
  licensePlate: string;
  startTime: string | Date;
  endTime: string | Date;
}

interface SupabaseReservation {
  id: string;
  spot_id: string;
  name: string;
  license_plate: string;
  start_time: string;
  end_time: string;
}

async function migrateReservations() {
  console.log('🚀 Iniciando migração de reservas para Supabase...\n');

  try {
    // Ler arquivo JSON local
    const filePath = join(process.cwd(), 'data', 'reservations.json');
    console.log(`📁 Lendo arquivo: ${filePath}`);

    const fileContent = readFileSync(filePath, 'utf-8');
    const localReservations: LocalReservation[] = JSON.parse(fileContent);

    console.log(`✅ Encontradas ${localReservations.length} reservas no arquivo local\n`);

    if (localReservations.length === 0) {
      console.log('ℹ️  Nenhuma reserva para migrar.');
      return;
    }

    // Filtrar apenas reservas ativas (que ainda não expiraram)
    const now = new Date();
    const activeReservations = localReservations.filter(r => {
      const endTime = new Date(r.endTime);
      return endTime > now;
    });

    console.log(`📊 Reservas ativas: ${activeReservations.length}`);
    console.log(`🗑️  Reservas expiradas (serão ignoradas): ${localReservations.length - activeReservations.length}\n`);

    if (activeReservations.length === 0) {
      console.log('ℹ️  Nenhuma reserva ativa para migrar.');
      return;
    }

    // Converter para formato Supabase (snake_case)
    const supabaseReservations: SupabaseReservation[] = activeReservations.map(r => ({
      id: r.id,
      spot_id: r.spotId,
      name: r.name,
      license_plate: r.licensePlate,
      start_time: new Date(r.startTime).toISOString(),
      end_time: new Date(r.endTime).toISOString(),
    }));

    // Inserir no Supabase
    console.log('💾 Inserindo reservas no Supabase...');

    const { data, error } = await supabase
      .from('reservations')
      .insert(supabaseReservations)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir reservas:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} reservas migradas com sucesso!\n`);

    // Exibir resumo
    console.log('📋 Resumo das reservas migradas:');
    supabaseReservations.forEach((r, index) => {
      console.log(`   ${index + 1}. Vaga ${r.spot_id} - ${r.name} (${r.license_plate})`);
      console.log(`      Início: ${new Date(r.start_time).toLocaleString('pt-BR')}`);
      console.log(`      Fim: ${new Date(r.end_time).toLocaleString('pt-BR')}`);
    });

    console.log('\n✨ Migração concluída com sucesso!');
    console.log('💡 Dica: Você pode verificar as reservas no Supabase Dashboard > Table Editor > reservations');

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('❌ Erro: Arquivo data/reservations.json não encontrado.');
      console.log('ℹ️  Execute este script a partir da raiz do projeto.');
    } else if (error.code === '23505') {
      console.error('❌ Erro: Algumas reservas já existem no banco de dados (ID duplicado).');
      console.log('ℹ️  Tente limpar a tabela antes de migrar novamente.');
    } else {
      console.error('❌ Erro na migração:', error.message || error);
    }
    process.exit(1);
  }
}

// Executar migração
migrateReservations();

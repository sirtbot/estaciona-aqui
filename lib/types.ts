export interface Reservation {
  id: string;
  spotId: string;
  name: string;
  licensePlate: string;
  startTime: string | Date;
  endTime: string | Date;
}

// Tipo para o banco de dados Supabase (snake_case)
export interface ReservationDB {
  id: string;
  spot_id: string;
  name: string;
  license_plate: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

export interface ParkingSpot {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  spots: ParkingSpot[];
  width: number;
  height: number;
}

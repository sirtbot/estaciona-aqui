export interface Reservation {
  id: string;
  spotId: string;
  name: string;
  licensePlate: string;
  startTime: string | Date;
  endTime: string | Date;
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

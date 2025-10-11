import { ParkingLot } from "./types";

// Configuração do estacionamento com layout 2D
export const defaultParkingLot: ParkingLot = {
  id: "main-lot",
  name: "Estacionamento Principal",
  width: 800,
  height: 600,
  spots: [
    // Linha 1 - vagas superiores (horizontais)
    { id: "spot-1", number: 1, x: 50, y: 50, width: 100, height: 60 },
    { id: "spot-2", number: 2, x: 170, y: 50, width: 100, height: 60 },
    { id: "spot-3", number: 3, x: 290, y: 50, width: 100, height: 60 },
    { id: "spot-4", number: 4, x: 410, y: 50, width: 100, height: 60 },
    { id: "spot-5", number: 5, x: 530, y: 50, width: 100, height: 60 },
    { id: "spot-6", number: 6, x: 650, y: 50, width: 100, height: 60 },

    // Linha 2 - vagas do meio (horizontais)
    { id: "spot-7", number: 7, x: 50, y: 180, width: 100, height: 60 },
    { id: "spot-8", number: 8, x: 170, y: 180, width: 100, height: 60 },
    { id: "spot-9", number: 9, x: 290, y: 180, width: 100, height: 60 },
    { id: "spot-10", number: 10, x: 410, y: 180, width: 100, height: 60 },
    { id: "spot-11", number: 11, x: 530, y: 180, width: 100, height: 60 },
    { id: "spot-12", number: 12, x: 650, y: 180, width: 100, height: 60 },

    // Linha 3 - vagas centrais (horizontais)
    { id: "spot-13", number: 13, x: 50, y: 310, width: 100, height: 60 },
    { id: "spot-14", number: 14, x: 170, y: 310, width: 100, height: 60 },
    { id: "spot-15", number: 15, x: 290, y: 310, width: 100, height: 60 },
    { id: "spot-16", number: 16, x: 410, y: 310, width: 100, height: 60 },
    { id: "spot-17", number: 17, x: 530, y: 310, width: 100, height: 60 },
    { id: "spot-18", number: 18, x: 650, y: 310, width: 100, height: 60 },

    // Linha 4 - vagas inferiores (horizontais)
    { id: "spot-19", number: 19, x: 50, y: 440, width: 100, height: 60 },
    { id: "spot-20", number: 20, x: 170, y: 440, width: 100, height: 60 },
    { id: "spot-21", number: 21, x: 290, y: 440, width: 100, height: 60 },
    { id: "spot-22", number: 22, x: 410, y: 440, width: 100, height: 60 },
    { id: "spot-23", number: 23, x: 530, y: 440, width: 100, height: 60 },
    { id: "spot-24", number: 24, x: 650, y: 440, width: 100, height: 60 },
  ],
};

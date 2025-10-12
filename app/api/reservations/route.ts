import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Reservation } from "@/lib/types";

const RESERVATIONS_FILE = path.join(process.cwd(), "data", "reservations.json");

export const dynamic = "force-dynamic";

async function getReservations(): Promise<Reservation[]> {
  try {
    const data = await fs.readFile(RESERVATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Se o arquivo não existe, retorna array vazio
    return [];
  }
}

async function saveReservations(reservations: Reservation[]): Promise<void> {
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
}

// GET - Obter todas as reservas
export async function GET() {
  try {
    const reservations = await getReservations();

    // Remover reservas expiradas
    const now = new Date();
    const activeReservations = reservations.filter(
      (r: Reservation) => new Date(r.endTime) > now,
    );

    // Se houve mudança, salvar
    if (activeReservations.length !== reservations.length) {
      await saveReservations(activeReservations);
    }

    return NextResponse.json(activeReservations);
  } catch {
    return NextResponse.json(
      { error: "Erro ao obter reservas" },
      { status: 500 },
    );
  }
}

// POST - Criar nova reserva
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spotId, name, licensePlate, startTime, endTime } = body;

    // Validação
    if (!spotId || !name || !licensePlate || !startTime || !endTime) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const reservations = await getReservations();

    // Verificar conflito
    const hasConflict = reservations.some(
      (r: Reservation) =>
        r.spotId === spotId &&
        ((new Date(startTime) >= new Date(r.startTime) &&
          new Date(startTime) < new Date(r.endTime)) ||
          (new Date(endTime) > new Date(r.startTime) &&
            new Date(endTime) <= new Date(r.endTime)) ||
          (new Date(startTime) <= new Date(r.startTime) &&
            new Date(endTime) >= new Date(r.endTime))),
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "Já existe uma reserva para este período" },
        { status: 409 },
      );
    }

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      spotId,
      name,
      licensePlate: licensePlate.toUpperCase(),
      startTime,
      endTime,
    };

    reservations.push(newReservation);
    await saveReservations(reservations);

    return NextResponse.json(newReservation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
      { status: 500 },
    );
  }
}

// DELETE - Cancelar reserva
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da reserva não fornecido" },
        { status: 400 },
      );
    }

    const reservations = await getReservations();
    const filtered = reservations.filter((r: Reservation) => r.id !== id);

    if (filtered.length === reservations.length) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 },
      );
    }

    await saveReservations(filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao cancelar reserva" },
      { status: 500 },
    );
  }
}

// PATCH - Prolongar reserva ou fazer checkout antecipado
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id) {
      return NextResponse.json(
        { error: "ID da reserva não fornecido" },
        { status: 400 },
      );
    }

    const reservations = await getReservations();
    const reservationIndex = reservations.findIndex((r: Reservation) => r.id === id);

    if (reservationIndex === -1) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 },
      );
    }

    const reservation = reservations[reservationIndex];

    // Ação: Checkout antecipado (já saí)
    if (action === "checkout") {
      const now = new Date();

      // Verificar se a reserva está ativa
      if (new Date(reservation.startTime) > now) {
        return NextResponse.json(
          { error: "A reserva ainda não começou" },
          { status: 400 },
        );
      }

      if (new Date(reservation.endTime) <= now) {
        return NextResponse.json(
          { error: "A reserva já terminou" },
          { status: 400 },
        );
      }

      // Atualizar endTime para agora
      reservation.endTime = now.toISOString();
      reservations[reservationIndex] = reservation;
      await saveReservations(reservations);

      return NextResponse.json(reservation);
    }

    // Ação: Prolongar reserva
    if (action === "extend") {
      const body = await request.json();
      const { additionalHours } = body;

      if (!additionalHours || additionalHours <= 0) {
        return NextResponse.json(
          { error: "Tempo adicional inválido" },
          { status: 400 },
        );
      }

      const now = new Date();

      // Verificar se a reserva está ativa
      if (new Date(reservation.startTime) > now) {
        return NextResponse.json(
          { error: "A reserva ainda não começou" },
          { status: 400 },
        );
      }

      if (new Date(reservation.endTime) <= now) {
        return NextResponse.json(
          { error: "A reserva já terminou" },
          { status: 400 },
        );
      }

      // Calcular novo endTime
      const currentEndTime = new Date(reservation.endTime);
      const newEndTime = new Date(
        currentEndTime.getTime() + additionalHours * 60 * 60 * 1000,
      );

      // Verificar conflito com outras reservas na mesma vaga
      const hasConflict = reservations.some(
        (r: Reservation) =>
          r.id !== id &&
          r.spotId === reservation.spotId &&
          new Date(r.startTime) < newEndTime &&
          new Date(r.endTime) > currentEndTime,
      );

      if (hasConflict) {
        return NextResponse.json(
          { error: "Já existe outra reserva após este período" },
          { status: 409 },
        );
      }

      // Atualizar endTime
      reservation.endTime = newEndTime.toISOString();
      reservations[reservationIndex] = reservation;
      await saveReservations(reservations);

      return NextResponse.json(reservation);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar reserva" },
      { status: 500 },
    );
  }
}

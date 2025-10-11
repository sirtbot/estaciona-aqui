import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RESERVATIONS_FILE = path.join(process.cwd(), "data", "reservations.json");

export const dynamic = "force-dynamic";

async function getReservations() {
  try {
    const data = await fs.readFile(RESERVATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existe, retorna array vazio
    return [];
  }
}

async function saveReservations(reservations: any[]) {
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
}

// GET - Obter todas as reservas
export async function GET() {
  try {
    const reservations = await getReservations();

    // Remover reservas expiradas
    const now = new Date();
    const activeReservations = reservations.filter(
      (r: any) => new Date(r.endTime) > now
    );

    // Se houve mudança, salvar
    if (activeReservations.length !== reservations.length) {
      await saveReservations(activeReservations);
    }

    return NextResponse.json(activeReservations);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao obter reservas" },
      { status: 500 }
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
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const reservations = await getReservations();

    // Verificar conflito
    const hasConflict = reservations.some(
      (r: any) =>
        r.spotId === spotId &&
        ((new Date(startTime) >= new Date(r.startTime) &&
          new Date(startTime) < new Date(r.endTime)) ||
          (new Date(endTime) > new Date(r.startTime) &&
            new Date(endTime) <= new Date(r.endTime)) ||
          (new Date(startTime) <= new Date(r.startTime) &&
            new Date(endTime) >= new Date(r.endTime)))
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "Já existe uma reserva para este período" },
        { status: 409 }
      );
    }

    const newReservation = {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const reservations = await getReservations();
    const filtered = reservations.filter((r: any) => r.id !== id);

    if (filtered.length === reservations.length) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      );
    }

    await saveReservations(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao cancelar reserva" },
      { status: 500 }
    );
  }
}

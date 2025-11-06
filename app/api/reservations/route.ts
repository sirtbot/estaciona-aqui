import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Reservation, ReservationDB } from "@/lib/types";

export const dynamic = "force-dynamic";

// Converter do formato DB (snake_case) para formato App (camelCase)
function dbToReservation(db: ReservationDB): Reservation {
  return {
    id: db.id,
    spotId: db.spot_id,
    name: db.name,
    licensePlate: db.license_plate,
    startTime: db.start_time,
    endTime: db.end_time,
  };
}

// Converter do formato App (camelCase) para formato DB (snake_case)
function reservationToDb(
  reservation: Partial<Reservation>,
): Partial<ReservationDB> {
  return {
    id: reservation.id,
    spot_id: reservation.spotId,
    name: reservation.name,
    license_plate: reservation.licensePlate,
    start_time:
      typeof reservation.startTime === "string"
        ? reservation.startTime
        : reservation.startTime?.toISOString(),
    end_time:
      typeof reservation.endTime === "string"
        ? reservation.endTime
        : reservation.endTime?.toISOString(),
  };
}

// GET - Obter todas as reservas ativas
export async function GET() {
  try {
    // Buscar apenas reservas que ainda não expiraram
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .gte("end_time", new Date().toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Erro ao buscar reservas no Supabase:", error);
      return NextResponse.json(
        { error: "Erro ao obter reservas" },
        { status: 500 },
      );
    }

    const reservations = (data || []).map(dbToReservation);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Erro no GET /api/reservations:", error);
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

    // Verificar conflito de horário para a mesma vaga
    const { data: conflictingReservations, error: conflictError } =
      await supabase
        .from("reservations")
        .select("*")
        .eq("spot_id", spotId)
        .gte("end_time", new Date().toISOString());

    if (conflictError) {
      console.error("Erro ao verificar conflitos:", conflictError);
      return NextResponse.json(
        { error: "Erro ao verificar disponibilidade" },
        { status: 500 },
      );
    }

    // Verificar se há conflito de horário
    const start = new Date(startTime);
    const end = new Date(endTime);

    const hasConflict = (conflictingReservations || []).some(
      (r: ReservationDB) => {
        const rStart = new Date(r.start_time);
        const rEnd = new Date(r.end_time);

        return (
          (start >= rStart && start < rEnd) ||
          (end > rStart && end <= rEnd) ||
          (start <= rStart && end >= rEnd)
        );
      },
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "Já existe uma reserva para este período" },
        { status: 409 },
      );
    }

    // Criar nova reserva
    const newReservationDb: ReservationDB = {
      id: `res-${Date.now()}`,
      spot_id: spotId,
      name,
      license_plate: licensePlate.toUpperCase(),
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
    };

    const { data, error } = await supabase
      .from("reservations")
      .insert([newReservationDb])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar reserva no Supabase:", error);
      return NextResponse.json(
        { error: "Erro ao criar reserva" },
        { status: 500 },
      );
    }

    return NextResponse.json(dbToReservation(data), { status: 201 });
  } catch (error) {
    console.error("Erro no POST /api/reservations:", error);
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

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar reserva no Supabase:", error);
      return NextResponse.json(
        { error: "Erro ao cancelar reserva" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no DELETE /api/reservations:", error);
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

    // Buscar reserva
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      console.error("Erro ao buscar reserva:", fetchError);
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 },
      );
    }

    const now = new Date();
    const startTime = new Date(reservation.start_time);
    const endTime = new Date(reservation.end_time);

    // Ação: Checkout antecipado (já saí)
    if (action === "checkout") {
      // Verificar se a reserva está ativa
      if (startTime > now) {
        return NextResponse.json(
          { error: "A reserva ainda não começou" },
          { status: 400 },
        );
      }

      if (endTime <= now) {
        return NextResponse.json(
          { error: "A reserva já terminou" },
          { status: 400 },
        );
      }

      // Atualizar endTime para agora
      const { data, error } = await supabase
        .from("reservations")
        .update({ end_time: now.toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao fazer checkout:", error);
        return NextResponse.json(
          { error: "Erro ao fazer checkout" },
          { status: 500 },
        );
      }

      return NextResponse.json(dbToReservation(data));
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

      // Verificar se a reserva está ativa
      if (startTime > now) {
        return NextResponse.json(
          { error: "A reserva ainda não começou" },
          { status: 400 },
        );
      }

      if (endTime <= now) {
        return NextResponse.json(
          { error: "A reserva já terminou" },
          { status: 400 },
        );
      }

      // Calcular novo endTime
      const newEndTime = new Date(
        endTime.getTime() + additionalHours * 60 * 60 * 1000,
      );

      // Verificar conflito com outras reservas na mesma vaga
      const { data: conflictingReservations, error: conflictError } =
        await supabase
          .from("reservations")
          .select("*")
          .eq("spot_id", reservation.spot_id)
          .neq("id", id)
          .gte("end_time", endTime.toISOString())
          .lte("start_time", newEndTime.toISOString());

      if (conflictError) {
        console.error("Erro ao verificar conflitos:", conflictError);
        return NextResponse.json(
          { error: "Erro ao verificar disponibilidade" },
          { status: 500 },
        );
      }

      if (conflictingReservations && conflictingReservations.length > 0) {
        return NextResponse.json(
          { error: "Já existe outra reserva após este período" },
          { status: 409 },
        );
      }

      // Atualizar endTime
      const { data, error } = await supabase
        .from("reservations")
        .update({ end_time: newEndTime.toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao prolongar reserva:", error);
        return NextResponse.json(
          { error: "Erro ao prolongar reserva" },
          { status: 500 },
        );
      }

      return NextResponse.json(dbToReservation(data));
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro no PATCH /api/reservations:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar reserva" },
      { status: 500 },
    );
  }
}

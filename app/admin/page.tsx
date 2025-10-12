"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Calendar,
  ParkingCircle,
  Settings,
  TrendingUp,
  Users,
  Clock,
  Car,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  BarChart3,
  Download,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { defaultParkingLot } from "@/lib/parking-data";

export default function AdminPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Carregar reservas
  const loadReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      if (!response.ok) throw new Error("Erro ao carregar reservas");

      const data = await response.json();
      const withDates = data.map((r: Reservation) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
      }));

      setReservations(withDates);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      toast.error("Erro ao carregar reservas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Estatísticas
  const now = new Date();
  const activeReservations = reservations.filter(
    (r) => new Date(r.startTime) <= now && new Date(r.endTime) > now,
  );
  const upcomingReservations = reservations.filter(
    (r) => new Date(r.startTime) > now,
  );
  const completedReservations = reservations.filter(
    (r) => new Date(r.endTime) <= now,
  );
  const totalSpots = defaultParkingLot.spots.length;
  const occupiedSpots = activeReservations.length;
  const availableSpots = totalSpots - occupiedSpots;
  const occupancyRate = ((occupiedSpots / totalSpots) * 100).toFixed(1);

  // Cancelar reserva
  const handleDeleteReservation = async () => {
    if (!selectedReservationId) return;

    try {
      const response = await fetch(
        `/api/reservations/${selectedReservationId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Erro ao cancelar reserva");

      setReservations((prev) =>
        prev.filter((r) => r.id !== selectedReservationId),
      );
      toast.success("Reserva cancelada com sucesso");
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast.error("Erro ao cancelar reserva");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReservationId(null);
    }
  };

  // Exportar relatório
  const exportReport = () => {
    const csv = [
      ["ID", "Nome", "Matrícula", "Vaga", "Início", "Término", "Status"],
      ...reservations.map((r) => {
        const spot = defaultParkingLot.spots.find((s) => s.id === r.spotId);
        const status =
          new Date(r.startTime) <= now && new Date(r.endTime) > now
            ? "Ativa"
            : new Date(r.startTime) > now
              ? "Agendada"
              : "Concluída";
        return [
          r.id,
          r.name,
          r.licensePlate,
          spot?.number || "",
          new Date(r.startTime).toLocaleString("pt-PT"),
          new Date(r.endTime).toLocaleString("pt-PT"),
          status,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Relatório exportado com sucesso");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Carregando painel administrativo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-md opacity-30"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gestão completa do estacionamento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-slate-800"
                title="Voltar para página principal"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReservations}
                className="h-9 w-9 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="spots" className="gap-2">
              <ParkingCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Vagas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análises</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Total de Vagas
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {totalSpots}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <ParkingCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Vagas Livres
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {availableSpots}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Vagas Ocupadas
                    </p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {occupiedSpots}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                      Taxa de Ocupação
                    </p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {occupancyRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Reservas Ativas
                </h3>
                <div className="space-y-3">
                  {activeReservations.slice(0, 5).map((reservation) => {
                    const spot = defaultParkingLot.spots.find(
                      (s) => s.id === reservation.spotId,
                    );
                    return (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold">
                            {spot?.number}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {reservation.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {reservation.licensePlate}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive">Em uso</Badge>
                      </div>
                    );
                  })}
                  {activeReservations.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma reserva ativa no momento
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Próximas Reservas
                </h3>
                <div className="space-y-3">
                  {upcomingReservations.slice(0, 5).map((reservation) => {
                    const spot = defaultParkingLot.spots.find(
                      (s) => s.id === reservation.spotId,
                    );
                    return (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-400 text-white rounded-lg flex items-center justify-center font-bold">
                            {spot?.number}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {reservation.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(reservation.startTime).toLocaleString(
                                "pt-PT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Agendada</Badge>
                      </div>
                    );
                  })}
                  {upcomingReservations.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma reserva agendada
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Todas as Reservas ({reservations.length})
                </h3>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {activeReservations.length} Ativas
                  </Badge>
                  <Badge variant="outline">
                    {upcomingReservations.length} Agendadas
                  </Badge>
                  <Badge variant="outline">
                    {completedReservations.length} Concluídas
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaga</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Término</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations
                      .sort(
                        (a, b) =>
                          new Date(b.startTime).getTime() -
                          new Date(a.startTime).getTime(),
                      )
                      .map((reservation) => {
                        const spot = defaultParkingLot.spots.find(
                          (s) => s.id === reservation.spotId,
                        );
                        const isActive =
                          new Date(reservation.startTime) <= now &&
                          new Date(reservation.endTime) > now;
                        const isUpcoming =
                          new Date(reservation.startTime) > now;
                        const isCompleted =
                          new Date(reservation.endTime) <= now;

                        return (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                  {spot?.number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {reservation.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {reservation.licensePlate}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(reservation.startTime).toLocaleString(
                                "pt-PT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(reservation.endTime).toLocaleString(
                                "pt-PT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </TableCell>
                            <TableCell>
                              {isActive && (
                                <Badge variant="destructive">Ativa</Badge>
                              )}
                              {isUpcoming && (
                                <Badge variant="secondary">Agendada</Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="outline">Concluída</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservationId(reservation.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Spots Tab */}
          <TabsContent value="spots" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ParkingCircle className="h-5 w-5 text-blue-500" />
                Gestão de Vagas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {defaultParkingLot.spots.map((spot) => {
                  const spotReservation = activeReservations.find(
                    (r) => r.spotId === spot.id,
                  );
                  const isOccupied = !!spotReservation;

                  return (
                    <Card
                      key={spot.id}
                      className={`p-4 text-center ${
                        isOccupied
                          ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-300 dark:border-red-800"
                          : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-800"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-white mb-2 ${
                          isOccupied ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {spot.number}
                      </div>
                      <p className="text-xs font-semibold mb-1">
                        Vaga {spot.number}
                      </p>
                      {isOccupied ? (
                        <div>
                          <Badge variant="destructive" className="text-xs mb-1">
                            Ocupada
                          </Badge>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {spotReservation?.licensePlate}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Livre
                        </Badge>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Estatísticas Gerais
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">
                      Total de Reservas
                    </span>
                    <span className="text-lg font-bold">
                      {reservations.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">Reservas Ativas</span>
                    <span className="text-lg font-bold text-red-600">
                      {activeReservations.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">
                      Reservas Agendadas
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {upcomingReservations.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">
                      Reservas Concluídas
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {completedReservations.length}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Top Utilizadores
                </h3>
                <div className="space-y-3">
                  {Object.entries(
                    reservations.reduce(
                      (acc, r) => {
                        acc[r.name] = (acc[r.name] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {name.charAt(0)}
                          </div>
                          <span className="font-semibold">{name}</span>
                        </div>
                        <Badge>{count} reservas</Badge>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Cancelar Reserva
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter reserva</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReservation}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

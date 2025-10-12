"use client";

import Link from "next/link";
import { defaultParkingLot } from "@/lib/parking-data";
import { Card } from "@/components/ui/card";
import { ArrowRight, Circle } from "lucide-react";

export default function LuzIndexPage() {
  const spots = defaultParkingLot.spots.sort((a, b) => a.number - b.number);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            Sistema de Luzes
          </h1>
          <p className="text-xl text-slate-300">
            Selecione uma vaga para visualizar o status em tempo real
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/luz/${spot.number}`}
              className="group"
            >
              <Card className="p-6 bg-slate-800/50 border-2 border-slate-700 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Circle className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white mb-1">
                      {spot.number}
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors flex items-center gap-1 justify-center">
                      Ver status
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-lg font-semibold"
          >
            ← Voltar para o sistema de reservas
          </Link>
        </div>

        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            💡 Como funciona
          </h2>
          <div className="space-y-3 text-slate-300">
            <p>
              • <span className="font-semibold text-green-400">Verde</span> = Vaga
              livre
            </p>
            <p>
              • <span className="font-semibold text-red-400">Vermelho</span> = Vaga
              ocupada
            </p>
            <p>
              • O timer mostra quanto tempo falta para a reserva terminar
            </p>
            <p>• A página atualiza automaticamente a cada 2 segundos</p>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>
            URL formato: <code className="bg-slate-700 px-2 py-1 rounded text-slate-300">/luz/[número]</code>
          </p>
          <p className="mt-2">
            Exemplo: <code className="bg-slate-700 px-2 py-1 rounded text-blue-400">/luz/1</code> ou <code className="bg-slate-700 px-2 py-1 rounded text-blue-400">/luz/15</code>
          </p>
        </div>
      </div>
    </div>
  );
}

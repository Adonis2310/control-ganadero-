import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { Animal, AnimalRef } from "@/features/ganado/types";
import {
  calcularEdad,
  formatearFecha,
  formatearPeso,
} from "@/features/ganado/utils/animal.utils";

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function CampoPadre({ label, padre }: { label: string; padre: AnimalRef | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {padre ? (
        <Link href={`/ganado/${padre.id}`} className="mt-1 block text-sm text-primary hover:underline">
          {padre.identificador}
          {padre.nombre ? ` — ${padre.nombre}` : ""}
        </Link>
      ) : (
        <p className="mt-1 text-sm">Sin registrar</p>
      )}
    </div>
  );
}

export function AnimalInfoPanel({ animal }: { animal: Animal }) {
  return (
    <Card>
      <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Campo label="Fecha de nacimiento" value={formatearFecha(animal.fecha_nacimiento)} />
        <Campo label="Edad" value={calcularEdad(animal.fecha_nacimiento)} />
        <Campo label="Color" value={animal.color || "Sin registrar"} />
        <Campo label="Peso actual" value={formatearPeso(animal.peso_actual_kg)} />
        <Campo label="Peso al registrar" value={formatearPeso(animal.peso_inicial_kg)} />
        <Campo label="Fecha de registro" value={formatearFecha(animal.created_at.split("T")[0])} />
        <CampoPadre label="Padre" padre={animal.padre} />
        <CampoPadre label="Madre" padre={animal.madre} />

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-medium text-muted-foreground">Observaciones</p>
          <p className="mt-1 text-sm whitespace-pre-wrap">
            {animal.observaciones || "Sin observaciones registradas."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

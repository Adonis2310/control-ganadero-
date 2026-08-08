import { Card, CardContent } from "@/components/ui/card";
import type { Animal } from "@/features/ganado/types";
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

export function AnimalInfoPanel({ animal }: { animal: Animal }) {
  const padreLabel = animal.padre
    ? `${animal.padre.identificador}${animal.padre.nombre ? ` — ${animal.padre.nombre}` : ""}`
    : "Sin registrar";
  const madreLabel = animal.madre
    ? `${animal.madre.identificador}${animal.madre.nombre ? ` — ${animal.madre.nombre}` : ""}`
    : "Sin registrar";

  return (
    <Card>
      <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Campo label="Fecha de nacimiento" value={formatearFecha(animal.fecha_nacimiento)} />
        <Campo label="Edad" value={calcularEdad(animal.fecha_nacimiento)} />
        <Campo label="Color" value={animal.color || "Sin registrar"} />
        <Campo label="Peso actual" value={formatearPeso(animal.peso_actual_kg)} />
        <Campo label="Peso al registrar" value={formatearPeso(animal.peso_inicial_kg)} />
        <Campo label="Fecha de registro" value={formatearFecha(animal.created_at.split("T")[0])} />
        <Campo label="Padre" value={padreLabel} />
        <Campo label="Madre" value={madreLabel} />

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

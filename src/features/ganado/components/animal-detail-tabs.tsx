import { Activity } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalInfoPanel } from "@/features/ganado/components/animal-info-panel";
import { HealthSection } from "@/features/ganado/components/health-section";
import { PesoSection } from "@/features/ganado/components/peso-section";
import type {
  Animal,
  DesparasitacionRow,
  EnfermedadRow,
  PesoRow,
  TratamientoConEnfermedad,
  VacunaRow,
} from "@/features/ganado/types";

function ProximamentePanel({
  icon: Icon,
  titulo,
}: {
  icon: typeof Activity;
  titulo: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{titulo}</p>
        <p className="text-sm text-muted-foreground">
          Este módulo estará disponible en una fase posterior.
        </p>
      </div>
    </div>
  );
}

export function AnimalDetailTabs({
  animal,
  pesos,
  vacunas,
  desparasitaciones,
  enfermedades,
  tratamientos,
}: {
  animal: Animal;
  pesos: PesoRow[];
  vacunas: VacunaRow[];
  desparasitaciones: DesparasitacionRow[];
  enfermedades: EnfermedadRow[];
  tratamientos: TratamientoConEnfermedad[];
}) {
  return (
    <Tabs defaultValue="informacion">
      <TabsList>
        <TabsTrigger value="informacion">Información</TabsTrigger>
        <TabsTrigger value="peso">Peso</TabsTrigger>
        <TabsTrigger value="salud">Salud</TabsTrigger>
        <TabsTrigger value="reproduccion">Reproducción</TabsTrigger>
      </TabsList>

      <TabsContent value="informacion" className="mt-4">
        <AnimalInfoPanel animal={animal} />
      </TabsContent>
      <TabsContent value="peso" className="mt-4">
        <PesoSection animalId={animal.id} pesosIniciales={pesos} />
      </TabsContent>
      <TabsContent value="salud" className="mt-4">
        <HealthSection
          animalId={animal.id}
          vacunasIniciales={vacunas}
          desparasitacionesIniciales={desparasitaciones}
          enfermedadesIniciales={enfermedades}
          tratamientosIniciales={tratamientos}
        />
      </TabsContent>
      <TabsContent value="reproduccion" className="mt-4">
        <ProximamentePanel icon={Activity} titulo="Reproducción" />
      </TabsContent>
    </Tabs>
  );
}

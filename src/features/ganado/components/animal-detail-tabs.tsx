import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalInfoPanel } from "@/features/ganado/components/animal-info-panel";
import { HealthSection } from "@/features/ganado/components/health-section";
import { PesoSection } from "@/features/ganado/components/peso-section";
import { ReproduccionSection } from "@/features/ganado/components/reproduccion-section";
import type {
  Animal,
  CriaRef,
  DesparasitacionRow,
  EnfermedadRow,
  EventoReproductivoRow,
  GestacionRow,
  PesoRow,
  Raza,
  TratamientoConEnfermedad,
  VacunaRow,
} from "@/features/ganado/types";

export function AnimalDetailTabs({
  animal,
  fincaId,
  razas,
  pesos,
  vacunas,
  desparasitaciones,
  enfermedades,
  tratamientos,
  eventosReproductivos,
  gestaciones,
  eventosComoMacho,
  crias,
}: {
  animal: Animal;
  fincaId: string;
  razas: Raza[];
  pesos: PesoRow[];
  vacunas: VacunaRow[];
  desparasitaciones: DesparasitacionRow[];
  enfermedades: EnfermedadRow[];
  tratamientos: TratamientoConEnfermedad[];
  eventosReproductivos: EventoReproductivoRow[];
  gestaciones: GestacionRow[];
  eventosComoMacho: EventoReproductivoRow[];
  crias: CriaRef[];
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
        <ReproduccionSection
          animalId={animal.id}
          sexo={animal.sexo}
          fincaId={fincaId}
          razas={razas}
          eventosIniciales={eventosReproductivos}
          gestacionesIniciales={gestaciones}
          eventosComoMachoIniciales={eventosComoMacho}
          criasIniciales={crias}
        />
      </TabsContent>
    </Tabs>
  );
}

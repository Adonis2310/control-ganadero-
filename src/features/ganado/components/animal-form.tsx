"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimalParentSelect } from "@/features/ganado/components/animal-parent-select";
import { AnimalPhotoUpload } from "@/features/ganado/components/animal-photo-upload";
import {
  ESTADO_OPTIONS,
  SEXO_OPTIONS,
  type Animal,
  type AnimalRef,
  type Raza,
} from "@/features/ganado/types";
import {
  buildAnimalInsertPayload,
  buildAnimalUpdatePayload,
} from "@/features/ganado/utils/animal-mapper";
import {
  EMPTY_ANIMAL_FORM,
  validateAnimalForm,
  type AnimalFormErrors,
  type AnimalFormValues,
} from "@/features/ganado/validations/animal.schema";
import { createClient } from "@/lib/supabase/client";
import { animalesService, UNIQUE_VIOLATION_CODE } from "@/services/animales.service";
import { pesosService } from "@/services/pesos.service";
import { animalPhotoStorage } from "@/services/storage.service";

interface AnimalFormProps {
  mode: "create" | "edit";
  fincaId: string;
  razas: Raza[];
  animal?: Animal;
}

function toFormValues(animal?: Animal): AnimalFormValues {
  if (!animal) return EMPTY_ANIMAL_FORM;
  return {
    identificador: animal.identificador,
    nombre: animal.nombre ?? "",
    sexo: animal.sexo,
    raza_id: animal.raza_id ?? "",
    fecha_nacimiento: animal.fecha_nacimiento ?? "",
    color: animal.color ?? "",
    peso_kg: animal.peso_actual_kg?.toString() ?? "",
    estado: animal.estado,
    padre_id: animal.padre_id ?? "",
    madre_id: animal.madre_id ?? "",
    observaciones: animal.observaciones ?? "",
  };
}

export function AnimalForm({ mode, fincaId, razas, animal }: AnimalFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AnimalFormValues>(() => toFormValues(animal));
  const [errors, setErrors] = useState<AnimalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(
    animal?.foto_url ?? null,
  );
  const [removerFotoExistente, setRemoverFotoExistente] = useState(false);

  const [machos, setMachos] = useState<AnimalRef[]>([]);
  const [hembras, setHembras] = useState<AnimalRef[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      animalesService.listForParentSelect(supabase, fincaId, "macho", animal?.id),
      animalesService.listForParentSelect(supabase, fincaId, "hembra", animal?.id),
    ])
      .then(([machosData, hembrasData]) => {
        setMachos(machosData);
        setHembras(hembrasData);
      })
      .catch(() => {
        // Los selects de padre/madre son opcionales; si fallan, el resto del formulario sigue usable.
      });
  }, [fincaId, animal?.id]);

  function updateField<K extends keyof AnimalFormValues>(
    key: K,
    value: AnimalFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSelectFoto(file: File) {
    setFotoFile(file);
    setRemoverFotoExistente(false);
    setFotoPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveFoto() {
    setFotoFile(null);
    setFotoPreviewUrl(null);
    setRemoverFotoExistente(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateAnimalForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados", {
        description: "Hay datos incompletos o inválidos en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const disponible = await animalesService.isIdentificadorDisponible(
        supabase,
        fincaId,
        values.identificador.trim(),
        animal?.id,
      );
      if (!disponible) {
        setErrors((prev) => ({
          ...prev,
          identificador: "Ya existe un animal registrado con este número de arete.",
        }));
        setIsSubmitting(false);
        return;
      }

      if (mode === "create") {
        let fotoUrl: string | null = null;
        if (fotoFile) {
          fotoUrl = await animalPhotoStorage.upload(fotoFile, crypto.randomUUID());
        }
        const payload = buildAnimalInsertPayload(values, fincaId, fotoUrl);
        const created = await animalesService.create(supabase, payload);

        // Si se indicó un peso inicial, siembra el primer registro del
        // historial en `pesos` (fuente de verdad desde la Fase 3) en vez de
        // dejarlo solo como un valor suelto en `animales`.
        if (payload.peso_inicial_kg !== null && payload.peso_inicial_kg !== undefined) {
          await pesosService.create(supabase, {
            animal_id: created.id,
            fecha: new Date().toISOString().split("T")[0],
            peso: payload.peso_inicial_kg,
            observaciones: "Peso inicial de registro.",
          });
        }

        toast.success("Animal registrado", {
          description: `${values.identificador} se agregó correctamente.`,
        });
        router.push(`/ganado/${created.id}`);
        router.refresh();
        return;
      }

      if (!animal) return;

      let fotoUrl = animal.foto_url;
      if (fotoFile) {
        const nuevaUrl = await animalPhotoStorage.upload(fotoFile, animal.id);
        await animalPhotoStorage.remove(animal.foto_url);
        fotoUrl = nuevaUrl;
      } else if (removerFotoExistente) {
        await animalPhotoStorage.remove(animal.foto_url);
        fotoUrl = null;
      }

      const payload = buildAnimalUpdatePayload(values, fotoUrl);
      await animalesService.update(supabase, animal.id, payload);

      toast.success("Cambios guardados", {
        description: `Se actualizó la información de ${values.identificador}.`,
      });
      router.push(`/ganado/${animal.id}`);
      router.refresh();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === UNIQUE_VIOLATION_CODE) {
        setErrors((prev) => ({
          ...prev,
          identificador: "Ya existe un animal registrado con este número de arete.",
        }));
      } else {
        toast.error("No se pudo guardar el animal", {
          description: "Intenta nuevamente en unos segundos.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identificación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <AnimalPhotoUpload
            previewUrl={fotoPreviewUrl}
            nombre={values.nombre ?? ""}
            identificador={values.identificador}
            onSelect={handleSelectFoto}
            onRemove={handleRemoveFoto}
            disabled={isSubmitting}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identificador">Número de arete *</Label>
              <Input
                id="identificador"
                value={values.identificador}
                onChange={(event) => updateField("identificador", event.target.value)}
                placeholder="Ej. 0245"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.identificador)}
              />
              {errors.identificador && (
                <p className="text-xs text-destructive">{errors.identificador}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={values.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                placeholder="Opcional"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sexo *</Label>
            <Select
              value={values.sexo}
              onValueChange={(value) => updateField("sexo", value as AnimalFormValues["sexo"])}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.sexo)}>
                <SelectValue placeholder="Selecciona el sexo">
                  {(current: string | null) =>
                    SEXO_OPTIONS.find((option) => option.value === current)?.label ??
                    "Selecciona el sexo"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SEXO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sexo && <p className="text-xs text-destructive">{errors.sexo}</p>}
          </div>

          <div className="space-y-2">
            <Label>Raza *</Label>
            <Select
              value={values.raza_id}
              onValueChange={(value) => updateField("raza_id", value ?? "")}
              disabled={isSubmitting || razas.length === 0}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.raza_id)}>
                <SelectValue
                  placeholder={
                    razas.length === 0 ? "No hay razas registradas" : "Selecciona una raza"
                  }
                >
                  {(current: string | null) =>
                    razas.find((raza) => raza.id === current)?.nombre ?? "Selecciona una raza"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {razas.map((raza) => (
                  <SelectItem key={raza.id} value={raza.id}>
                    {raza.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.raza_id && <p className="text-xs text-destructive">{errors.raza_id}</p>}
            {razas.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Todavía no hay razas registradas en el sistema.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={values.fecha_nacimiento}
              max={new Date().toISOString().split("T")[0]}
              onChange={(event) => updateField("fecha_nacimiento", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fecha_nacimiento)}
            />
            {errors.fecha_nacimiento && (
              <p className="text-xs text-destructive">{errors.fecha_nacimiento}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={values.color}
              onChange={(event) => updateField("color", event.target.value)}
              placeholder="Ej. Colorado"
              disabled={isSubmitting}
            />
          </div>

          {mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="peso_kg">Peso inicial (kg)</Label>
              <Input
                id="peso_kg"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={values.peso_kg}
                onChange={(event) => updateField("peso_kg", event.target.value)}
                placeholder="Ej. 180"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.peso_kg)}
              />
              {errors.peso_kg && <p className="text-xs text-destructive">{errors.peso_kg}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Peso actual</Label>
              <p className="flex h-8 items-center text-sm text-muted-foreground">
                Se gestiona desde la pestaña &ldquo;Peso&rdquo; de la ficha.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Estado *</Label>
            <Select
              value={values.estado}
              onValueChange={(value) =>
                updateField("estado", value as AnimalFormValues["estado"])
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(current: string | null) =>
                    ESTADO_OPTIONS.find((option) => option.value === current)?.label ?? ""
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información adicional</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Padre</Label>
              <AnimalParentSelect
                value={values.padre_id ?? ""}
                onChange={(value) => updateField("padre_id", value === "ninguno" ? "" : value)}
                options={machos}
                placeholder="Selecciona el padre"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Madre</Label>
              <AnimalParentSelect
                value={values.madre_id ?? ""}
                onChange={(value) => updateField("madre_id", value === "ninguno" ? "" : value)}
                options={hembras}
                placeholder="Selecciona la madre"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={values.observaciones}
              onChange={(event) => updateField("observaciones", event.target.value)}
              placeholder="Notas adicionales sobre el animal..."
              disabled={isSubmitting}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Registrar animal" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

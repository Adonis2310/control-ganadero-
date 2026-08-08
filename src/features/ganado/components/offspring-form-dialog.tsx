"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SEXO_OPTIONS, type Raza } from "@/features/ganado/types";
import {
  emptyCriaForm,
  validateCriaForm,
  type CriaFormErrors,
  type CriaFormValues,
} from "@/features/ganado/validations/cria.schema";
import { createClient } from "@/lib/supabase/client";
import { animalesService, UNIQUE_VIOLATION_CODE } from "@/services/animales.service";
import { pesosService } from "@/services/pesos.service";

interface OffspringFormDialogProps {
  fincaId: string;
  madreId: string;
  padreId: string | null;
  fechaSugerida: string;
  razas: Raza[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function OffspringFormDialog({
  fincaId,
  madreId,
  padreId,
  fechaSugerida,
  razas,
  open,
  onOpenChange,
  onSaved,
}: OffspringFormDialogProps) {
  const [values, setValues] = useState<CriaFormValues>(() => emptyCriaForm(fechaSugerida));
  const [errors, setErrors] = useState<CriaFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criaId, setCriaId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(emptyCriaForm(fechaSugerida));
      setErrors({});
      setCriaId(null);
    }
  }, [open, fechaSugerida]);

  function updateField<K extends keyof CriaFormValues>(key: K, value: CriaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateCriaForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const disponible = await animalesService.isIdentificadorDisponible(
        supabase,
        fincaId,
        values.identificador.trim(),
      );
      if (!disponible) {
        setErrors((prev) => ({
          ...prev,
          identificador: "Ya existe un animal registrado con este número de arete.",
        }));
        setIsSubmitting(false);
        return;
      }

      const pesoNacimiento = values.peso_nacimiento_kg ? Number(values.peso_nacimiento_kg) : null;

      const created = await animalesService.create(supabase, {
        finca_id: fincaId,
        identificador: values.identificador.trim(),
        nombre: values.nombre?.trim() || null,
        sexo: values.sexo,
        raza_id: values.raza_id || null,
        fecha_nacimiento: values.fecha_nacimiento,
        color: values.color?.trim() || null,
        peso_inicial_kg: pesoNacimiento,
        peso_actual_kg: pesoNacimiento,
        estado: "activo",
        madre_id: madreId,
        padre_id: padreId,
        observaciones: values.observaciones?.trim() || null,
      });

      if (pesoNacimiento !== null) {
        await pesosService.create(supabase, {
          animal_id: created.id,
          fecha: values.fecha_nacimiento,
          peso: pesoNacimiento,
          observaciones: "Peso al nacimiento.",
        });
      }

      setCriaId(created.id);
      toast.success("Cría registrada", {
        description: `${values.identificador} se agregó al hato, vinculada como cría.`,
      });
      onSaved();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === UNIQUE_VIOLATION_CODE) {
        setErrors((prev) => ({
          ...prev,
          identificador: "Ya existe un animal registrado con este número de arete.",
        }));
      } else {
        toast.error("No se pudo registrar la cría", {
          description: "Intenta nuevamente en unos segundos.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRegistrarOtra() {
    setValues(emptyCriaForm(fechaSugerida));
    setErrors({});
    setCriaId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {criaId ? (
          <>
            <DialogHeader>
              <DialogTitle>Cría registrada</DialogTitle>
              <DialogDescription>
                Puedes registrar otra cría de este mismo parto o cerrar esta ventana.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href={`/ganado/${criaId}`} />}>
                Ver ficha
              </Button>
              <Button onClick={handleRegistrarOtra}>+ Registrar otra cría</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar cría</DialogTitle>
              <DialogDescription>
                Se creará como un nuevo animal, vinculado automáticamente a la madre
                {padreId ? " y al padre" : ""}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cria-identificador">Número de arete *</Label>
                  <Input
                    id="cria-identificador"
                    value={values.identificador}
                    onChange={(event) => updateField("identificador", event.target.value)}
                    placeholder="Ej. 0512"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.identificador)}
                  />
                  {errors.identificador && (
                    <p className="text-xs text-destructive">{errors.identificador}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cria-nombre">Nombre</Label>
                  <Input
                    id="cria-nombre"
                    value={values.nombre}
                    onChange={(event) => updateField("nombre", event.target.value)}
                    placeholder="Opcional"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sexo *</Label>
                  <Select
                    value={values.sexo || undefined}
                    onValueChange={(value) =>
                      updateField("sexo", (value ?? "") as CriaFormValues["sexo"])
                    }
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
                    value={values.raza_id || undefined}
                    onValueChange={(value) => updateField("raza_id", value ?? "")}
                    disabled={isSubmitting || razas.length === 0}
                  >
                    <SelectTrigger className="w-full" aria-invalid={Boolean(errors.raza_id)}>
                      <SelectValue placeholder="Selecciona una raza">
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
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cria-fecha">Fecha de nacimiento *</Label>
                  <Input
                    id="cria-fecha"
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
                  <Label htmlFor="cria-peso">Peso al nacimiento (kg)</Label>
                  <Input
                    id="cria-peso"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.1"
                    value={values.peso_nacimiento_kg}
                    onChange={(event) => updateField("peso_nacimiento_kg", event.target.value)}
                    placeholder="Ej. 32"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.peso_nacimiento_kg)}
                  />
                  {errors.peso_nacimiento_kg && (
                    <p className="text-xs text-destructive">{errors.peso_nacimiento_kg}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cria-color">Color</Label>
                <Input
                  id="cria-color"
                  value={values.color}
                  onChange={(event) => updateField("color", event.target.value)}
                  placeholder="Ej. Colorado"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cria-observaciones">Observaciones</Label>
                <Textarea
                  id="cria-observaciones"
                  value={values.observaciones}
                  onChange={(event) => updateField("observaciones", event.target.value)}
                  placeholder="Notas adicionales..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Registrar cría
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

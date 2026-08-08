"use client";

import { useEffect, useState } from "react";
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
import { AnimalParentSelect } from "@/features/ganado/components/animal-parent-select";
import { CategoryGastoSelect } from "@/features/finanzas/components/category-gasto-select";
import type { CategoriaGastoRow, GastoConReferencias } from "@/features/finanzas/types";
import {
  EMPTY_GASTO_FORM,
  validateGastoForm,
  type GastoFormErrors,
  type GastoFormValues,
} from "@/features/finanzas/validations/gasto.schema";
import type { AnimalRef } from "@/features/ganado/types";
import type { ProveedorRef } from "@/features/proveedores/types";
import { METODO_PAGO_OPTIONS } from "@/features/ventas/types";
import { createClient } from "@/lib/supabase/client";
import { gastosService } from "@/services/gastos.service";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  gasto?: GastoConReferencias | null;
  categorias: CategoriaGastoRow[];
  proveedores: ProveedorRef[];
  animales: AnimalRef[];
  onSaved: () => void;
}

function toFormValues(gasto?: GastoConReferencias | null): GastoFormValues {
  if (!gasto) return EMPTY_GASTO_FORM;
  return {
    categoria_id: gasto.categoria_id,
    descripcion: gasto.descripcion,
    monto: String(gasto.monto),
    fecha: gasto.fecha,
    metodo_pago: gasto.metodo_pago ?? "",
    proveedor_id: gasto.proveedor_id ?? "",
    animal_id: gasto.animal_id ?? "",
    observaciones: gasto.observaciones ?? "",
  };
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  mode,
  gasto,
  categorias,
  proveedores,
  animales,
  onSaved,
}: ExpenseFormDialogProps) {
  const [values, setValues] = useState<GastoFormValues>(EMPTY_GASTO_FORM);
  const [errors, setErrors] = useState<GastoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El diálogo es una única instancia reutilizada para crear y editar: cada
  // vez que el padre lo abre (con o sin `gasto`) hay que resincronizar el
  // formulario, porque el estado de React no se reinicializa solo al cambiar
  // props en un componente ya montado.
  useEffect(() => {
    if (open) {
      setValues(toFormValues(gasto));
      setErrors({});
    }
  }, [open, gasto]);

  function updateField<K extends keyof GastoFormValues>(key: K, value: GastoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit() {
    const fieldErrors = validateGastoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados", {
        description: "Hay datos incompletos o inválidos en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const payload = {
      categoria_id: values.categoria_id,
      descripcion: values.descripcion.trim(),
      monto: Number(values.monto),
      fecha: values.fecha,
      metodo_pago: values.metodo_pago?.trim() || null,
      proveedor_id: values.proveedor_id?.trim() || null,
      animal_id: values.animal_id?.trim() || null,
      observaciones: values.observaciones?.trim() || null,
    };

    try {
      if (mode === "create") {
        await gastosService.create(supabase, payload);
        toast.success("Gasto registrado");
      } else {
        if (!gasto) return;
        await gastosService.update(supabase, gasto.id, payload);
        toast.success("Cambios guardados");
      }
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el gasto", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nuevo gasto" : "Editar gasto"}</DialogTitle>
          <DialogDescription>Registra un gasto operativo de la finca.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Categoría *</Label>
            <CategoryGastoSelect
              value={values.categoria_id}
              onChange={(value) => updateField("categoria_id", value)}
              categorias={categorias}
              disabled={isSubmitting}
            />
            {errors.categoria_id && <p className="text-xs text-destructive">{errors.categoria_id}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gasto-descripcion">Descripción *</Label>
            <Input
              id="gasto-descripcion"
              value={values.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              placeholder="Ej. Consulta veterinaria"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.descripcion)}
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasto-monto">Monto *</Label>
            <Input
              id="gasto-monto"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={values.monto}
              onChange={(event) => updateField("monto", event.target.value)}
              placeholder="Ej. 35000"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.monto)}
            />
            {errors.monto && <p className="text-xs text-destructive">{errors.monto}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasto-fecha">Fecha *</Label>
            <Input
              id="gasto-fecha"
              type="date"
              value={values.fecha}
              max={new Date().toISOString().split("T")[0]}
              onChange={(event) => updateField("fecha", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fecha)}
            />
            {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
          </div>

          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select
              value={values.metodo_pago || "ninguno"}
              onValueChange={(value) => updateField("metodo_pago", value === "ninguno" ? "" : (value ?? ""))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(current: string | null) => (!current || current === "ninguno" ? "Sin especificar" : current)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Sin especificar</SelectItem>
                {METODO_PAGO_OPTIONS.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select
              value={values.proveedor_id || "ninguno"}
              onValueChange={(value) => updateField("proveedor_id", value === "ninguno" ? "" : (value ?? ""))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(current: string | null) => {
                    if (!current || current === "ninguno") return "Sin registrar";
                    return proveedores.find((p) => p.id === current)?.nombre ?? "Sin registrar";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Sin registrar</SelectItem>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Animal</Label>
            <AnimalParentSelect
              value={values.animal_id ?? ""}
              onChange={(value) => updateField("animal_id", value === "ninguno" ? "" : value)}
              options={animales}
              placeholder="Selecciona un animal"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gasto-observaciones">Observaciones</Label>
            <Textarea
              id="gasto-observaciones"
              value={values.observaciones}
              onChange={(event) => updateField("observaciones", event.target.value)}
              placeholder="Notas adicionales sobre este gasto..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Registrar gasto" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

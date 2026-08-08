"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type { ProductoInventario, TipoMovimiento } from "@/features/inventario/types";
import { formatearCantidad } from "@/features/inventario/utils/inventario.utils";
import {
  EMPTY_AJUSTE_FORM,
  EMPTY_ENTRADA_FORM,
  EMPTY_SALIDA_FORM,
  validateAjusteForm,
  validateEntradaForm,
  validateSalidaForm,
  type AjusteFormValues,
  type EntradaFormValues,
  type SalidaFormValues,
} from "@/features/inventario/validations/movimiento.schema";
import { createClient } from "@/lib/supabase/client";
import { inventarioService, StockInsuficienteError } from "@/services/inventario.service";

const TITULO: Record<TipoMovimiento, string> = {
  entrada: "Registrar entrada",
  salida: "Registrar salida",
  ajuste: "Ajustar stock",
};

const DESCRIPCION: Record<TipoMovimiento, string> = {
  entrada: "Suma unidades al stock del producto (compra, reposición, etc.).",
  salida: "Descuenta unidades del stock del producto.",
  ajuste: "Corrige el stock del sistema para que coincida con el conteo físico real.",
};

interface InventoryMovementFormDialogProps {
  producto: ProductoInventario;
  tipo: TipoMovimiento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function InventoryMovementFormDialog({
  producto,
  tipo,
  open,
  onOpenChange,
  onSaved,
}: InventoryMovementFormDialogProps) {
  const [entrada, setEntrada] = useState<EntradaFormValues>(EMPTY_ENTRADA_FORM);
  const [salida, setSalida] = useState<SalidaFormValues>(EMPTY_SALIDA_FORM);
  const [ajuste, setAjuste] = useState<AjusteFormValues>({
    ...EMPTY_AJUSTE_FORM,
    nueva_cantidad: String(producto.stock_actual),
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEntrada(EMPTY_ENTRADA_FORM);
      setSalida(EMPTY_SALIDA_FORM);
      setAjuste({ ...EMPTY_AJUSTE_FORM, nueva_cantidad: String(producto.stock_actual) });
      setErrors({});
    }
  }, [open, producto.stock_actual]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      if (tipo === "entrada") {
        const fieldErrors = validateEntradaForm(entrada);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
        await inventarioService.registrarEntrada(supabase, producto.id, {
          fecha: entrada.fecha,
          cantidad: Number(entrada.cantidad),
          costoUnitario: entrada.costo_unitario ? Number(entrada.costo_unitario) : null,
          motivo: entrada.motivo.trim(),
          observaciones: entrada.observaciones?.trim() || null,
        });
        toast.success("Entrada registrada", {
          description: `+${entrada.cantidad} ${producto.unidad_medida}.`,
        });
      } else if (tipo === "salida") {
        const fieldErrors = validateSalidaForm(salida);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
        await inventarioService.registrarSalida(supabase, producto.id, {
          fecha: salida.fecha,
          cantidad: Number(salida.cantidad),
          motivo: salida.motivo.trim(),
          observaciones: salida.observaciones?.trim() || null,
        });
        toast.success("Salida registrada", {
          description: `-${salida.cantidad} ${producto.unidad_medida}.`,
        });
      } else {
        const fieldErrors = validateAjusteForm(ajuste);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
        const resultado = await inventarioService.registrarAjuste(supabase, producto.id, {
          nuevaCantidad: Number(ajuste.nueva_cantidad),
          motivo: ajuste.motivo.trim(),
          observaciones: ajuste.observaciones?.trim() || null,
        });
        if (resultado.sinCambios) {
          toast.info("Sin cambios", {
            description: "La nueva cantidad es igual al stock actual.",
          });
          onOpenChange(false);
          setIsSubmitting(false);
          return;
        }
        toast.success("Ajuste registrado", { description: "Se actualizó el stock del producto." });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof StockInsuficienteError) {
        setErrors({ cantidad: error.message });
      } else {
        toast.error("No se pudo registrar el movimiento", {
          description: "Intenta nuevamente en unos segundos.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{TITULO[tipo]}</DialogTitle>
            <DialogDescription>{DESCRIPCION[tipo]}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            {tipo === "entrada" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="entrada-fecha">Fecha *</Label>
                  <Input
                    id="entrada-fecha"
                    type="date"
                    value={entrada.fecha}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setEntrada((prev) => ({ ...prev, fecha: event.target.value }))}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.fecha)}
                  />
                  {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrada-cantidad">Cantidad ({producto.unidad_medida}) *</Label>
                  <Input
                    id="entrada-cantidad"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={entrada.cantidad}
                    onChange={(event) => setEntrada((prev) => ({ ...prev, cantidad: event.target.value }))}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.cantidad)}
                  />
                  {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrada-costo">Costo unitario</Label>
                  <Input
                    id="entrada-costo"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={entrada.costo_unitario}
                    onChange={(event) => setEntrada((prev) => ({ ...prev, costo_unitario: event.target.value }))}
                    placeholder="Ej. 12.50"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrada-motivo">Motivo *</Label>
                  <Input
                    id="entrada-motivo"
                    value={entrada.motivo}
                    onChange={(event) => setEntrada((prev) => ({ ...prev, motivo: event.target.value }))}
                    placeholder="Ej. Compra, reposición..."
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.motivo)}
                  />
                  {errors.motivo && <p className="text-xs text-destructive">{errors.motivo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrada-observaciones">Observaciones</Label>
                  <Textarea
                    id="entrada-observaciones"
                    value={entrada.observaciones}
                    onChange={(event) => setEntrada((prev) => ({ ...prev, observaciones: event.target.value }))}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </>
            )}

            {tipo === "salida" && (
              <>
                <p className="text-xs text-muted-foreground">
                  Stock disponible: {formatearCantidad(producto.stock_actual)} {producto.unidad_medida}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="salida-fecha">Fecha *</Label>
                  <Input
                    id="salida-fecha"
                    type="date"
                    value={salida.fecha}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setSalida((prev) => ({ ...prev, fecha: event.target.value }))}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.fecha)}
                  />
                  {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salida-cantidad">Cantidad ({producto.unidad_medida}) *</Label>
                  <Input
                    id="salida-cantidad"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={salida.cantidad}
                    onChange={(event) => setSalida((prev) => ({ ...prev, cantidad: event.target.value }))}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.cantidad)}
                  />
                  {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salida-motivo">Motivo *</Label>
                  <Input
                    id="salida-motivo"
                    value={salida.motivo}
                    onChange={(event) => setSalida((prev) => ({ ...prev, motivo: event.target.value }))}
                    placeholder="Ej. Uso veterinario, alimentación, pérdida..."
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.motivo)}
                  />
                  {errors.motivo && <p className="text-xs text-destructive">{errors.motivo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salida-observaciones">Observaciones</Label>
                  <Textarea
                    id="salida-observaciones"
                    value={salida.observaciones}
                    onChange={(event) => setSalida((prev) => ({ ...prev, observaciones: event.target.value }))}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </>
            )}

            {tipo === "ajuste" && (
              <>
                <p className="text-xs text-muted-foreground">
                  Stock actual del sistema: {formatearCantidad(producto.stock_actual)} {producto.unidad_medida}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="ajuste-cantidad">Nueva cantidad ({producto.unidad_medida}) *</Label>
                  <Input
                    id="ajuste-cantidad"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={ajuste.nueva_cantidad}
                    onChange={(event) => setAjuste((prev) => ({ ...prev, nueva_cantidad: event.target.value }))}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.nueva_cantidad)}
                  />
                  {errors.nueva_cantidad && <p className="text-xs text-destructive">{errors.nueva_cantidad}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ajuste-motivo">Motivo *</Label>
                  <Input
                    id="ajuste-motivo"
                    value={ajuste.motivo}
                    onChange={(event) => setAjuste((prev) => ({ ...prev, motivo: event.target.value }))}
                    placeholder="Ej. Corrección de inventario físico"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.motivo)}
                  />
                  {errors.motivo && <p className="text-xs text-destructive">{errors.motivo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ajuste-observaciones">Observaciones</Label>
                  <Textarea
                    id="ajuste-observaciones"
                    value={ajuste.observaciones}
                    onChange={(event) => setAjuste((prev) => ({ ...prev, observaciones: event.target.value }))}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {TITULO[tipo]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

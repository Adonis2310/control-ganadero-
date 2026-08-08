"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PurchaseItemForm } from "@/features/compras/components/purchase-item-form";
import { PurchaseTotals } from "@/features/compras/components/purchase-totals";
import type { CompraCompleta, EstadoCompra, LineaCompraInput, ProductoCompraRef } from "@/features/compras/types";
import { calcularTotalesPreview } from "@/features/compras/utils/compra.utils";
import {
  EMPTY_COMPRA_FORM,
  EMPTY_LINEA_FORM,
  validateCompraForm,
  validateLinea,
  type CompraFormErrors,
  type CompraFormValues,
  type LineaFormErrors,
  type LineaFormValues,
} from "@/features/compras/validations/compra.schema";
import type { ProveedorRef } from "@/features/proveedores/types";
import { createClient } from "@/lib/supabase/client";
import { comprasService } from "@/services/compras.service";

interface PurchaseFormProps {
  mode: "create" | "edit";
  proveedores: ProveedorRef[];
  productos: ProductoCompraRef[];
  compra?: CompraCompleta;
}

function toGeneralValues(compra?: CompraCompleta): CompraFormValues {
  if (!compra) return EMPTY_COMPRA_FORM;
  return {
    proveedor_id: compra.proveedor_id,
    fecha: compra.fecha,
    descuento: String(compra.descuento),
    impuestos: String(compra.impuestos),
    observaciones: compra.observaciones ?? "",
  };
}

function toLineas(compra?: CompraCompleta): LineaFormValues[] {
  if (!compra || compra.lineas.length === 0) return [EMPTY_LINEA_FORM];
  return compra.lineas.map((linea) => ({
    producto_id: linea.producto_id,
    cantidad: String(linea.cantidad),
    costo_unitario: String(linea.costo_unitario),
    descuento: String(linea.descuento),
  }));
}

export function PurchaseForm({ mode, proveedores, productos, compra }: PurchaseFormProps) {
  const router = useRouter();
  const [general, setGeneral] = useState<CompraFormValues>(() => toGeneralValues(compra));
  const [generalErrors, setGeneralErrors] = useState<CompraFormErrors>({});
  const [lineas, setLineas] = useState<LineaFormValues[]>(() => toLineas(compra));
  const [lineaErrors, setLineaErrors] = useState<LineaFormErrors[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lineasNumericas = lineas.map((linea) => ({
    cantidad: Number(linea.cantidad) || 0,
    costo_unitario: Number(linea.costo_unitario) || 0,
    descuento: Number(linea.descuento) || 0,
  }));
  const totales = calcularTotalesPreview(lineasNumericas, Number(general.descuento) || 0, Number(general.impuestos) || 0);

  function updateGeneral<K extends keyof CompraFormValues>(key: K, value: CompraFormValues[K]) {
    setGeneral((prev) => ({ ...prev, [key]: value }));
    setGeneralErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addLinea() {
    setLineas((prev) => [...prev, EMPTY_LINEA_FORM]);
  }

  function updateLinea(index: number, linea: LineaFormValues) {
    setLineas((prev) => prev.map((l, i) => (i === index ? linea : l)));
    setLineaErrors((prev) => prev.map((e, i) => (i === index ? {} : e)));
  }

  function removeLinea(index: number) {
    if (lineas.length <= 1) return;
    setLineas((prev) => prev.filter((_, i) => i !== index));
    setLineaErrors((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGuardar(estadoDestino: EstadoCompra) {
    const fieldErrors = validateCompraForm(general);
    const lineErrorsList = lineas.map(validateLinea);
    const hasLineErrors = lineErrorsList.some((e) => Object.keys(e).length > 0);

    if (Object.keys(fieldErrors).length > 0 || hasLineErrors) {
      setGeneralErrors(fieldErrors);
      setLineaErrors(lineErrorsList);
      toast.error("Revisa los campos marcados", {
        description: "Hay datos incompletos o inválidos en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const lineasPayload: LineaCompraInput[] = lineas.map((linea) => ({
      producto_id: linea.producto_id,
      cantidad: Number(linea.cantidad),
      costo_unitario: Number(linea.costo_unitario),
      descuento: Number(linea.descuento) || 0,
    }));

    try {
      if (mode === "create") {
        const created = await comprasService.crear(supabase, {
          proveedorId: general.proveedor_id,
          fecha: general.fecha,
          estado: estadoDestino,
          descuento: Number(general.descuento) || 0,
          impuestos: Number(general.impuestos) || 0,
          observaciones: general.observaciones?.trim() || null,
          lineas: lineasPayload,
        });
        toast.success("Compra registrada", {
          description: estadoDestino === "pendiente" ? "Se guardó como pendiente." : "Se guardó como borrador.",
        });
        router.push(`/compras/${created.id}`);
        router.refresh();
        return;
      }

      if (!compra) return;
      await comprasService.actualizar(supabase, compra.id, {
        proveedorId: general.proveedor_id,
        fecha: general.fecha,
        estado: estadoDestino,
        descuento: Number(general.descuento) || 0,
        impuestos: Number(general.impuestos) || 0,
        observaciones: general.observaciones?.trim() || null,
        lineas: lineasPayload,
      });
      toast.success("Cambios guardados");
      router.push(`/compras/${compra.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la compra", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Proveedor *</Label>
            <Select
              value={general.proveedor_id}
              onValueChange={(value) => updateGeneral("proveedor_id", value ?? "")}
              disabled={isSubmitting || proveedores.length === 0}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(generalErrors.proveedor_id)}>
                <SelectValue placeholder="Selecciona un proveedor">
                  {(current: string | null) => proveedores.find((p) => p.id === current)?.nombre ?? "Selecciona un proveedor"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {generalErrors.proveedor_id && <p className="text-xs text-destructive">{generalErrors.proveedor_id}</p>}
            {proveedores.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay proveedores activos. Registra uno primero.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compra-fecha">Fecha *</Label>
            <Input
              id="compra-fecha"
              type="date"
              value={general.fecha}
              max={new Date().toISOString().split("T")[0]}
              onChange={(event) => updateGeneral("fecha", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(generalErrors.fecha)}
            />
            {generalErrors.fecha && <p className="text-xs text-destructive">{generalErrors.fecha}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="compra-observaciones">Observaciones</Label>
            <Textarea
              id="compra-observaciones"
              value={general.observaciones}
              onChange={(event) => updateGeneral("observaciones", event.target.value)}
              placeholder="Notas adicionales sobre esta compra..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Productos</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLinea} disabled={isSubmitting}>
            <Plus className="size-4" />
            Agregar producto
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {lineas.map((linea, index) => (
            <PurchaseItemForm
              key={index}
              index={index}
              linea={linea}
              errors={lineaErrors[index] ?? {}}
              productos={productos}
              onChange={(next) => updateLinea(index, next)}
              onRemove={() => removeLinea(index)}
              disabled={isSubmitting}
              canRemove={lineas.length > 1}
            />
          ))}
        </div>
      </div>

      <PurchaseTotals
        editable
        subtotal={totales.subtotal}
        descuento={Number(general.descuento) || 0}
        impuestos={Number(general.impuestos) || 0}
        total={totales.total}
        descuentoInput={general.descuento}
        impuestosInput={general.impuestos}
        onDescuentoChange={(value) => updateGeneral("descuento", value)}
        onImpuestosChange={(value) => updateGeneral("impuestos", value)}
        disabled={isSubmitting}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleGuardar("borrador")}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Guardar como borrador
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={() => handleGuardar("pendiente")}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Marcar como pendiente
        </Button>
      </div>
    </div>
  );
}

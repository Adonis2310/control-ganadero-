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
import { SaleItemForm } from "@/features/ventas/components/sale-item-form";
import { SaleTotals } from "@/features/ventas/components/sale-totals";
import {
  METODO_PAGO_OPTIONS,
  type EstadoVenta,
  type LineaVentaInput,
  type SellableAnimalRef,
  type SellableProductRef,
  type VentaCompleta,
} from "@/features/ventas/types";
import { calcularTotalesPreview } from "@/features/ventas/utils/venta.utils";
import {
  EMPTY_LINEA_VENTA_FORM,
  EMPTY_VENTA_FORM,
  validateLineaVenta,
  validateVentaForm,
  type LineaVentaFormErrors,
  type LineaVentaFormValues,
  type VentaFormErrors,
  type VentaFormValues,
} from "@/features/ventas/validations/venta.schema";
import type { ClienteRef } from "@/features/clientes/types";
import { createClient } from "@/lib/supabase/client";
import { ventasService } from "@/services/ventas.service";

interface SaleFormProps {
  mode: "create" | "edit";
  clientes: ClienteRef[];
  animales: SellableAnimalRef[];
  productos: SellableProductRef[];
  venta?: VentaCompleta;
}

function toGeneralValues(venta?: VentaCompleta): VentaFormValues {
  if (!venta) return EMPTY_VENTA_FORM;
  return {
    cliente_id: venta.cliente_id,
    fecha: venta.fecha,
    metodo_pago: venta.metodo_pago ?? "",
    descuento: String(venta.descuento),
    impuestos: String(venta.impuestos),
    observaciones: venta.observaciones ?? "",
  };
}

function toLineas(venta?: VentaCompleta): LineaVentaFormValues[] {
  if (!venta || venta.lineas.length === 0) return [EMPTY_LINEA_VENTA_FORM];
  return venta.lineas.map((linea) => ({
    tipo: linea.tipo,
    producto_id: linea.producto_id ?? "",
    animal_id: linea.animal_id ?? "",
    descripcion: linea.descripcion ?? "",
    cantidad: String(linea.cantidad),
    precio_unitario: String(linea.precio_unitario),
    descuento: String(linea.descuento),
  }));
}

export function SaleForm({ mode, clientes, animales, productos, venta }: SaleFormProps) {
  const router = useRouter();
  const [general, setGeneral] = useState<VentaFormValues>(() => toGeneralValues(venta));
  const [generalErrors, setGeneralErrors] = useState<VentaFormErrors>({});
  const [lineas, setLineas] = useState<LineaVentaFormValues[]>(() => toLineas(venta));
  const [lineaErrors, setLineaErrors] = useState<LineaVentaFormErrors[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lineasNumericas = lineas.map((linea) => ({
    cantidad: Number(linea.cantidad) || 0,
    precio_unitario: Number(linea.precio_unitario) || 0,
    descuento: Number(linea.descuento) || 0,
  }));
  const totales = calcularTotalesPreview(lineasNumericas, Number(general.descuento) || 0, Number(general.impuestos) || 0);

  function updateGeneral<K extends keyof VentaFormValues>(key: K, value: VentaFormValues[K]) {
    setGeneral((prev) => ({ ...prev, [key]: value }));
    setGeneralErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addLinea() {
    setLineas((prev) => [...prev, EMPTY_LINEA_VENTA_FORM]);
  }

  function updateLinea(index: number, linea: LineaVentaFormValues) {
    setLineas((prev) => prev.map((l, i) => (i === index ? linea : l)));
    setLineaErrors((prev) => prev.map((e, i) => (i === index ? {} : e)));
  }

  function removeLinea(index: number) {
    if (lineas.length <= 1) return;
    setLineas((prev) => prev.filter((_, i) => i !== index));
    setLineaErrors((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGuardar(estadoDestino: EstadoVenta) {
    const fieldErrors = validateVentaForm(general);
    const lineErrorsList = lineas.map(validateLineaVenta);
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

    const lineasPayload: LineaVentaInput[] = lineas.map((linea) => ({
      tipo: linea.tipo,
      producto_id: linea.tipo === "producto" ? linea.producto_id : null,
      animal_id: linea.tipo === "animal" ? linea.animal_id : null,
      descripcion: linea.tipo === "otro" ? linea.descripcion.trim() : null,
      cantidad: Number(linea.cantidad),
      precio_unitario: Number(linea.precio_unitario),
      descuento: Number(linea.descuento) || 0,
    }));

    try {
      if (mode === "create") {
        const created = await ventasService.crear(supabase, {
          clienteId: general.cliente_id,
          fecha: general.fecha,
          estado: estadoDestino,
          descuento: Number(general.descuento) || 0,
          impuestos: Number(general.impuestos) || 0,
          metodoPago: general.metodo_pago?.trim() || null,
          observaciones: general.observaciones?.trim() || null,
          lineas: lineasPayload,
        });
        toast.success("Venta registrada", {
          description: estadoDestino === "pendiente" ? "Se guardó como pendiente." : "Se guardó como borrador.",
        });
        router.push(`/ventas/${created.id}`);
        router.refresh();
        return;
      }

      if (!venta) return;
      await ventasService.actualizar(supabase, venta.id, {
        clienteId: general.cliente_id,
        fecha: general.fecha,
        estado: estadoDestino,
        descuento: Number(general.descuento) || 0,
        impuestos: Number(general.impuestos) || 0,
        metodoPago: general.metodo_pago?.trim() || null,
        observaciones: general.observaciones?.trim() || null,
        lineas: lineasPayload,
      });
      toast.success("Cambios guardados");
      router.push(`/ventas/${venta.id}`);
      router.refresh();
    } catch (error) {
      const message = (error as { message?: string } | null)?.message;
      toast.error("No se pudo guardar la venta", {
        description: message?.includes("disponible") || message?.includes("animal")
          ? message
          : "Intenta nuevamente en unos segundos.",
      });
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
            <Label>Cliente *</Label>
            <Select
              value={general.cliente_id}
              onValueChange={(value) => updateGeneral("cliente_id", value ?? "")}
              disabled={isSubmitting || clientes.length === 0}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(generalErrors.cliente_id)}>
                <SelectValue placeholder="Selecciona un cliente">
                  {(current: string | null) => clientes.find((c) => c.id === current)?.nombre ?? "Selecciona un cliente"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {generalErrors.cliente_id && <p className="text-xs text-destructive">{generalErrors.cliente_id}</p>}
            {clientes.length === 0 && (
              <p className="text-xs text-muted-foreground">No hay clientes activos. Registra uno primero.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venta-fecha">Fecha *</Label>
            <Input
              id="venta-fecha"
              type="date"
              value={general.fecha}
              max={new Date().toISOString().split("T")[0]}
              onChange={(event) => updateGeneral("fecha", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(generalErrors.fecha)}
            />
            {generalErrors.fecha && <p className="text-xs text-destructive">{generalErrors.fecha}</p>}
          </div>

          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select
              value={general.metodo_pago || "ninguno"}
              onValueChange={(value) => updateGeneral("metodo_pago", value === "ninguno" ? "" : (value ?? ""))}
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

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venta-observaciones">Observaciones</Label>
            <Textarea
              id="venta-observaciones"
              value={general.observaciones}
              onChange={(event) => updateGeneral("observaciones", event.target.value)}
              placeholder="Notas adicionales sobre esta venta..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Detalle de la venta</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLinea} disabled={isSubmitting}>
            <Plus className="size-4" />
            Agregar elemento
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {lineas.map((linea, index) => (
            <SaleItemForm
              key={index}
              index={index}
              linea={linea}
              errors={lineaErrors[index] ?? {}}
              animales={animales}
              productos={productos}
              onChange={(next) => updateLinea(index, next)}
              onRemove={() => removeLinea(index)}
              disabled={isSubmitting}
              canRemove={lineas.length > 1}
            />
          ))}
        </div>
      </div>

      <SaleTotals
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

"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SEXO_LABEL } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import {
  TIPO_DETALLE_VENTA_OPTIONS,
  type SellableAnimalRef,
  type SellableProductRef,
  type TipoDetalleVenta,
} from "@/features/ventas/types";
import { calcularSubtotalLinea } from "@/features/ventas/utils/venta.utils";
import type { LineaVentaFormErrors, LineaVentaFormValues } from "@/features/ventas/validations/venta.schema";

interface SaleItemFormProps {
  index: number;
  linea: LineaVentaFormValues;
  errors: LineaVentaFormErrors;
  animales: SellableAnimalRef[];
  productos: SellableProductRef[];
  onChange: (linea: LineaVentaFormValues) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

export function SaleItemForm({
  index,
  linea,
  errors,
  animales,
  productos,
  onChange,
  onRemove,
  disabled,
  canRemove,
}: SaleItemFormProps) {
  function updateField<K extends keyof LineaVentaFormValues>(key: K, value: LineaVentaFormValues[K]) {
    onChange({ ...linea, [key]: value });
  }

  function cambiarTipo(tipo: TipoDetalleVenta) {
    onChange({
      ...linea,
      tipo,
      animal_id: "",
      producto_id: "",
      descripcion: "",
      cantidad: tipo === "animal" ? "1" : linea.cantidad,
      precio_unitario: "",
    });
  }

  const animalSeleccionado = animales.find((a) => a.id === linea.animal_id);
  const productoSeleccionado = productos.find((p) => p.id === linea.producto_id);

  const subtotal = calcularSubtotalLinea({
    cantidad: Number(linea.cantidad) || 0,
    precio_unitario: Number(linea.precio_unitario) || 0,
    descuento: Number(linea.descuento) || 0,
  });

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">Elemento {index + 1}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          aria-label="Eliminar elemento"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <Label>Tipo *</Label>
        <Select value={linea.tipo} onValueChange={(value) => cambiarTipo((value ?? "animal") as TipoDetalleVenta)} disabled={disabled}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {() => TIPO_DETALLE_VENTA_OPTIONS.find((o) => o.value === linea.tipo)?.label ?? "Selecciona un tipo"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TIPO_DETALLE_VENTA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {linea.tipo === "animal" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Animal *</Label>
            <Select
              value={linea.animal_id}
              onValueChange={(value) => updateField("animal_id", value ?? "")}
              disabled={disabled}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.animal_id)}>
                <SelectValue placeholder="Selecciona un animal">
                  {(current: string | null) => {
                    const animal = animales.find((a) => a.id === current);
                    if (!animal) return "Selecciona un animal";
                    return `${animal.identificador}${animal.nombre ? ` — ${animal.nombre}` : ""}`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {animales.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.identificador}
                    {animal.nombre ? ` — ${animal.nombre}` : ""} · {SEXO_LABEL[animal.sexo]}
                    {animal.raza ? ` · ${animal.raza}` : ""}
                    {animal.peso_actual_kg ? ` · ${animal.peso_actual_kg} kg` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.animal_id && <p className="text-xs text-destructive">{errors.animal_id}</p>}
            {animales.length === 0 && (
              <p className="text-xs text-muted-foreground">No hay animales activos disponibles para vender.</p>
            )}
            {animalSeleccionado && (
              <p className="text-xs text-muted-foreground">
                Sexo: {SEXO_LABEL[animalSeleccionado.sexo]}
                {animalSeleccionado.raza ? ` · Raza: ${animalSeleccionado.raza}` : ""}
                {animalSeleccionado.peso_actual_kg ? ` · Peso actual: ${animalSeleccionado.peso_actual_kg} kg` : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Precio *</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.precio_unitario}
              onChange={(event) => updateField("precio_unitario", event.target.value)}
              placeholder="Ej. 850000"
              disabled={disabled}
              aria-invalid={Boolean(errors.precio_unitario)}
            />
            {errors.precio_unitario && <p className="text-xs text-destructive">{errors.precio_unitario}</p>}
          </div>

          <div className="space-y-2">
            <Label>Descuento</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.descuento}
              onChange={(event) => updateField("descuento", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.descuento)}
            />
          </div>
        </div>
      )}

      {linea.tipo === "producto" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>Producto *</Label>
            <Select
              value={linea.producto_id}
              onValueChange={(value) => updateField("producto_id", value ?? "")}
              disabled={disabled}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.producto_id)}>
                <SelectValue placeholder="Selecciona un producto">
                  {(current: string | null) => productos.find((p) => p.id === current)?.nombre ?? "Selecciona un producto"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productos.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id}>
                    {producto.nombre} (stock: {producto.stock_actual} {producto.unidad_medida})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.producto_id && <p className="text-xs text-destructive">{errors.producto_id}</p>}
            {productoSeleccionado && (
              <p className="text-xs text-muted-foreground">
                Stock disponible: {productoSeleccionado.stock_actual} {productoSeleccionado.unidad_medida}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cantidad *</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.cantidad}
              onChange={(event) => updateField("cantidad", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.cantidad)}
            />
            {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad}</p>}
          </div>

          <div className="space-y-2">
            <Label>Precio *</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.precio_unitario}
              onChange={(event) => updateField("precio_unitario", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.precio_unitario)}
            />
            {errors.precio_unitario && <p className="text-xs text-destructive">{errors.precio_unitario}</p>}
          </div>

          <div className="space-y-2">
            <Label>Descuento</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.descuento}
              onChange={(event) => updateField("descuento", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.descuento)}
            />
          </div>
        </div>
      )}

      {linea.tipo === "otro" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>Descripción *</Label>
            <Textarea
              value={linea.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              placeholder="Ej. Servicio de transporte"
              disabled={disabled}
              rows={1}
              aria-invalid={Boolean(errors.descripcion)}
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cantidad *</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.cantidad}
              onChange={(event) => updateField("cantidad", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.cantidad)}
            />
            {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad}</p>}
          </div>

          <div className="space-y-2">
            <Label>Precio *</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={linea.precio_unitario}
              onChange={(event) => updateField("precio_unitario", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.precio_unitario)}
            />
            {errors.precio_unitario && <p className="text-xs text-destructive">{errors.precio_unitario}</p>}
          </div>
        </div>
      )}

      <p className="mt-3 text-right text-sm text-muted-foreground">
        Subtotal: <span className="font-medium text-foreground">{formatearMoneda(subtotal)}</span>
      </p>
    </div>
  );
}

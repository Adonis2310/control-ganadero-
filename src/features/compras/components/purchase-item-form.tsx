"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LineaFormErrors, LineaFormValues } from "@/features/compras/validations/compra.schema";
import { calcularSubtotalLinea } from "@/features/compras/utils/compra.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { ProductoCompraRef } from "@/features/compras/types";

interface PurchaseItemFormProps {
  index: number;
  linea: LineaFormValues;
  errors: LineaFormErrors;
  productos: ProductoCompraRef[];
  onChange: (linea: LineaFormValues) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

export function PurchaseItemForm({
  index,
  linea,
  errors,
  productos,
  onChange,
  onRemove,
  disabled,
  canRemove,
}: PurchaseItemFormProps) {
  function updateField<K extends keyof LineaFormValues>(key: K, value: LineaFormValues[K]) {
    onChange({ ...linea, [key]: value });
  }

  const subtotal = calcularSubtotalLinea({
    cantidad: Number(linea.cantidad) || 0,
    costo_unitario: Number(linea.costo_unitario) || 0,
    descuento: Number(linea.descuento) || 0,
  });

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">Producto {index + 1}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          aria-label="Eliminar producto"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                  {producto.nombre} ({producto.unidad_medida})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.producto_id && <p className="text-xs text-destructive">{errors.producto_id}</p>}
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
          <Label>Costo unitario *</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={linea.costo_unitario}
            onChange={(event) => updateField("costo_unitario", event.target.value)}
            placeholder="Ej. 12.50"
            disabled={disabled}
            aria-invalid={Boolean(errors.costo_unitario)}
          />
          {errors.costo_unitario && <p className="text-xs text-destructive">{errors.costo_unitario}</p>}
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
          {errors.descuento && <p className="text-xs text-destructive">{errors.descuento}</p>}
        </div>
      </div>

      <p className="mt-3 text-right text-sm text-muted-foreground">
        Subtotal: <span className="font-medium text-foreground">{formatearMoneda(subtotal)}</span>
      </p>
    </div>
  );
}

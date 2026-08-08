import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

interface SaleTotalsReadOnlyProps {
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
}

interface SaleTotalsEditableProps extends SaleTotalsReadOnlyProps {
  editable: true;
  onDescuentoChange: (value: string) => void;
  onImpuestosChange: (value: string) => void;
  descuentoInput: string;
  impuestosInput: string;
  disabled?: boolean;
}

type SaleTotalsProps = SaleTotalsReadOnlyProps | SaleTotalsEditableProps;

function esEditable(props: SaleTotalsProps): props is SaleTotalsEditableProps {
  return "editable" in props && props.editable === true;
}

export function SaleTotals(props: SaleTotalsProps) {
  const editable = esEditable(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Totales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatearMoneda(props.subtotal)}</span>
        </div>

        {editable ? (
          <>
            <div className="flex items-center justify-between gap-3 text-sm">
              <Label htmlFor="venta-descuento" className="text-muted-foreground">
                Descuento
              </Label>
              <Input
                id="venta-descuento"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={props.descuentoInput}
                onChange={(event) => props.onDescuentoChange(event.target.value)}
                disabled={props.disabled}
                className="w-32 text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <Label htmlFor="venta-impuestos" className="text-muted-foreground">
                Impuestos
              </Label>
              <Input
                id="venta-impuestos"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={props.impuestosInput}
                onChange={(event) => props.onImpuestosChange(event.target.value)}
                disabled={props.disabled}
                className="w-32 text-right"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Descuento</span>
              <span className="font-medium">{formatearMoneda(props.descuento)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium">{formatearMoneda(props.impuestos)}</span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t pt-3 text-base">
          <span className="font-medium">Total</span>
          <span className="font-semibold">{formatearMoneda(props.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONEDA_OPTIONS, type Moneda } from "@/features/configuracion/types";

interface CurrencySettingsProps {
  value: Moneda;
  onChange: (value: Moneda) => void;
  disabled?: boolean;
}

export function CurrencySettings({ value, onChange, disabled }: CurrencySettingsProps) {
  return (
    <div className="space-y-2">
      <Label>Moneda</Label>
      <Select value={value} onValueChange={(next) => onChange((next ?? "CRC") as Moneda)} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue>{() => MONEDA_OPTIONS.find((option) => option.value === value)?.label ?? "CRC — Colón costarricense"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONEDA_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Se aplica a Compras, Ventas, Finanzas, Gastos y Reportes. No convierte los valores ya registrados.
      </p>
    </div>
  );
}

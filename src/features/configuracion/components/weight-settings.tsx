import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIDAD_PESO_OPTIONS, type UnidadPeso } from "@/features/configuracion/types";

interface WeightSettingsProps {
  value: UnidadPeso;
  onChange: (value: UnidadPeso) => void;
  disabled?: boolean;
}

export function WeightSettings({ value, onChange, disabled }: WeightSettingsProps) {
  return (
    <div className="space-y-2">
      <Label>Unidad de peso</Label>
      <Select value={value} onValueChange={(next) => onChange((next ?? "kg") as UnidadPeso)} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue>{() => UNIDAD_PESO_OPTIONS.find((option) => option.value === value)?.label ?? "Kilogramos"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {UNIDAD_PESO_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Se aplica en Ganado, Peso y Reportes. Los pesos se siguen registrando en kilogramos; esto solo cambia cómo se muestran.
      </p>
    </div>
  );
}

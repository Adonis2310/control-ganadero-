import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DECIMALES_OPTIONS } from "@/features/configuracion/types";

interface NumberFormatSettingsProps {
  decimales: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function NumberFormatSettings({ decimales, onChange, disabled, error }: NumberFormatSettingsProps) {
  return (
    <div className="space-y-2">
      <Label>Decimales</Label>
      <Select value={decimales} onValueChange={(next) => onChange(next ?? "0")} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-56" aria-invalid={Boolean(error)}>
          <SelectValue>{() => decimales}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DECIMALES_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        El separador de miles se aplica automáticamente según el formato regional (Ej. ₡1.500.000).
      </p>
    </div>
  );
}

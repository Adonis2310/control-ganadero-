import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnimalRef } from "@/features/ganado/types";

interface AnimalParentSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AnimalRef[];
  placeholder: string;
  disabled?: boolean;
}

export function AnimalParentSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: AnimalParentSelectProps) {
  return (
    <Select
      value={value || "ninguno"}
      onValueChange={(next) => onChange(next ?? "ninguno")}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {(current: string | null) => {
            if (!current || current === "ninguno") return "Sin registrar";
            const option = options.find((item) => item.id === current);
            if (!option) return placeholder;
            return option.nombre
              ? `${option.identificador} — ${option.nombre}`
              : option.identificador;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ninguno">Sin registrar</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.identificador}
            {option.nombre ? ` — ${option.nombre}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

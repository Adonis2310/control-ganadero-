import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPO_ACTIVIDAD_OPTIONS } from "@/features/calendario/types";

interface ActivityTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  includeTodos?: boolean;
  id?: string;
}

export function ActivityTypeSelect({
  value,
  onChange,
  placeholder = "Selecciona un tipo",
  disabled,
  includeTodos,
  id,
}: ActivityTypeSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder}>
          {(current: string | null) => {
            if (includeTodos && (!current || current === "todos")) return "Todos los tipos";
            const opcion = TIPO_ACTIVIDAD_OPTIONS.find((item) => item.value === current);
            return opcion?.label ?? placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {includeTodos && <SelectItem value="todos">Todos los tipos</SelectItem>}
        {TIPO_ACTIVIDAD_OPTIONS.map((opcion) => (
          <SelectItem key={opcion.value} value={opcion.value}>
            {opcion.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

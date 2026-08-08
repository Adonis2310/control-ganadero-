import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoriaGastoRow } from "@/features/finanzas/types";

interface CategoryGastoSelectProps {
  value: string;
  onChange: (value: string) => void;
  categorias: CategoriaGastoRow[];
  placeholder?: string;
  disabled?: boolean;
  includeTodas?: boolean;
  id?: string;
}

export function CategoryGastoSelect({
  value,
  onChange,
  categorias,
  placeholder = "Selecciona una categoría",
  disabled,
  includeTodas,
  id,
}: CategoryGastoSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder}>
          {(current: string | null) => {
            if (includeTodas && (!current || current === "todas")) return "Todas las categorías";
            const categoria = categorias.find((c) => c.id === current);
            return categoria?.nombre ?? placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {includeTodas && <SelectItem value="todas">Todas las categorías</SelectItem>}
        {categorias.map((categoria) => (
          <SelectItem key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

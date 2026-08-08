import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoriaInventario } from "@/features/inventario/types";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categorias: CategoriaInventario[];
  placeholder?: string;
  disabled?: boolean;
  includeTodas?: boolean;
  id?: string;
}

export function CategorySelect({
  value,
  onChange,
  categorias,
  placeholder = "Selecciona una categoría",
  disabled,
  includeTodas,
  id,
}: CategorySelectProps) {
  return (
    <Select value={value || undefined} onValueChange={(next) => onChange(next ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder}>
          {(current: string | null) => {
            if (includeTodas && (!current || current === "todos")) return "Todas las categorías";
            const categoria = categorias.find((c) => c.id === current);
            return categoria?.nombre ?? placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {includeTodas && <SelectItem value="todos">Todas las categorías</SelectItem>}
        {categorias.map((categoria) => (
          <SelectItem key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

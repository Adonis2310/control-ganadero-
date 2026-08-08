"use client";

import { useMemo, useState } from "react";

import { DEFAULT_VENTA_FILTERS, type VentaConCliente, type VentaFilters } from "@/features/ventas/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useVentaFilters(ventas: VentaConCliente[], tiposPorVenta: Record<string, string[]>) {
  const [filters, setFilters] = useState<VentaFilters>(DEFAULT_VENTA_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return ventas.filter((venta) => {
      if (search) {
        const haystack = normalizar(
          `${venta.cliente?.nombre ?? ""} ${String(venta.numero).padStart(4, "0")}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.clienteId !== "todos" && venta.cliente_id !== filters.clienteId) return false;
      if (filters.estado !== "todos" && venta.estado !== filters.estado) return false;
      if (filters.metodoPago !== "todos" && venta.metodo_pago !== filters.metodoPago) return false;
      if (filters.tipo !== "todos" && !(tiposPorVenta[venta.id] ?? []).includes(filters.tipo)) return false;
      if (filters.desde && venta.fecha < filters.desde) return false;
      if (filters.hasta && venta.fecha > filters.hasta) return false;
      return true;
    });
  }, [ventas, filters, tiposPorVenta]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.clienteId !== "todos" ||
    filters.estado !== "todos" ||
    filters.metodoPago !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_VENTA_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}

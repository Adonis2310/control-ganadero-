"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Receipt, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteExpenseDialog } from "@/features/finanzas/components/delete-expense-dialog";
import { ExpenseDetailsDialog } from "@/features/finanzas/components/expense-details-dialog";
import { ExpenseFilters } from "@/features/finanzas/components/expense-filters";
import { ExpenseFormDialog } from "@/features/finanzas/components/expense-form-dialog";
import { ExpenseTable } from "@/features/finanzas/components/expense-table";
import { useGastoFilters } from "@/features/finanzas/hooks/use-gasto-filters";
import type { CategoriaGastoRow, GastoConReferencias } from "@/features/finanzas/types";
import type { AnimalRef } from "@/features/ganado/types";
import type { ProveedorRef } from "@/features/proveedores/types";

interface ExpenseExplorerProps {
  gastosIniciales: GastoConReferencias[];
  categorias: CategoriaGastoRow[];
  proveedores: ProveedorRef[];
  animales: AnimalRef[];
}

export function ExpenseExplorer({ gastosIniciales, categorias, proveedores, animales }: ExpenseExplorerProps) {
  const router = useRouter();
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useGastoFilters(gastosIniciales);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoConReferencias | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleNuevo() {
    setGastoSeleccionado(null);
    setFormMode("create");
    setFormOpen(true);
  }

  function handleEdit(gasto: GastoConReferencias) {
    setGastoSeleccionado(gasto);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleView(gasto: GastoConReferencias) {
    setGastoSeleccionado(gasto);
    setDetailsOpen(true);
  }

  function handleDelete(gasto: GastoConReferencias) {
    setGastoSeleccionado(gasto);
    setDeleteOpen(true);
  }

  function handleChanged() {
    router.refresh();
  }

  if (gastosIniciales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Receipt className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay gastos registrados.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registra tu primer gasto para empezar a llevar el control de los egresos de la finca.
            </p>
          </div>
          <Button onClick={handleNuevo}>
            <Plus className="size-4" />
            Registrar primer gasto
          </Button>
        </div>

        <ExpenseFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          gasto={gastoSeleccionado}
          categorias={categorias}
          proveedores={proveedores}
          animales={animales}
          onSaved={handleChanged}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={handleNuevo}>
          <Plus className="size-4" />
          Nuevo gasto
        </Button>
      </div>

      <ExpenseFilters
        filters={filters}
        onFiltersChange={setFilters}
        categorias={categorias}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún gasto coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <ExpenseTable gastos={filtered} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        gasto={gastoSeleccionado}
        categorias={categorias}
        proveedores={proveedores}
        animales={animales}
        onSaved={handleChanged}
      />

      <ExpenseDetailsDialog gasto={gastoSeleccionado} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <DeleteExpenseDialog
        gasto={gastoSeleccionado}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleChanged}
      />
    </div>
  );
}

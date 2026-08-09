"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFincaInfo } from "@/features/configuracion/hooks/use-configuracion";
import { exportarReporteExcel, exportarReportePDF } from "@/features/reportes/utils/export.utils";
import type { ExportColumn } from "@/features/reportes/types";

interface ReportExportProps<T> {
  titulo: string;
  periodoLabel: string;
  columnas: ExportColumn<T>[];
  filas: T[];
}

/** Exporta a PDF/Excel e imprime respetando exactamente los datos, filtros y período mostrados en el reporte actual. */
export function ReportExport<T>({ titulo, periodoLabel, columnas, filas }: ReportExportProps<T>) {
  const [exportando, setExportando] = useState(false);
  const finca = useFincaInfo();

  async function handlePdf() {
    setExportando(true);
    try {
      await exportarReportePDF({ titulo, periodoLabel, columnas, filas, nombreFinca: finca?.nombre, logoUrl: finca?.logo_url });
    } catch {
      toast.error("No se pudo exportar el PDF", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setExportando(false);
    }
  }

  async function handleExcel() {
    setExportando(true);
    try {
      await exportarReporteExcel({ titulo, periodoLabel, columnas, filas, nombreFinca: finca?.nombre });
    } catch {
      toast.error("No se pudo exportar el Excel", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" disabled={exportando}>
              {exportando ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Exportar
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePdf}>
            <FileText className="size-4" />
            Exportar a PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExcel}>
            <FileSpreadsheet className="size-4" />
            Exportar a Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-4" />
        Imprimir
      </Button>
    </div>
  );
}

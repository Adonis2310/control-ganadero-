import type { ReportExportConfig } from "@/features/reportes/types";

function slug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/** Descarga el logo como data URL para poder incrustarlo en el PDF. Si falla (red, CORS, sin logo), el reporte se exporta igual sin logo. */
async function cargarLogoComoDataUrl(logoUrl: string | null | undefined): Promise<string | null> {
  if (!logoUrl) return null;
  try {
    const respuesta = await fetch(logoUrl);
    const blob = await respuesta.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Exporta un reporte a PDF: logo y nombre de la finca, título, fecha de generación, período y la tabla de datos mostrados. */
export async function exportarReportePDF<T>(config: ReportExportConfig<T>): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }, logoDataUrl] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    cargarLogoComoDataUrl(config.logoUrl),
  ]);
  const doc = new jsPDF();

  const margenIzquierdo = logoDataUrl ? 32 : 14;
  if (logoDataUrl) {
    try {
      const formato = logoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(logoDataUrl, formato, 14, 10, 14, 14);
    } catch {
      // Formato de imagen no soportado por jsPDF (ej. WEBP en algunos navegadores): se omite sin interrumpir la exportación.
    }
  }

  if (config.nombreFinca) {
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(config.nombreFinca, margenIzquierdo, 12);
  }

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(config.titulo, margenIzquierdo, 20);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generado: ${new Date().toLocaleString("es")}`, margenIzquierdo, 28);
  doc.text(`Período: ${config.periodoLabel}`, margenIzquierdo, 34);

  autoTable(doc, {
    startY: 40,
    head: [config.columnas.map((columna) => columna.header)],
    body: config.filas.map((fila) => config.columnas.map((columna) => String(columna.accessor(fila)))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [38, 38, 38] },
  });

  doc.save(`${slug(config.titulo)}.pdf`);
}

/** Exporta un reporte a Excel (.xlsx): mismo contenido informativo que el PDF, en formato de hoja de cálculo. */
export async function exportarReporteExcel<T>(config: ReportExportConfig<T>): Promise<void> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  const hoja = workbook.addWorksheet("Reporte");

  if (config.nombreFinca) {
    hoja.addRow([config.nombreFinca]).font = { bold: true, size: 12 };
  }
  hoja.addRow([config.titulo]).font = { bold: true, size: 14 };
  hoja.addRow([`Generado: ${new Date().toLocaleString("es")}`]);
  hoja.addRow([`Período: ${config.periodoLabel}`]);
  hoja.addRow([]);
  hoja.addRow(config.columnas.map((columna) => columna.header)).font = { bold: true };

  for (const fila of config.filas) {
    hoja.addRow(config.columnas.map((columna) => columna.accessor(fila)));
  }

  hoja.columns.forEach((columna) => {
    columna.width = 22;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  descargarBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${slug(config.titulo)}.xlsx`,
  );
}

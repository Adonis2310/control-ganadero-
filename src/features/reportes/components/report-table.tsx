import { Inbox } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportTableColumn } from "@/features/reportes/types";

interface ReportTableProps<T> {
  columns: ReportTableColumn<T>[];
  rows: T[];
  keyField: (row: T) => string;
  emptyMessage?: string;
}

export function ReportTable<T>({ columns, rows, keyField, emptyMessage = "No hay datos para este período." }: ReportTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-white py-10 text-center dark:bg-neutral-900">
        <Inbox className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-neutral-900">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={keyField(row)}>
              {columns.map((column) => (
                <TableCell key={column.header} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

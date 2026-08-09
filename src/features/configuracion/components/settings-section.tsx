"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

/** Envoltorio reutilizado por las 5 secciones de /configuracion: título + campos + un único botón "Guardar cambios". */
export function SettingsSection({ title, description, children, onSave, isSaving, disabled }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onSave} disabled={isSaving || disabled}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Guardar cambios
        </Button>
      </CardFooter>
    </Card>
  );
}

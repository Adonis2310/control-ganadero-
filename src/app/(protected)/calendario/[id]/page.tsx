import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityDetail } from "@/features/calendario/components/activity-detail";
import { ActivityDetailActions } from "@/features/calendario/components/activity-detail-actions";
import { ActivityDetailHeader } from "@/features/calendario/components/activity-detail-header";
import { createClient } from "@/lib/supabase/server";
import { actividadesService } from "@/services/actividades.service";
import { animalesService } from "@/services/animales.service";
import { fincaService } from "@/services/finca.service";

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ActivityDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const actividad = await actividadesService.getById(supabase, id);
  return {
    title: actividad ? `${actividad.titulo} | Control Ganadero` : "Actividad no encontrada | Control Ganadero",
  };
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const actividad = await actividadesService.getById(supabase, id);

  if (!actividad) {
    notFound();
  }

  const finca = await fincaService.getOrCreate(supabase);
  const animales = await animalesService.listAll(supabase, finca.id);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/calendario" />}
        className="w-fit text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Calendario
      </Button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <ActivityDetailHeader actividad={actividad} />
        <ActivityDetailActions actividad={actividad} animales={animales} fincaId={finca.id} />
      </div>

      <ActivityDetail actividad={actividad} />
    </div>
  );
}

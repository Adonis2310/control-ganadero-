"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "@/features/configuracion/components/appearance-settings";
import { CalendarSettings } from "@/features/configuracion/components/calendar-settings";
import { FarmInformationSettings } from "@/features/configuracion/components/farm-information-settings";
import { InventorySettings } from "@/features/configuracion/components/inventory-settings";
import { PreferencesSettingsForm } from "@/features/configuracion/components/preferences-settings-form";
import type { ConfiguracionSistemaRow, FincaRow } from "@/features/configuracion/types";

interface SettingsTabsProps {
  finca: FincaRow;
  sistema: ConfiguracionSistemaRow;
}

export function SettingsTabs({ finca, sistema }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="finca">
      <div className="overflow-x-auto pb-1">
        <TabsList>
          <TabsTrigger value="finca">Información de la finca</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="finca" className="pt-4">
        <FarmInformationSettings finca={finca} />
      </TabsContent>
      <TabsContent value="preferencias" className="pt-4">
        <PreferencesSettingsForm sistema={sistema} />
      </TabsContent>
      <TabsContent value="inventario" className="pt-4">
        <InventorySettings sistema={sistema} />
      </TabsContent>
      <TabsContent value="calendario" className="pt-4">
        <CalendarSettings sistema={sistema} />
      </TabsContent>
      <TabsContent value="apariencia" className="pt-4">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  );
}

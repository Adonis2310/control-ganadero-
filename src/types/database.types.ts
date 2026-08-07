/**
 * Tipos generados a partir del esquema de Supabase (supabase/migrations).
 * En fases posteriores estos tipos pueden regenerarse automáticamente con:
 * `supabase gen types typescript --local > src/types/database.types.ts`
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      finca: {
        Row: {
          id: string;
          nombre: string;
          ubicacion: string | null;
          propietario: string | null;
          area_hectareas: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          ubicacion?: string | null;
          propietario?: string | null;
          area_hectareas?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          ubicacion?: string | null;
          propietario?: string | null;
          area_hectareas?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      razas: {
        Row: {
          id: string;
          nombre: string;
          proposito: string | null;
          descripcion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          proposito?: string | null;
          descripcion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          proposito?: string | null;
          descripcion?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      animales: {
        Row: {
          id: string;
          finca_id: string;
          raza_id: string | null;
          identificador: string;
          nombre: string | null;
          sexo: "macho" | "hembra";
          fecha_nacimiento: string | null;
          estado: "activo" | "vendido" | "fallecido" | "baja";
          peso_actual_kg: number | null;
          foto_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          finca_id: string;
          raza_id?: string | null;
          identificador: string;
          nombre?: string | null;
          sexo: "macho" | "hembra";
          fecha_nacimiento?: string | null;
          estado?: "activo" | "vendido" | "fallecido" | "baja";
          peso_actual_kg?: number | null;
          foto_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          finca_id?: string;
          raza_id?: string | null;
          identificador?: string;
          nombre?: string | null;
          sexo?: "macho" | "hembra";
          fecha_nacimiento?: string | null;
          estado?: "activo" | "vendido" | "fallecido" | "baja";
          peso_actual_kg?: number | null;
          foto_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animales_finca_id_fkey";
            columns: ["finca_id"];
            isOneToOne: false;
            referencedRelation: "finca";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animales_raza_id_fkey";
            columns: ["raza_id"];
            isOneToOne: false;
            referencedRelation: "razas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

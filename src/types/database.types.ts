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
          estado: "activo" | "vendido" | "fallecido" | "transferido";
          color: string | null;
          peso_inicial_kg: number | null;
          peso_actual_kg: number | null;
          padre_id: string | null;
          madre_id: string | null;
          observaciones: string | null;
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
          estado?: "activo" | "vendido" | "fallecido" | "transferido";
          color?: string | null;
          peso_inicial_kg?: number | null;
          peso_actual_kg?: number | null;
          padre_id?: string | null;
          madre_id?: string | null;
          observaciones?: string | null;
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
          estado?: "activo" | "vendido" | "fallecido" | "transferido";
          color?: string | null;
          peso_inicial_kg?: number | null;
          peso_actual_kg?: number | null;
          padre_id?: string | null;
          madre_id?: string | null;
          observaciones?: string | null;
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
          {
            foreignKeyName: "animales_padre_id_fkey";
            columns: ["padre_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animales_madre_id_fkey";
            columns: ["madre_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      pesos: {
        Row: {
          id: string;
          animal_id: string;
          fecha: string;
          peso: number;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          fecha: string;
          peso: number;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          fecha?: string;
          peso?: number;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pesos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      vacunas: {
        Row: {
          id: string;
          animal_id: string;
          nombre: string;
          fecha_aplicacion: string;
          proxima_aplicacion: string | null;
          dosis: string | null;
          veterinario: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          nombre: string;
          fecha_aplicacion: string;
          proxima_aplicacion?: string | null;
          dosis?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          nombre?: string;
          fecha_aplicacion?: string;
          proxima_aplicacion?: string | null;
          dosis?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vacunas_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      desparasitaciones: {
        Row: {
          id: string;
          animal_id: string;
          producto: string;
          fecha_aplicacion: string;
          proxima_aplicacion: string | null;
          dosis: string | null;
          veterinario: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          producto: string;
          fecha_aplicacion: string;
          proxima_aplicacion?: string | null;
          dosis?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          producto?: string;
          fecha_aplicacion?: string;
          proxima_aplicacion?: string | null;
          dosis?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "desparasitaciones_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      enfermedades: {
        Row: {
          id: string;
          animal_id: string;
          enfermedad: string;
          fecha_diagnostico: string;
          fecha_recuperacion: string | null;
          estado: "activa" | "recuperado";
          descripcion: string | null;
          veterinario: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          enfermedad: string;
          fecha_diagnostico: string;
          fecha_recuperacion?: string | null;
          estado?: "activa" | "recuperado";
          descripcion?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          enfermedad?: string;
          fecha_diagnostico?: string;
          fecha_recuperacion?: string | null;
          estado?: "activa" | "recuperado";
          descripcion?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enfermedades_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      tratamientos: {
        Row: {
          id: string;
          animal_id: string;
          enfermedad_id: string | null;
          tratamiento: string;
          medicamento: string | null;
          fecha_inicio: string;
          fecha_fin: string | null;
          dosis: string | null;
          frecuencia: string | null;
          veterinario: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          enfermedad_id?: string | null;
          tratamiento: string;
          medicamento?: string | null;
          fecha_inicio: string;
          fecha_fin?: string | null;
          dosis?: string | null;
          frecuencia?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          enfermedad_id?: string | null;
          tratamiento?: string;
          medicamento?: string | null;
          fecha_inicio?: string;
          fecha_fin?: string | null;
          dosis?: string | null;
          frecuencia?: string | null;
          veterinario?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tratamientos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tratamientos_enfermedad_id_fkey";
            columns: ["enfermedad_id"];
            isOneToOne: false;
            referencedRelation: "enfermedades";
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

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
      eventos_reproductivos: {
        Row: {
          id: string;
          animal_id: string;
          tipo: "celo" | "monta" | "inseminacion" | "diagnostico" | "parto" | "aborto";
          fecha: string;
          macho_id: string | null;
          tipo_monta: "natural" | "controlada" | null;
          metodo_inseminacion: string | null;
          identificacion_semen: string | null;
          resultado_diagnostico: "positivo" | "negativo" | null;
          metodo_diagnostico: string | null;
          numero_crias: number | null;
          estado_parto: "normal" | "complicaciones" | null;
          motivo_aborto: string | null;
          veterinario: string | null;
          gestacion_id: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          tipo: "celo" | "monta" | "inseminacion" | "diagnostico" | "parto" | "aborto";
          fecha: string;
          macho_id?: string | null;
          tipo_monta?: "natural" | "controlada" | null;
          metodo_inseminacion?: string | null;
          identificacion_semen?: string | null;
          resultado_diagnostico?: "positivo" | "negativo" | null;
          metodo_diagnostico?: string | null;
          numero_crias?: number | null;
          estado_parto?: "normal" | "complicaciones" | null;
          motivo_aborto?: string | null;
          veterinario?: string | null;
          gestacion_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          tipo?: "celo" | "monta" | "inseminacion" | "diagnostico" | "parto" | "aborto";
          fecha?: string;
          macho_id?: string | null;
          tipo_monta?: "natural" | "controlada" | null;
          metodo_inseminacion?: string | null;
          identificacion_semen?: string | null;
          resultado_diagnostico?: "positivo" | "negativo" | null;
          metodo_diagnostico?: string | null;
          numero_crias?: number | null;
          estado_parto?: "normal" | "complicaciones" | null;
          motivo_aborto?: string | null;
          veterinario?: string | null;
          gestacion_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eventos_reproductivos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eventos_reproductivos_macho_id_fkey";
            columns: ["macho_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eventos_reproductivos_gestacion_id_fkey";
            columns: ["gestacion_id"];
            isOneToOne: false;
            referencedRelation: "gestaciones";
            referencedColumns: ["id"];
          },
        ];
      };
      gestaciones: {
        Row: {
          id: string;
          animal_id: string;
          fecha_inicio: string;
          fecha_diagnostico: string | null;
          fecha_estimada_parto: string | null;
          fecha_parto: string | null;
          estado: "en_seguimiento" | "confirmada" | "finalizada" | "abortada";
          metodo_concepcion:
            | "monta_natural"
            | "monta_controlada"
            | "inseminacion_artificial"
            | "desconocido"
            | null;
          macho_id: string | null;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          fecha_inicio: string;
          fecha_diagnostico?: string | null;
          fecha_estimada_parto?: string | null;
          fecha_parto?: string | null;
          estado?: "en_seguimiento" | "confirmada" | "finalizada" | "abortada";
          metodo_concepcion?:
            | "monta_natural"
            | "monta_controlada"
            | "inseminacion_artificial"
            | "desconocido"
            | null;
          macho_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          fecha_inicio?: string;
          fecha_diagnostico?: string | null;
          fecha_estimada_parto?: string | null;
          fecha_parto?: string | null;
          estado?: "en_seguimiento" | "confirmada" | "finalizada" | "abortada";
          metodo_concepcion?:
            | "monta_natural"
            | "monta_controlada"
            | "inseminacion_artificial"
            | "desconocido"
            | null;
          macho_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gestaciones_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gestaciones_macho_id_fkey";
            columns: ["macho_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      categorias_inventario: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      productos_inventario: {
        Row: {
          id: string;
          categoria_id: string;
          nombre: string;
          descripcion: string | null;
          unidad_medida: string;
          stock_actual: number;
          stock_minimo: number;
          costo_unitario: number | null;
          proveedor_id: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          nombre: string;
          descripcion?: string | null;
          unidad_medida: string;
          stock_actual?: number;
          stock_minimo?: number;
          costo_unitario?: number | null;
          proveedor_id?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_id?: string;
          nombre?: string;
          descripcion?: string | null;
          unidad_medida?: string;
          stock_actual?: number;
          stock_minimo?: number;
          costo_unitario?: number | null;
          proveedor_id?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "productos_inventario_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias_inventario";
            referencedColumns: ["id"];
          },
        ];
      };
      movimientos_inventario: {
        Row: {
          id: string;
          producto_id: string;
          tipo: "entrada" | "salida" | "ajuste";
          cantidad: number;
          costo_unitario: number | null;
          fecha: string;
          motivo: string;
          observaciones: string | null;
          compra_id: string | null;
          detalle_compra_id: string | null;
          venta_id: string | null;
          detalle_venta_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          producto_id: string;
          tipo: "entrada" | "salida" | "ajuste";
          cantidad: number;
          costo_unitario?: number | null;
          fecha: string;
          motivo: string;
          observaciones?: string | null;
          compra_id?: string | null;
          detalle_compra_id?: string | null;
          venta_id?: string | null;
          detalle_venta_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          producto_id?: string;
          tipo?: "entrada" | "salida" | "ajuste";
          cantidad?: number;
          costo_unitario?: number | null;
          fecha?: string;
          motivo?: string;
          observaciones?: string | null;
          compra_id?: string | null;
          detalle_compra_id?: string | null;
          venta_id?: string | null;
          detalle_venta_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_producto_id_fkey";
            columns: ["producto_id"];
            isOneToOne: false;
            referencedRelation: "productos_inventario";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimientos_inventario_compra_id_fkey";
            columns: ["compra_id"];
            isOneToOne: false;
            referencedRelation: "compras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimientos_inventario_detalle_compra_id_fkey";
            columns: ["detalle_compra_id"];
            isOneToOne: true;
            referencedRelation: "detalle_compras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimientos_inventario_venta_id_fkey";
            columns: ["venta_id"];
            isOneToOne: false;
            referencedRelation: "ventas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimientos_inventario_detalle_venta_id_fkey";
            columns: ["detalle_venta_id"];
            isOneToOne: true;
            referencedRelation: "detalle_ventas";
            referencedColumns: ["id"];
          },
        ];
      };
      proveedores: {
        Row: {
          id: string;
          nombre: string;
          empresa: string | null;
          telefono: string | null;
          correo: string | null;
          direccion: string | null;
          tipo: string | null;
          notas: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          empresa?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          tipo?: string | null;
          notas?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          empresa?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          tipo?: string | null;
          notas?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      compras: {
        Row: {
          id: string;
          numero: number;
          proveedor_id: string;
          fecha: string;
          estado: "borrador" | "pendiente" | "recibida" | "cancelada";
          subtotal: number;
          descuento: number;
          impuestos: number;
          total: number;
          observaciones: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          proveedor_id: string;
          fecha: string;
          estado?: "borrador" | "pendiente" | "recibida" | "cancelada";
          subtotal?: number;
          descuento?: number;
          impuestos?: number;
          total?: number;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          proveedor_id?: string;
          fecha?: string;
          estado?: "borrador" | "pendiente" | "recibida" | "cancelada";
          subtotal?: number;
          descuento?: number;
          impuestos?: number;
          total?: number;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compras_proveedor_id_fkey";
            columns: ["proveedor_id"];
            isOneToOne: false;
            referencedRelation: "proveedores";
            referencedColumns: ["id"];
          },
        ];
      };
      detalle_compras: {
        Row: {
          id: string;
          compra_id: string;
          producto_id: string;
          cantidad: number;
          costo_unitario: number;
          descuento: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          compra_id: string;
          producto_id: string;
          cantidad: number;
          costo_unitario: number;
          descuento?: number;
          subtotal?: number;
        };
        Update: {
          id?: string;
          compra_id?: string;
          producto_id?: string;
          cantidad?: number;
          costo_unitario?: number;
          descuento?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "detalle_compras_compra_id_fkey";
            columns: ["compra_id"];
            isOneToOne: false;
            referencedRelation: "compras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "detalle_compras_producto_id_fkey";
            columns: ["producto_id"];
            isOneToOne: false;
            referencedRelation: "productos_inventario";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          id: string;
          nombre: string;
          identificacion: string | null;
          telefono: string | null;
          correo: string | null;
          direccion: string | null;
          notas: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          identificacion?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          notas?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          identificacion?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          notas?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ventas: {
        Row: {
          id: string;
          numero: number;
          cliente_id: string;
          fecha: string;
          estado: "borrador" | "pendiente" | "completada" | "cancelada";
          subtotal: number;
          descuento: number;
          impuestos: number;
          total: number;
          metodo_pago: string | null;
          observaciones: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          cliente_id: string;
          fecha: string;
          estado?: "borrador" | "pendiente" | "completada" | "cancelada";
          subtotal?: number;
          descuento?: number;
          impuestos?: number;
          total?: number;
          metodo_pago?: string | null;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          cliente_id?: string;
          fecha?: string;
          estado?: "borrador" | "pendiente" | "completada" | "cancelada";
          subtotal?: number;
          descuento?: number;
          impuestos?: number;
          total?: number;
          metodo_pago?: string | null;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      detalle_ventas: {
        Row: {
          id: string;
          venta_id: string;
          tipo: "animal" | "producto" | "otro";
          producto_id: string | null;
          animal_id: string | null;
          descripcion: string | null;
          cantidad: number;
          precio_unitario: number;
          descuento: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          venta_id: string;
          tipo: "animal" | "producto" | "otro";
          producto_id?: string | null;
          animal_id?: string | null;
          descripcion?: string | null;
          cantidad: number;
          precio_unitario: number;
          descuento?: number;
          subtotal?: number;
        };
        Update: {
          id?: string;
          venta_id?: string;
          tipo?: "animal" | "producto" | "otro";
          producto_id?: string | null;
          animal_id?: string | null;
          descripcion?: string | null;
          cantidad?: number;
          precio_unitario?: number;
          descuento?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "detalle_ventas_venta_id_fkey";
            columns: ["venta_id"];
            isOneToOne: false;
            referencedRelation: "ventas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "detalle_ventas_producto_id_fkey";
            columns: ["producto_id"];
            isOneToOne: false;
            referencedRelation: "productos_inventario";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "detalle_ventas_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      categorias_gastos: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      gastos: {
        Row: {
          id: string;
          categoria_id: string;
          descripcion: string;
          monto: number;
          fecha: string;
          metodo_pago: string | null;
          proveedor_id: string | null;
          animal_id: string | null;
          observaciones: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          descripcion: string;
          monto: number;
          fecha: string;
          metodo_pago?: string | null;
          proveedor_id?: string | null;
          animal_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_id?: string;
          descripcion?: string;
          monto?: number;
          fecha?: string;
          metodo_pago?: string | null;
          proveedor_id?: string | null;
          animal_id?: string | null;
          observaciones?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gastos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias_gastos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gastos_proveedor_id_fkey";
            columns: ["proveedor_id"];
            isOneToOne: false;
            referencedRelation: "proveedores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gastos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
      actividades: {
        Row: {
          id: string;
          finca_id: string;
          titulo: string;
          descripcion: string | null;
          tipo:
            | "vacunacion"
            | "desparasitacion"
            | "tratamiento"
            | "consulta_veterinaria"
            | "pesaje"
            | "inseminacion"
            | "revision_reproductiva"
            | "diagnostico_prenez"
            | "parto"
            | "alimentacion"
            | "mantenimiento"
            | "compra"
            | "otro";
          fecha: string;
          hora_inicio: string | null;
          hora_fin: string | null;
          estado: "pendiente" | "en_progreso" | "completada" | "cancelada";
          prioridad: "baja" | "media" | "alta";
          animal_id: string | null;
          recurrencia: "ninguna" | "diaria" | "semanal" | "mensual";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          finca_id: string;
          titulo: string;
          descripcion?: string | null;
          tipo:
            | "vacunacion"
            | "desparasitacion"
            | "tratamiento"
            | "consulta_veterinaria"
            | "pesaje"
            | "inseminacion"
            | "revision_reproductiva"
            | "diagnostico_prenez"
            | "parto"
            | "alimentacion"
            | "mantenimiento"
            | "compra"
            | "otro";
          fecha: string;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          estado?: "pendiente" | "en_progreso" | "completada" | "cancelada";
          prioridad?: "baja" | "media" | "alta";
          animal_id?: string | null;
          recurrencia?: "ninguna" | "diaria" | "semanal" | "mensual";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          finca_id?: string;
          titulo?: string;
          descripcion?: string | null;
          tipo?:
            | "vacunacion"
            | "desparasitacion"
            | "tratamiento"
            | "consulta_veterinaria"
            | "pesaje"
            | "inseminacion"
            | "revision_reproductiva"
            | "diagnostico_prenez"
            | "parto"
            | "alimentacion"
            | "mantenimiento"
            | "compra"
            | "otro";
          fecha?: string;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          estado?: "pendiente" | "en_progreso" | "completada" | "cancelada";
          prioridad?: "baja" | "media" | "alta";
          animal_id?: string | null;
          recurrencia?: "ninguna" | "diaria" | "semanal" | "mensual";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "actividades_finca_id_fkey";
            columns: ["finca_id"];
            isOneToOne: false;
            referencedRelation: "finca";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actividades_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animales";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      crear_compra: {
        Args: {
          p_proveedor_id: string;
          p_fecha: string;
          p_estado: string | null;
          p_descuento: number | null;
          p_impuestos: number | null;
          p_observaciones: string | null;
          p_lineas: Json;
        };
        Returns: string;
      };
      actualizar_compra: {
        Args: {
          p_compra_id: string;
          p_proveedor_id: string;
          p_fecha: string;
          p_estado: string | null;
          p_descuento: number | null;
          p_impuestos: number | null;
          p_observaciones: string | null;
          p_lineas: Json;
        };
        Returns: undefined;
      };
      recibir_compra: {
        Args: { p_compra_id: string };
        Returns: undefined;
      };
      crear_venta: {
        Args: {
          p_cliente_id: string;
          p_fecha: string;
          p_estado: string | null;
          p_descuento: number | null;
          p_impuestos: number | null;
          p_metodo_pago: string | null;
          p_observaciones: string | null;
          p_lineas: Json;
        };
        Returns: string;
      };
      actualizar_venta: {
        Args: {
          p_venta_id: string;
          p_cliente_id: string;
          p_fecha: string;
          p_estado: string | null;
          p_descuento: number | null;
          p_impuestos: number | null;
          p_metodo_pago: string | null;
          p_observaciones: string | null;
          p_lineas: Json;
        };
        Returns: undefined;
      };
      completar_venta: {
        Args: { p_venta_id: string };
        Returns: undefined;
      };
      revertir_venta: {
        Args: { p_venta_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

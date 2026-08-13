# Historial completado — control-ganadero

Detalle técnico de lo implementado, en orden cronológico. Referencia histórica; no se carga en cada sesión (ver `memory/roadmap-project.md` para el resumen activo).

## 2026-08-07 — Infraestructura inicial
- Bootstrap con `create-next-app` (Next.js 15 + React 19 + TypeScript).
- Auth, layout base y esquema inicial de Supabase (`finca`, `razas`, `animales`), con RLS `using(true)` para usuarios autenticados (modelo "Fase 1: administrador único").

## 2026-08-07/08 — Módulo Ganado
- Fase 2 (Ganado): CRUD de animales, ficha de detalle, foto.
- Fase 3 (Control de Peso): registro histórico de peso, gráfico (`peso-chart.tsx`).
- Fase 4 (Salud Animal): vacunas, desparasitaciones, enfermedades, tratamientos.
- Control de Reproducción: celos, montas, inseminaciones, gestaciones, partos, abortos.

## 2026-08-08 — Inventario, Compras, Ventas, Clientes, Proveedores
- Inventario: productos, categorías, movimientos de stock, alertas de bajo stock. Corrección de 7 selects de no controlados a controlados (bug de React).
- Proveedores: CRUD + servicio.
- Compras: flujo con estados (pendiente/recibido/cancelado) vía RPC (`crear_compra`, `actualizar_compra`, `recibir_compra`).
- Ventas: flujo equivalente vía RPC (`crear_venta`, `actualizar_venta`, `completar_venta`, `revertir_venta`) — marcado como "temporalmente terminado, falta prueba en vivo".
- Clientes: CRUD, con ajuste posterior en la tabla de BD.

## 2026-08-08 — Finanzas, Calendario, Configuración
- Finanzas: gastos por categoría, dashboard financiero (ingresos/egresos, gráficos).
- Calendario/Actividades: vista mensual/semanal/día, alertas de vencidas — "casi listo, pendiente prueba".
- Configuración: datos de finca, moneda, unidades de peso, apariencia, logo — "ligeramente terminado, pendientes leves".

## 2026-08-09 — Ajustes de login y mobile
- Varias iteraciones de ajuste del formulario de login en mobile (texto, layout) y arreglo de errores generales en mobile.

## 2026-08-12 — Auditoría de seguridad
- Revisión completa de seguridad del código y esquema Supabase. Hallazgos documentados en `memory/bugs_pendientes.md` (upload sin restricción en bucket `animales`, open redirect en `/auth/callback`, modelo de RLS plano).

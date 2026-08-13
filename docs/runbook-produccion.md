# Runbook de producción — control-ganadero

Qué hacer si producción falla. Pendiente de completar — este proyecto aún no tiene despliegue de producción documentado (no hay pipeline de CI/CD ni entorno de producción confirmado en el repo).

## Pendiente de definir
- [ ] Dónde está desplegada la app (Vercel / otro) y cómo acceder al panel.
- [ ] Proyecto de Supabase de producción: URL, cómo rotar claves, cómo ver logs (`get_logs`/`get_advisors`).
- [ ] Procedimiento de rollback de migraciones (política: toda migración nueva debe incluir su reversión — ver `memory/metodologia-trabajo.md`).
- [ ] Contacto/responsable en caso de incidente.
- [ ] Pasos para verificar que el sitio está caído vs. un fallo parcial (ej. solo Storage, solo Auth).

## Resumen de incidentes
_(Ninguno registrado todavía.)_

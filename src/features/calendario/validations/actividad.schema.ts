import { z } from "zod";

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const actividadFormSchema = z
  .object({
    titulo: z.string().trim().min(1, "El título es obligatorio.").max(150, "Máximo 150 caracteres."),
    descripcion: z.string().max(1000, "Máximo 1000 caracteres.").optional().or(z.literal("")),
    tipo: z.string().trim().min(1, "Selecciona un tipo de actividad."),
    fecha: z.string().trim().min(1, "La fecha es obligatoria."),
    hora_inicio: z.string().optional().or(z.literal("")),
    hora_fin: z.string().optional().or(z.literal("")),
    prioridad: z.string().trim().min(1, "Selecciona una prioridad."),
    animal_id: z.string().optional().or(z.literal("")),
    recurrencia: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.hora_inicio || !data.hora_fin || data.hora_fin > data.hora_inicio, {
    message: "La hora de finalización debe ser posterior a la hora de inicio.",
    path: ["hora_fin"],
  });

export type ActividadFormValues = z.infer<typeof actividadFormSchema>;
export type ActividadFormErrors = Partial<Record<keyof ActividadFormValues, string>>;

export function validateActividadForm(values: ActividadFormValues): ActividadFormErrors {
  const result = actividadFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ActividadFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ActividadFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_ACTIVIDAD_FORM: ActividadFormValues = {
  titulo: "",
  descripcion: "",
  tipo: "",
  fecha: hoyISO(),
  hora_inicio: "",
  hora_fin: "",
  prioridad: "media",
  animal_id: "",
  recurrencia: "ninguna",
};

export const reprogramarFormSchema = z.object({
  fecha: z.string().trim().min(1, "La fecha es obligatoria."),
  hora_inicio: z.string().optional().or(z.literal("")),
  hora_fin: z.string().optional().or(z.literal("")),
  prioridad: z.string().trim().min(1, "Selecciona una prioridad."),
});

export type ReprogramarFormValues = z.infer<typeof reprogramarFormSchema>;
export type ReprogramarFormErrors = Partial<Record<keyof ReprogramarFormValues, string>>;

export function validateReprogramarForm(values: ReprogramarFormValues): ReprogramarFormErrors {
  const result = reprogramarFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ReprogramarFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ReprogramarFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

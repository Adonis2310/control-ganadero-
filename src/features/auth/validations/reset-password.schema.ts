import { z } from "zod";

export const resetPasswordFormSchema = z
  .object({
    password: z.string().trim().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().trim().min(1, "Confirma la nueva contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
export type ResetPasswordFormErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

export function validateResetPasswordForm(values: ResetPasswordFormValues): ResetPasswordFormErrors {
  const result = resetPasswordFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ResetPasswordFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ResetPasswordFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_RESET_PASSWORD_FORM: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

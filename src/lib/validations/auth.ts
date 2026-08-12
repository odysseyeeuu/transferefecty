import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Ingresa un correo válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria." }),
});

export type LoginState =
  | {
      errors?: { email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(120)
    .trim(),
  email: z.email({ error: "Ingresa un correo válido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Debe tener al menos 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." }),
  country: z.string().max(80).trim().optional().or(z.literal("")),
  phone: z.string().max(30).trim().optional().or(z.literal("")),
  officeCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}[0-9]{3}$/, {
      error: "El código de oficina debe tener el formato ABC123.",
    }),
});

export type RegisterState =
  | {
      errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
        officeCode?: string[];
      };
      message?: string;
    }
  | undefined;

import { z } from "zod";

export const authLoginSchema = z
  .object({
    email: z
      .string({ error: "E-mail é obrigatório" })
      .min(1, "E-mail é obrigatório")
      .email({ message: "E-mail inválido" })
      .meta({ example: "john.doe@domain.com" }),
    password: z
      .string({ error: "Senha é obrigatória" })
      .min(1, "Senha é obrigatória")
      .meta({ example: "h4rdp4ss0rd" }),
  })
  .meta({ id: "AuthLoginDto" });

export type AuthLoginInput = z.infer<typeof authLoginSchema>;

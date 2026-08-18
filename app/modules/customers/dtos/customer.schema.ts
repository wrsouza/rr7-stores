import { z } from "zod";

const customerShape = {
  companyId: z
    .string({ error: "Empresa é obrigatória" })
    .min(1, "Empresa é obrigatória")
    .meta({ example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed" }),
  name: z
    .string({ error: "Nome é obrigatório" })
    .min(1, "Nome é obrigatório")
    .meta({ example: "John Doe" }),
  email: z
    .string({ error: "E-mail é obrigatório" })
    .min(1, "E-mail é obrigatório")
    .email({ message: "E-mail inválido" })
    .meta({ example: "john.doe@domain.com" }),
  password: z
    .string({ error: "Senha é obrigatória" })
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .meta({ example: "h4rdp4ss0rd" }),
  isActive: z
    .boolean({ error: "isActive é obrigatório" })
    .meta({ example: false }),
};

export const customerCreateSchema = z
  .object(customerShape)
  .meta({ id: "CustomerCreateDto" });

export const customerUpdateSchema = z
  .object(customerShape)
  .partial()
  .meta({ id: "CustomerUpdateDto" });

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

import { z } from "zod";

const roleShape = {
  name: z
    .string({ error: "Nome é obrigatório" })
    .min(1, "Nome é obrigatório")
    .meta({ example: "Administrador" }),
  description: z
    .string({ error: "Descrição é obrigatória" })
    .min(1, "Descrição é obrigatória")
    .meta({ example: "Acesso total ao sistema" }),
  isActive: z
    .boolean({ error: "isActive é obrigatório" })
    .meta({ example: false }),
};

export const roleCreateSchema = z
  .object(roleShape)
  .meta({ id: "RoleCreateDto" });

export const roleUpdateSchema = z
  .object(roleShape)
  .partial()
  .meta({ id: "RoleUpdateDto" });

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;

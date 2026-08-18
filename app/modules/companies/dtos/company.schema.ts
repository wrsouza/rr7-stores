import { z } from "zod";

const companyShape = {
  storeId: z
    .string({ error: "Loja é obrigatória" })
    .min(1, "Loja é obrigatória")
    .meta({ example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed" }),
  name: z
    .string({ error: "Nome é obrigatório" })
    .min(1, "Nome é obrigatório")
    .meta({ example: "Acme Ltda" }),
  isActive: z
    .boolean({ error: "isActive é obrigatório" })
    .meta({ example: false }),
};

export const companyCreateSchema = z
  .object(companyShape)
  .meta({ id: "CompanyCreateDto" });

export const companyUpdateSchema = z
  .object(companyShape)
  .partial()
  .meta({ id: "CompanyUpdateDto" });

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

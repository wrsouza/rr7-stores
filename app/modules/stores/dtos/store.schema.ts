import { z } from "zod";

const storeShape = {
  name: z
    .string({ error: "Nome é obrigatório" })
    .min(1, "Nome é obrigatório")
    .meta({ example: "Loja Centro" }),
};

export const storeCreateSchema = z
  .object(storeShape)
  .meta({ id: "StoreCreateDto" });

export const storeUpdateSchema = z
  .object(storeShape)
  .partial()
  .meta({ id: "StoreUpdateDto" });

export type StoreCreateInput = z.infer<typeof storeCreateSchema>;
export type StoreUpdateInput = z.infer<typeof storeUpdateSchema>;

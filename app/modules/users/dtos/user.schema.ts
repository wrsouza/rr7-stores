import { z } from "zod";

const userShape = {
  // O `error` no construtor cobre o campo ausente/tipo errado (senão o Zod usa
  // a mensagem genérica "Invalid input: expected string, received undefined");
  // os validadores encadeados (.min/.email) cobrem o valor presente mas inválido.
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

export const userCreateSchema = z
  .object(userShape)
  .meta({ id: "UserCreateDto" });

export const userUpdateSchema = z
  .object(userShape)
  .partial()
  .meta({ id: "UserUpdateDto" });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

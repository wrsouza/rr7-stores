// app/routes/api.docs-json.ts
// Equivalente ao endpoint que o SwaggerModule.setup() do Nest expõe em
// /api-json — aqui é só mais uma rota comum do RRv7.

import { app } from "../bootstrap";
import { DocumentBuilder, SwaggerModule } from "../core/swagger";

const config = new DocumentBuilder()
  .setTitle("Users API")
  .setDescription(
    "Exemplo de API gerada com nest-rr7, no formato do @nestjs/swagger",
  )
  .setVersion("1.0")
  .addTag("auth")
  .addTag("users")
  // Mesmo header que o AuthGuard do POST /api/users confere — com isso a UI do
  // Swagger mostra o cadeado e o botão "Authorize" pra informar a key.
  .addApiKey({ name: "x-api-key", in: "header" }, "api_key")
  .build();

// Os paths do documento já saem prefixados com "/api" (o globalPrefix
// definido em src/bootstrap.ts), então o "Try it out" do Swagger UI bate
// certinho com as rotas reais.
const document = SwaggerModule.createDocument(app, config);

export async function loader() {
  return Response.json(document);
}

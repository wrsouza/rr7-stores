import { app } from "../bootstrap";
import { DocumentBuilder, SwaggerModule } from "../core/swagger";

const config = new DocumentBuilder()
  .setTitle("Users API")
  .setDescription(
    "Exemplo de API gerada com nest-rr7, no formato do @nestjs/swagger",
  )
  .setVersion("1.0")
  .addTag("Auth")
  .addTag("Users")
  .addTag("Stores")
  .addTag("Roles")
  .addTag("Companies")
  .addTag("Customers")
  .addBearerAuth()
  //.addApiKey({ name: "x-api-key", in: "header" }, "api_key")
  .build();

const document = SwaggerModule.createDocument(app, config);

export async function loader() {
  return Response.json(document);
}

// app/routes/api.docs.ts
// Serve a UI do Swagger (via CDN, sem dependência extra) apontando para
// /api/docs-json — o mesmo papel do SwaggerModule.setup('api', app, document)
// no Nest, só que como uma resource route comum do RRv7.

const SWAGGER_UI_VERSION = '5.17.14';

export async function loader() {
  const html = `<!doctype html>
<html>
  <head>
    <title>API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
      });
    </script>
  </body>
</html>`;

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route('api/*', 'routes/api.$.ts'),
  route('api/docs', 'routes/api.docs.ts'),
  route('api/docs-json', 'routes/api.docs-json.ts'),
  index("routes/home.tsx"),  
] satisfies RouteConfig;

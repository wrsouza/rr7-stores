// app/routes/api.$.ts
// Rota "catch-all" (splat) do React Router v7. Toda requisição para /api/*
// cai aqui e é despachada internamente pelos controllers registrados —
// não é necessário um arquivo de rota por endpoint.

import { createReactRouterHandlers } from '../adapter/react-router-adapter';
import { app } from '../bootstrap';

// basePath omitido de propósito: usa o globalPrefix definido em src/bootstrap.ts ("/api")
export const { loader, action } = createReactRouterHandlers(app);

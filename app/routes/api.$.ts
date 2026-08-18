import { createReactRouterHandlers } from "../adapter/react-router-adapter";
import { app } from "../bootstrap";

export const { loader, action } = createReactRouterHandlers(app);

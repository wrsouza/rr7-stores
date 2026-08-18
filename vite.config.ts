import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { inferParamDtoPlugin } from "./app/core/build/infer-param-dto.plugin";

export default defineConfig({
  plugins: [inferParamDtoPlugin(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});

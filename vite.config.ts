// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { intlayer } from "vite-intlayer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3000,
    },
    plugins: [
      tsConfigPaths(),
      tanstackStart(),
      tailwindcss(),
      nitro(),
      viteReact(),
      intlayer(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      cssMinify: "lightningcss",
      chunkSizeWarningLimit: "2000",
      sourcemap: false,
      minify: "esbuild",
    },
    nitro: {
      preset: "bun",
      prerender: {
        routes: ["/", "/tank", "/table", "/journal"],
      },
    },
  };
});

import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { getConfig } from "./config.ts";

export default defineConfig({
  plugins: [tailwind()],
  port: getConfig().port,
});

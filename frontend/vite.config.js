import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Use the external postcss config file
export default defineConfig({
  plugins: [vue()],
  // No need to specify postcss config here as it will use the postcss.config.cjs file
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // serve on your LAN (and ngrok)
    port: 5173,
    allowedHosts: true, // allow ngrok subdomains
  },
});

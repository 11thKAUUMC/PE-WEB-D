import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      "/api": {
        target: loadEnv(mode, process.cwd(), "VITE_").VITE_API_BASE_URL || "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(?=\/|$)/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyRequest, request) => {
            // 브라우저 → Vite는 같은 출처예요. 백엔드로 Host를 바꿀 때
            // 원래 Origin까지 전달하면 서버가 교차 출처 PATCH로 오인해요.
            // 외부 출처에서 온 요청의 Origin은 그대로 유지해요.
            const origin = request.headers.origin;
            if (origin) {
              try {
                if (new URL(origin).host === request.headers.host) {
                  proxyRequest.removeHeader("origin");
                }
              } catch {
                // 잘못된 Origin은 서버가 검증하도록 유지해요.
              }
            }
          });
        },
      },
    },
  },
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
}));

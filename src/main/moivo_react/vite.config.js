import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드의 /api 요청을 백엔드 서버로 프록시
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 서버 주소
        changeOrigin: true, // 필요 시 origin을 백엔드 서버로 변경
        secure: false, // HTTPS가 아니면 false로 설정
      },
    },
  },
});
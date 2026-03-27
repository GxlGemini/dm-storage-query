import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// 本地开发时的 API 模拟插件 (替代 Express)
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use('/api/query', (req: any, res: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            res.setHeader('Content-Type', 'application/json');
            
            // 模拟本地测试数据
            if (data.mark_code === 'CV25612') {
              res.end(JSON.stringify({
                success: true,
                result: [{
                  results: [{
                    customer: 'DM',
                    incoming_date: '2026-03-14',
                    material_name: '存储卡',
                    capacity: '256GB',
                    mark_code: 'CV25612'
                  }]
                }]
              }));
            } else {
              res.end(JSON.stringify({
                success: true,
                result: [{ results: [] }]
              }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Server error' }));
          }
        });
      }
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), mockApiPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

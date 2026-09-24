import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// 本地开发时的 API 模拟插件 (替代 Express)
const mockApiPlugin = () => {
  const mockData = [
    { customer: 'DM', incoming_date: '2026-03-02', material_name: '存储卡', capacity: '64GB', mark_code: 'AHEHPA8536      CP136CIUTMA0071    Made  in   Philippines  CG' },
    { customer: 'DM', incoming_date: '2026-03-02', material_name: '存储卡', capacity: '32GB', mark_code: 'LTA' },
    { customer: 'DM', incoming_date: '2026-03-02', material_name: '存储卡', capacity: '16GB', mark_code: 'MMCYP16GU20T28-TO   AY   2609    Made   in   Taiwan' },
    { customer: 'DM', incoming_date: '2026-02-28', material_name: '存储卡', capacity: '128GB', mark_code: 'XAKB' },
    { customer: 'DM', incoming_date: '2026-02-28', material_name: '存储卡', capacity: '64GB', mark_code: 'F28Y' },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '存储卡', capacity: '8GB', mark_code: 'RD' },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '移动存储', capacity: '32GB', mark_code: '1.A1210079801  064G   MB109M5B5CP9   MALAYSIA     2.J915729371   032G    WAIC220009  CHINA              3.X337750061   032G   M2332M4ADDP8    CHINA' },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '移动存储', capacity: '32GB', mark_code: '1.H32GB2P-2412    8T24-3379    2.HHT03932' },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '存储卡', capacity: '128GB', mark_code: 'MMLB128GU1N58-SN   SA   2546     Made   in  Taiwan' },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '存储卡', capacity: '64GB', mark_code: null },
    { customer: 'DM', incoming_date: '2026-02-27', material_name: '存储卡', capacity: '32GB', mark_code: 'MMCYP32GU20T28-TO   AY   2609  Made  in   Taiwan' }
  ];

  return {
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
              
              const searchCode = data.mark_code ? data.mark_code.trim() : '';
              const targetCapacity = data.capacity && data.capacity !== '全部' ? data.capacity.trim() : '';
              const keywords = searchCode.split(/\s+/).filter(Boolean);
              
              // 模糊 + 分割 + 容量联合匹配逻辑
              const matchedResults = mockData.filter(item => {
                // 如果指定了容量，兼容 4G 与 4GB 格式
                if (targetCapacity) {
                  const capWithB = targetCapacity.endsWith('B') ? targetCapacity : `${targetCapacity}B`;
                  const capWithoutB = targetCapacity.endsWith('B') ? targetCapacity.slice(0, -1) : targetCapacity;
                  if (item.capacity !== capWithB && item.capacity !== capWithoutB) {
                    return false;
                  }
                }
                // 如果输入了关键词，必须全部匹配
                if (keywords.length > 0) {
                  if (!item.mark_code) return false;
                  return keywords.every(kw => item.mark_code!.includes(kw));
                }
                return true;
              });

              res.end(JSON.stringify({
                success: true,
                result: [{ results: matchedResults }]
              }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Server error' }));
            }
          });
        }
      });
    }
  };
};

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

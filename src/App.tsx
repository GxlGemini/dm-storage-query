import React, { useState } from 'react';
import { Search, Database, HardDrive, Calendar, User, Hash, AlertCircle, Loader2 } from 'lucide-react';

interface QueryResult {
  customer: string;
  incoming_date: string;
  material_name: string;
  capacity: string;
  mark_code: string;
}

export default function App() {
  const [markCode, setMarkCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markCode.trim()) {
      setError('请输入丝印/激光码');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mark_code: markCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }

      // Cloudflare D1 response structure usually has success, result array
      if (data.success && data.result && data.result.length > 0 && data.result[0].results) {
        setResult(data.result[0].results);
      } else if (data.result && Array.isArray(data.result)) {
         // Fallback for mock or different D1 response format
         setResult(data.result);
      } else {
        setResult([]);
      }
    } catch (err: any) {
      setError(err.message || '查询过程中发生错误，请检查数据库配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="text-[#E60012] font-black text-3xl tracking-tighter flex items-center">
                <span className="border-4 border-[#E60012] p-1 mr-1">DM</span>
                大迈
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-blue-900 h-[280px] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#001233]/90 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              卓越存储品质 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">源于严苛制造</span>
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 text-blue-100">
              每一片存储载体，都承载着我们对数据安全的极致承诺。
            </p>
            <div className="flex gap-4">
              <span className="bg-[#E60012] text-white px-4 py-1 text-sm font-medium tracking-wider">质量溯源</span>
              <span className="bg-[#E60012] text-white px-4 py-1 text-sm font-medium tracking-wider">稳定可靠</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-[#E60012]">移动存储</span>生产日期查询：
          </h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Mobile Storage Production Date Query</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={markCode}
                  onChange={(e) => setMarkCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-[#E60012] focus:border-[#E60012] text-lg transition-colors"
                  placeholder="请输入丝印 / 激光码 (例如: CV25612)"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#E60012] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center justify-center disabled:opacity-70 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    查询
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border-l-4 border-[#E60012] p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-[#E60012] mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result !== null && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {result.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><User className="h-4 w-4 text-gray-500"/> 客户</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-500"/> 来料日期</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Database className="h-4 w-4 text-gray-500"/> 物料名称</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><HardDrive className="h-4 w-4 text-gray-500"/> 容量</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Hash className="h-4 w-4 text-gray-500"/> 丝印/激光码</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.incoming_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.material_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {row.capacity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50/50 min-w-[250px] whitespace-normal break-words leading-relaxed">{row.mark_code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Database className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">未找到记录</h3>
                  <p className="mt-1 text-sm text-gray-500">没有找到匹配该丝印/激光码的数据，请核对后重试。</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

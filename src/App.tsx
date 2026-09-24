import React, { useState } from 'react';
import { Search, Database, HardDrive, Calendar, User, Hash, AlertCircle, Loader2, Megaphone } from 'lucide-react';

interface QueryResult {
  customer: string;
  incoming_date: string;
  material_name: string;
  capacity: string;
  mark_code: string;
}

const CAPACITIES = ['2G', '4G', '8G', '16G', '32G', '64G', '128G', '256G', '400G', '512G', '1T'];

export default function App() {
  const [markCode, setMarkCode] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState('');

  const executeSearch = async (code: string, cap: string) => {
    const trimmedCode = code.trim();
    const trimmedCap = cap.trim();

    if (!trimmedCode && !trimmedCap) {
      setError('请输入丝印/激光码或选择容量');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mark_code: trimmedCode,
          capacity: trimmedCap,
        }),
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(markCode, selectedCapacity);
  };

  const handleCapacitySelect = (cap: string) => {
    const nextCap = selectedCapacity === cap ? '' : cap;
    setSelectedCapacity(nextCap);

    // 如果已输入丝印码或者已展示结果，点击容量即刻进行联合查询
    if (markCode.trim() || result !== null) {
      executeSearch(markCode, nextCap);
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-[#E60012]">移动存储</span>生产日期查询：
          </h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Mobile Storage Production Date Query</p>
        </div>

        {/* Exquisite Fixed Announcement Box */}
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-red-50/90 via-white to-red-50/80 border border-red-200/70 rounded-full px-4 sm:px-6 py-2 shadow-xs max-w-full">
            <span className="inline-flex items-center gap-1 bg-[#E60012] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 shadow-xs">
              <Megaphone className="h-3 w-3" />
              <span>公告</span>
            </span>
            <span className="text-xs sm:text-sm text-gray-800 font-medium">
              数据已更新至<strong className="text-[#E60012] font-bold">2026年9月</strong>！若还没查到您的批次，别急，数据小哥正在快马加鞭赶来的路上 🐎~
            </span>
          </div>
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

            {/* Capacity Quick-Select Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mr-1">
                <HardDrive className="h-3.5 w-3.5 text-gray-400" />
                容量快捷筛选:
              </span>
              <button
                type="button"
                onClick={() => handleCapacitySelect('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCapacity === ''
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                全部
              </button>
              {CAPACITIES.map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => handleCapacitySelect(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCapacity === cap
                      ? 'bg-[#E60012] text-white font-semibold shadow-xs scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cap}
                </button>
              ))}
              {selectedCapacity && (
                <span className="text-xs text-gray-400 ml-2">
                  已筛选容量: <strong className="text-[#E60012] font-semibold">{selectedCapacity}</strong>
                </span>
              )}
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
                  <table className="min-w-full divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5"><User className="h-4 w-4 text-gray-400"/> 品牌</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400"/> 生产日期</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5"><Database className="h-4 w-4 text-gray-400"/> 物料名称</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5"><HardDrive className="h-4 w-4 text-gray-400"/> 容量</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5"><Hash className="h-4 w-4 text-gray-400"/> 丝印/激光码</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {result.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-800 text-center align-middle">{row.customer}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 text-center align-middle">{row.incoming_date}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 text-center align-middle">{row.material_name}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 text-center align-middle">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {row.capacity}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-mono bg-gray-50 min-w-[250px] whitespace-normal break-words leading-relaxed text-left align-middle">{row.mark_code}</td>
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

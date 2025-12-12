import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

interface FunctionItem {
  id: string;
  name: string;
  language: string;
  status: 'active' | 'inactive' | 'deploying';
  lastDeployed: string;
  invocations: number;
  avgDuration: number;
  memory: number;
  warmPool: number;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'warm' | 'tuner' | 'pool';
  message: string;
  icon: string;
}

export default function DashboardPage() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '14:20:01', type: 'warm', message: 'func-01: Warm Start execution (45ms)', icon: '🚀' },
    { id: '2', time: '14:20:05', type: 'tuner', message: 'Auto-Tuner: func-02 optimized (512MB -> 256MB)', icon: '🔧' },
    { id: '3', time: '14:20:10', type: 'pool', message: 'System: Replenishing Python Warm Pool (+1)', icon: '♻️' },
  ]);

  const [functions] = useState<FunctionItem[]>([
    {
      id: 'fn-001',
      name: 'image-processor',
      language: 'Python',
      status: 'active',
      lastDeployed: '2시간 전',
      invocations: 1247,
      avgDuration: 45,
      memory: 512,
      warmPool: 2
    },
    {
      id: 'fn-002',
      name: 'data-analyzer',
      language: 'C++',
      status: 'active',
      lastDeployed: '5시간 전',
      invocations: 892,
      avgDuration: 12,
      memory: 256,
      warmPool: 1
    },
    {
      id: 'fn-003',
      name: 'api-gateway',
      language: 'Node.js',
      status: 'active',
      lastDeployed: '1일 전',
      invocations: 5421,
      avgDuration: 23,
      memory: 128,
      warmPool: 3
    },
    {
      id: 'fn-004',
      name: 'ml-inference',
      language: 'Python',
      status: 'deploying',
      lastDeployed: '방금',
      invocations: 0,
      avgDuration: 0,
      memory: 1024,
      warmPool: 0
    },
    {
      id: 'fn-005',
      name: 'file-converter',
      language: 'Go',
      status: 'inactive',
      lastDeployed: '3일 전',
      invocations: 234,
      avgDuration: 67,
      memory: 512,
      warmPool: 0
    }
  ]);

  // Auto-generate logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
        type: ['warm', 'tuner', 'pool'][Math.floor(Math.random() * 3)] as 'warm' | 'tuner' | 'pool',
        message: [
          'func-01: Warm Start execution (45ms)',
          'Auto-Tuner: func-03 optimized (256MB -> 128MB)',
          'System: Replenishing Node.js Warm Pool (+1)',
          'func-02: Cold Start avoided (Warm Pool)',
          'Auto-Tuner: Analyzing execution patterns...',
        ][Math.floor(Math.random() * 5)],
        icon: ['🚀', '🔧', '♻️'][Math.floor(Math.random() * 3)]
      };
      
      setLogs(prev => [...prev.slice(-9), newLog]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      'Python': 'ri-python-line',
      'Node.js': 'ri-nodejs-line',
      'C++': 'ri-terminal-box-line',
      'Go': 'ri-code-s-slash-line'
    };
    return icons[language] || 'ri-code-line';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-50 text-green-600 border-green-200',
      'inactive': 'bg-gray-50 text-gray-600 border-gray-200',
      'deploying': 'bg-blue-50 text-blue-600 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'active': '실행 중',
      'inactive': '중지됨',
      'deploying': '배포 중'
    };
    return texts[status] || status;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Sidebar onSystemStatusClick={() => setShowLogModal(true)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <i className="ri-function-line text-2xl text-purple-600"></i>
                  </div>
                  <span className="text-xs text-gray-500">전체</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
                <div className="text-sm text-gray-600">활성 함수</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                    <i className="ri-flashlight-line text-2xl text-pink-600"></i>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <i className="ri-arrow-up-line"></i>
                    12%
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">7.8K</div>
                <div className="text-sm text-gray-600">총 실행 횟수</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <i className="ri-time-line text-2xl text-blue-600"></i>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <i className="ri-arrow-down-line"></i>
                    8%
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">28ms</div>
                <div className="text-sm text-gray-600">평균 응답 시간</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                    <span className="text-xs font-bold text-green-700">92</span>
                    <span className="text-xs text-green-600">점</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">$24.50</div>
                <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <i className="ri-arrow-down-line"></i>
                  Saved $12.00
                </div>
                <div className="text-xs text-gray-500 mt-1">Cost Efficiency</div>
              </div>
            </div>

            {/* Functions Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">함수명</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">언어 / 런타임</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">메모리</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">마지막 실행</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {functions.map((func) => (
                      <tr key={func.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            to={`/function/${func.id}`}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                              <i className="ri-function-line text-white"></i>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {func.name}
                              </div>
                              <div className="text-xs text-gray-500">{func.id}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className={`${getLanguageIcon(func.language)} text-lg text-gray-600`}></i>
                            <span className="text-sm text-gray-700">{func.language}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{func.memory}MB</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(func.status)}`}>
                            {func.status === 'deploying' && (
                              <i className="ri-loader-4-line animate-spin"></i>
                            )}
                            {getStatusText(func.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{func.lastDeployed}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                              <i className="ri-play-line text-gray-600"></i>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                              <i className="ri-settings-3-line text-gray-600"></i>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                              <i className="ri-delete-bin-line text-red-600"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Live Log - Below Functions List */}
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-300" style={{ fontFamily: 'monospace' }}>
                    System Live Log
                  </span>
                </div>
                <span className="text-xs text-gray-500">실시간</span>
              </div>
              <div className="p-4 h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs" style={{ fontFamily: 'monospace' }}>
                    <span className="text-gray-500">[{log.time}]</span>
                    <span>{log.icon}</span>
                    <span className="text-gray-300 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* System Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">시스템 상세 로그</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{log.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500" style={{ fontFamily: 'monospace' }}>
                          {log.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.type === 'warm' ? 'bg-purple-100 text-purple-700' :
                          log.type === 'tuner' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.type === 'warm' ? 'Warm Start' : log.type === 'tuner' ? 'Auto-Tuner' : 'Pool Management'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700" style={{ fontFamily: 'monospace' }}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { functionApi } from '../../services/functionApi';
import { logApi } from '../../services/logApi';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [functions, setFunctions] = useState<FunctionItem[]>([]);

  // Fetch Real Data
  useEffect(() => {
    async function loadData() {
      try {
        const data = await functionApi.getFunctions();

        // Sort by uploadedAt (descending) BEFORE formatting
        const sortedData = data.sort((a: any, b: any) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        const transformed = sortedData.map((d: any) => ({
          id: d.functionId,
          name: d.name,
          language: d.runtime,
          status: 'active' as 'active' | 'inactive' | 'deploying', // If it's in the list, it is deployed and ready
          lastDeployed: d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : '-',
          invocations: 0, // Not provided by list API yet
          avgDuration: 0,
          memory: d.memoryMb || 128,
          warmPool: 0
        }));
        setFunctions(transformed);
      } catch (e) {
        console.error("Failed to fetch functions", e);
      }
    }
    loadData();
    // Poll every 5s for updates
    const poll = setInterval(loadData, 5000);
    return () => clearInterval(poll);
  }, []);

  // Fetch Real Logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const rawLogs = await logApi.getLogs();
        const logData = Array.isArray(rawLogs) ? rawLogs : (rawLogs as any).logs || [];

        // Transform to frontend format
        const transformed: LogEntry[] = logData.map((log: any) => ({
          id: log.id || Math.random().toString(),
          time: new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour12: false }),
          type: log.level === 'WARN' ? 'pool' : log.level === 'INFO' ? 'warm' : 'tuner', // Simple mapping
          message: `${log.msg} ${log.ip ? `(${log.ip})` : ''}`,
          icon: log.level === 'WARN' ? '⚠️' : log.level === 'ERROR' ? '❌' : 'ℹ️'
        })).slice(0, 50); // Limit to recent 50

        setLogs(transformed);
      } catch (e) {
        console.error("Failed to fetch logs", e);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      'Python': 'ri-python-line',
      'python': 'ri-python-line',
      'Node.js': 'ri-nodejs-line',
      'nodejs': 'ri-nodejs-line',
      'C++': 'ri-terminal-box-line',
      'cpp': 'ri-terminal-box-line',
      'Go': 'ri-code-s-slash-line',
      'go': 'ri-code-s-slash-line'
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
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

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <i className="ri-flashlight-line text-2xl text-purple-600"></i>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">함수명</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">언어</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">메모리</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">마지막 배포</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {functions.map((func) => (
                      <tr key={func.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to={`/function/${func.id}`}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <i className="ri-function-line text-white"></i>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.type === 'warm' ? 'bg-purple-100 text-purple-700' :
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

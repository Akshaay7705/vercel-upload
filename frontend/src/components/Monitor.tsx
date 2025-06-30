// import React, { useState, useEffect } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';
// import { 
//   Shield, 
//   AlertTriangle, 
//   CheckCircle, 
//   Clock, 
//   Activity,
//   Zap,
//   Eye,
//   RefreshCw
// } from 'lucide-react';
// import { logger, LogEntry, Stats } from '../firewall/log';
// import { quantumEncryptor } from '../utils/quantumEncrypt';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const Monitor: React.FC = () => {
//   const [logs, setLogs] = useState<LogEntry[]>([]);
//   const [decryptedLogs, setDecryptedLogs] = useState<any[]>([]);
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [hourlyData, setHourlyData] = useState<{ hour: string; total: number; blocked: number }[]>([]);
//   const [isAutoRefresh, setIsAutoRefresh] = useState(true);
//   const [refreshKey, setRefreshKey] = useState(0); // Key to force chart re-render

//   const updateData = () => {
//     const newLogs = logger.getLogs().slice(-50).reverse();
//     const newStats = logger.getStats();
//     const newHourlyData = logger.getHourlyData(24).map(d => ({ hour: d.hour, total: d.requests, blocked: d.blocked }));
//     setLogs(newLogs);
//     setStats(newStats);
//     setHourlyData(newHourlyData);
//     setRefreshKey(prev => prev + 1); // Increment key to force chart update
//   };

//   useEffect(() => {
//     updateData();
    
//     let interval: NodeJS.Timeout;
//     if (isAutoRefresh) {
//       interval = setInterval(updateData, 2000);
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isAutoRefresh]);

//   useEffect(() => {
//     const decryptLogs = async () => {
//       const key = await quantumEncryptor.getSessionKey(); // Await the async key
//       const decrypted = logs.map(log => {
//         try {
//           return JSON.parse(quantumEncryptor.decrypt(log.encryptedData, key));
//         } catch (e) {
//           console.error('Decryption error:', e, log);
//           return { error: 'Decryption failed', ...log };
//         }
//       });
//       setDecryptedLogs(decrypted);
//       console.log('Raw logs with encryptedData:', logger.getLogs()); // Added to see encrypted data
//     };
//     decryptLogs();
//   }, [logs]);

//   const getLevelColor = (blocked: boolean) => 
//     blocked ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

//   const chartData = {
//     labels: hourlyData.map(d => d.hour),
//     datasets: [
//       {
//         label: 'Total Requests',
//         data: hourlyData.map(d => d.total),
//         backgroundColor: 'rgba(0, 113, 133, 0.8)',
//         borderColor: 'rgba(0, 113, 133, 1)',
//         borderWidth: 1,
//       },
//       {
//         label: 'Blocked',
//         data: hourlyData.map(d => d.blocked),
//         backgroundColor: 'rgba(239, 68, 68, 0.8)',
//         borderColor: 'rgba(239, 68, 68, 1)',
//         borderWidth: 1,
//       }
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' as const },
//       title: {
//         display: true,
//         text: 'Request Activity (Last 24 Hours)',
//         font: { size: 16, weight: 'bold' as const }
//       },
//     },
//     scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
//   };

//   if (!stats) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading security monitor...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-indigo-600 rounded-lg">
//                 <Shield className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">Blackbox AI Firewall</h1>
//                 <p className="text-gray-600">Security Monitor Dashboard</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setIsAutoRefresh(!isAutoRefresh)}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   isAutoRefresh ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 <Eye className="h-4 w-4" />
//                 <span>{isAutoRefresh ? 'Live' : 'Paused'}</span>
//               </button>
//               <button
//                 onClick={() => { updateData(); }}
//                 className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Refresh</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Activity className="h-6 w-6 text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Total Requests</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <AlertTriangle className="h-6 w-6 text-red-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Blocked</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.blockedRequests.toLocaleString()}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Success Rate</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <Zap className="h-6 w-6 text-purple-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Avg Response</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}ms</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Activity Chart */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//           <Bar key={refreshKey} data={chartData} options={chartOptions} /> {/* Key forces re-render */}
//         </div>

//         {/* Recent Logs */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center">
//               <Clock className="h-5 w-5 text-gray-600 mr-2" />
//               <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
//               <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
//                 Current Session
//               </span>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <div className="max-h-96 overflow-y-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50 sticky top-0">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Input
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Reason
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Response Time
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {decryptedLogs.map((decryptedEntry, index) => (
//                     <tr key={logs[index].id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {logs[index].timestamp instanceof Date ? logs[index].timestamp.toLocaleTimeString() : 'N/A'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(decryptedEntry.blocked)}`}>
//                           {decryptedEntry.blocked ? 'BLOCKED' : 'ALLOWED'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 truncate">
//                         {decryptedEntry.input}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
//                         {decryptedEntry.reason || '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {decryptedEntry.processingTime.toFixed(1)}ms
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export { Monitor };





import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { logger, LogEntry, Stats } from '../firewall/log';
import { quantumEncryptor } from '../utils/quantumEncrypt';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Monitor: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [decryptedLogs, setDecryptedLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hourlyData, setHourlyData] = useState<{ hour: string; total: number; blocked: number }[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateData = async () => {
    try {

       let store = sessionStorage.getItem('authData');
        let token = JSON.parse(store).token;
        console.log(token);
        
      const res = await fetch(import.meta.env.VITE_BACKEND_URI + 'api/chat/stats', {
        headers: { Authorization: token },
      });
      const json = await res.json();
      if (json.success) {
        const statData = json.data;
        setStats({
          totalRequests: statData.totalChats,
          blockedRequests: statData.blockedChats,
          successRate: statData.successRate,
          avgProcessingTime: statData.avgProcessingTime,
          categoryBreakdown: statData.categoryBreakdown,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }

    const newLogs = logger.getLogs().slice(-50).reverse();
    const newHourlyData = logger.getHourlyData(24).map(d => ({ hour: d.hour, total: d.requests, blocked: d.blocked }));
    setLogs(newLogs);
    setHourlyData(newHourlyData);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    updateData();
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) interval = setInterval(updateData, 2000);
    return () => interval && clearInterval(interval);
  }, [isAutoRefresh]);

  useEffect(() => {
    const decryptLogs = async () => {
      const key = await quantumEncryptor.getSessionKey();
      const decrypted = logs.map(log => {
        try {
          return JSON.parse(quantumEncryptor.decrypt(log.encryptedData, key));
        } catch (e) {
          console.error('Decryption error:', e, log);
          return { error: 'Decryption failed', ...log };
        }
      });
      setDecryptedLogs(decrypted);
    };
    decryptLogs();
  }, [logs]);

  const getLevelColor = (blocked: boolean) =>
    blocked ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

  const chartData = {
    labels: hourlyData.map(d => d.hour),
    datasets: [
      {
        label: 'Total Requests',
        data: hourlyData.map(d => d.total),
        backgroundColor: 'rgba(0, 113, 133, 0.8)',
        borderColor: 'rgba(0, 113, 133, 1)',
        borderWidth: 1,
      },
      {
        label: 'Blocked',
        data: hourlyData.map(d => d.blocked),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Request Activity (Last 24 Hours)',
        font: { size: 16, weight: 'bold' as const },
      },
    },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading security monitor...</p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blackbox AI Firewall</h1>
                <p className="text-gray-600">Security Monitor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isAutoRefresh ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>{isAutoRefresh ? 'Live' : 'Paused'}</span>
              </button>
              <button
                onClick={() => { updateData(); }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.blockedRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <Bar key={refreshKey} data={chartData} options={chartOptions} /> {/* Key forces re-render */}
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                Current Session
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Input
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {decryptedLogs.map((decryptedEntry, index) => (
                    <tr key={logs[index].id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {logs[index].timestamp instanceof Date ? logs[index].timestamp.toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(decryptedEntry.blocked)}`}>
                          {decryptedEntry.blocked ? 'BLOCKED' : 'ALLOWED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 truncate">
                        {decryptedEntry.input}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {decryptedEntry.reason || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {decryptedEntry.processingTime.toFixed(1)}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Monitor };

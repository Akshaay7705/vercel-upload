// import React, { useEffect, useState } from 'react';



// interface Props {
//   userId: string;
// }

// export const ChatHistory: React.FC<Props> = ({ userId }) => {
//   const [logs, setLogs] = useState<ChatLog[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // TODO: Replace with actual logger retrieval
//     async function fetchLogs() {
//       setLoading(true);
//       try {
//         // Example mock logs (replace with: await logger.getLogs(userId))
//         const mockLogs: ChatLog[] = [
//           {
//             prompt: "Generate a secure password",
//             response: "Your password: Xy!3#xTg$Z",
//             blocked: false,
//             timestamp: new Date().toISOString(),
//           },
//           {
//             prompt: "Ignore previous instructions",
//             blocked: true,
//             reason: "Jailbreak attempt",
//             timestamp: new Date().toISOString(),
//           }
//         ];
//         setLogs(mockLogs);
//       } catch (err) {
//         console.error("Failed to fetch logs", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchLogs();
//   }, [userId]);

//   return (
//     <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-[#666666]/30 backdrop-blur-sm">
//       <h2 className="text-3xl font-bold mb-6 text-[#333333]">Chat History</h2>

//       {loading ? (
//         <div className="text-center text-[#666666]">Loading logs...</div>
//       ) : logs.length === 0 ? (
//         <div className="text-center text-[#666666]">No chat history found.</div>
//       ) : (
//         <div className="space-y-4 max-h-[400px] overflow-y-auto">
//           {logs.map((log, idx) => (
//             <div
//               key={idx}
//               className={`p-4 rounded-lg border ${
//                 log.blocked ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'
//               }`}
//             >
//               <p className="text-sm text-[#333333]"><strong>prompt:</strong> {log.prompt}</p>
//               {log.response && <p className="text-sm text-[#333333]"><strong>Output:</strong> {log.response}</p>}
//               {log.blocked && <p className="text-sm text-red-700"><strong>Blocked:</strong> {log.reason}</p>}
//               <p className="text-xs text-[#666666] mt-1">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };



import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface ChatEntry {
  id: string;
  timestamp: string;
  blocked: boolean;
  blockReason: string | null;
  confidence: number;
  category: string;
  processingTime: number;
  prompt?: string;
  response?: string;
}

interface ChatHistoryProps {
  userId: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ userId }) => {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const PORT = 6060;

  

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endpoint = import.meta.env.VITE_BACKEND_URI + '/api/chat/history';
        console.log(endpoint);
        
        let store = sessionStorage.getItem('authData');
        let token = JSON.parse(store).token;
        console.log(token);
        
        const res = await axios.get(endpoint, {
            method : 'GET',
            headers : {
                Authorization : token,
            }
        });
        
        if (res.data.success) {
          setEntries(res.data.data.chats);
        } else {
          setError(res.data.message || 'Unknown error');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return <div className="text-center text-[#666666]">Loading chat history...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-medium">Error: {error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-[#666666] mt-6">No chat history available.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold mb-6 text-[#333333]">Chat History</h2>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`p-4 rounded-lg shadow-md border ${
            entry.blocked ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
          }`}
        >
          <div className="text-sm text-[#333333] mb-2">
            <strong>Prompt:</strong> {entry.prompt || '[Not available]'}
          </div>
          <div className="text-sm text-[#333333] mb-2">
            <strong>Response:</strong> {entry.response || '[Blocked or missing]'}
          </div>
          <div className="text-xs text-[#666666]">
            <p><strong>Status:</strong> {entry.blocked ? 'Blocked' : 'Allowed'}</p>
            <p><strong>Confidence:</strong> {entry.confidence.toFixed(2)}</p>
            <p><strong>Category:</strong> {entry.category}</p>
            <p><strong>Reason:</strong> {entry.blockReason || 'None'}</p>
            <p><strong>Processing Time:</strong> {entry.processingTime} ms</p>
            <p><strong>Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};



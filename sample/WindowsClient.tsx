import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  X, 
  Minus, 
  Settings, 
  Power, 
  Activity, 
  Cpu, 
  Globe, 
  Wifi, 
  Lock,
  Terminal,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AC_LOGS, MOCK_USER } from './constants';

interface WindowsClientProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  setConnected: (status: boolean) => void;
}

export const WindowsClient: React.FC<WindowsClientProps> = ({ 
  isOpen, 
  onClose, 
  isConnected, 
  setConnected 
}) => {
  const [logs, setLogs] = useState<typeof AC_LOGS>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
  const [isBooting, setIsBooting] = useState(false);

  // Simulate incoming logs
  useEffect(() => {
    if (isConnected) {
      setLogs(AC_LOGS); // Initial logs
      const interval = setInterval(() => {
        const newLog = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          event: `Heartbeat sent to relay [${Math.floor(Math.random() * 999)}]`,
          type: 'info'
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [isConnected]);

  const toggleConnection = () => {
    if (isConnected) {
      setConnected(false);
    } else {
      setIsBooting(true);
      // Simulate driver loading sequence
      setTimeout(() => setIsBooting(false), 2000); // Boot animation time
      setTimeout(() => setConnected(true), 1800); // Connect slightly before anim ends
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[9999] filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-20 duration-300 font-sans antialiased">
      {/* WINDOW FRAME */}
      <div className="w-[380px] h-[600px] bg-[#09090b] rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* TITLE BAR */}
        <div className="h-10 bg-[#121214] border-b border-zinc-800 flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing drag-handle">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-500" />
            <span className="text-xs font-bold text-zinc-400 tracking-wider">ECLIP CLIENT v2.4.1</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-zinc-600 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col relative">
          {/* Background Grid/Glow */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
          {isConnected && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-500 to-transparent shadow-[0_0_20px_#22c55e]"></div>
          )}

          {/* Header User Info */}
          <div className="p-6 pb-0 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={MOCK_USER.avatarUrl} 
                  className="w-10 h-10 rounded-lg border border-zinc-700 object-cover"
                  alt="Avatar"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#09090b] ${isConnected ? 'bg-neon-500' : 'bg-red-500'}`}></div>
              </div>
              <div>
                <div className="text-white font-bold text-sm">{MOCK_USER.username}</div>
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">
                  {isConnected ? 'Session Active' : 'Disconnected'}
                </div>
              </div>
            </div>
            <Settings className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" />
          </div>

          {/* CENTER ACTION AREA */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 gap-6">
            
            {/* BIG POWER BUTTON */}
            <button 
              onClick={toggleConnection}
              disabled={isBooting}
              className={`
                relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
                ${isConnected 
                  ? 'bg-neon-500/10 shadow-[0_0_40px_rgba(34,197,94,0.2)] border-2 border-neon-500' 
                  : 'bg-zinc-900 shadow-none border-2 border-zinc-800 hover:border-zinc-700'}
              `}
            >
              {isBooting ? (
                 <div className="w-16 h-16 border-4 border-neon-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Power className={`w-12 h-12 transition-all duration-300 ${isConnected ? 'text-neon-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  {isConnected && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-neon-500/20 duration-1000"></div>
                  )}
                </>
              )}
            </button>

            {/* STATUS TEXT */}
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-bold tracking-tight ${isConnected ? 'text-white' : 'text-zinc-500'}`}>
                {isBooting ? 'INITIALIZING...' : (isConnected ? 'PROTECTED' : 'READY TO CONNECT')}
              </h2>
              <p className={`text-xs font-mono ${isConnected ? 'text-neon-500' : 'text-zinc-600'}`}>
                {isConnected ? 'ECLIP DRIVER ACTIVE' : 'SYSTEM IDLE'}
              </p>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-3 gap-2 w-full px-6 mt-4">
               <div className="bg-[#121214] border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1"><Wifi className="w-3 h-3" /> PING</div>
                 <div className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-zinc-700'}`}>
                   {isConnected ? '14ms' : '--'}
                 </div>
               </div>
               <div className="bg-[#121214] border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1"><Cpu className="w-3 h-3" /> CPU</div>
                 <div className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-zinc-700'}`}>
                   {isConnected ? '0.4%' : '--'}
                 </div>
               </div>
               <div className="bg-[#121214] border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1"><Shield className="w-3 h-3" /> VER</div>
                 <div className="text-sm font-bold text-zinc-400">2.4.1</div>
               </div>
            </div>
          </div>

          {/* BOTTOM TABS */}
          <div className="h-40 bg-[#0c0c0e] border-t border-zinc-800 flex flex-col z-10">
            <div className="flex border-b border-zinc-800">
              <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors ${activeTab === 'status' ? 'text-white border-b-2 border-neon-500' : 'text-zinc-600'}`}
              >
                System Status
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors ${activeTab === 'logs' ? 'text-white border-b-2 border-neon-500' : 'text-zinc-600'}`}
              >
                Event Logs
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {activeTab === 'logs' ? (
                <div className="space-y-1.5 font-mono text-[10px]">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-zinc-500">[{log.time}]</span>
                      <span className={log.type === 'success' ? 'text-neon-500' : log.type === 'error' ? 'text-red-500' : 'text-zinc-300'}>
                        {log.event}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-zinc-600 italic">No logs available.</div>}
                </div>
              ) : (
                <div className="space-y-2">
                   <StatusRow label="Anti-Cheat Driver" status={isConnected ? 'RUNNING' : 'STOPPED'} />
                   <StatusRow label="Process Monitor" status={isConnected ? 'SCANNING' : 'IDLE'} />
                   <StatusRow label="Integrity Check" status={isConnected ? 'VERIFIED' : 'PENDING'} />
                   <StatusRow label="Server Relay" status={isConnected ? 'CONNECTED (EU-WEST)' : 'DISCONNECTED'} />
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status }: { label: string, status: string }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-zinc-500">{label}</span>
    <span className={`font-mono font-bold ${status.includes('RUNNING') || status.includes('SCANNING') || status.includes('VERIFIED') || status.includes('CONNECTED') ? 'text-neon-500' : 'text-zinc-600'}`}>
      {status}
    </span>
  </div>
);

export default WindowsClient;
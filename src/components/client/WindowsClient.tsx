'use client';

/**
 * WindowsClient Component
 * 
 * This simulates the Windows anti-cheat client UI that will later be built as a real .exe
 * 
 * INTEGRATION ARCHITECTURE:
 * 
 * Current (Web Simulation):
 * - Renders a floating window UI in the browser
 * - Sends heartbeats to /api/ac/heartbeat when connected
 * - State managed via ClientContext (localStorage persistence)
 * - Used for development and testing
 * 
 * Future (Real Windows .exe):
 * - Native Windows application built with Electron/Tauri/C++
 * - Runs kernel-level anti-cheat scanning
 * - Sends authenticated heartbeats to /api/ac/heartbeat
 * - Sends violation events to /api/ac/ingest
 * - Platform checks Redis for active heartbeats before allowing queue
 * - Users must have .exe running to play competitive matches
 * 
 * API Endpoints Ready:
 * - POST /api/ac/heartbeat - Receive heartbeat from client
 * - GET /api/ac/status - Check if user has active AC
 * - POST /api/ac/ingest - Receive cheat detection events
 * - POST /api/queue/join - Validates AC (TODO: uncomment Redis check)
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  X, 
  Minus, 
  Settings, 
  Power, 
  Cpu, 
  Wifi,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WindowsClientProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  setConnected: (status: boolean) => void;
}

interface ACLog {
  time: string;
  event: string;
  type: 'info' | 'success' | 'error';
}

export const WindowsClient: React.FC<WindowsClientProps> = ({ 
  isOpen, 
  onClose, 
  isConnected, 
  setConnected 
}) => {
  const [logs, setLogs] = useState<ACLog[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
  const [isBooting, setIsBooting] = useState(false);
  const { toast } = useToast();

  // Initial AC logs
  const INITIAL_LOGS: ACLog[] = [
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), event: 'Driver integrity verified', type: 'info' },
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), event: 'Connection established to AC Relay #EU-West', type: 'success' },
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), event: 'Scanning background processes...', type: 'info' },
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), event: 'EclipAC Client v2.4.1 initialized', type: 'info' },
  ];

  // Simulate incoming logs and heartbeat
  useEffect(() => {
    if (isConnected) {
      setLogs(INITIAL_LOGS);
      
      const interval = setInterval(() => {
        const newLog: ACLog = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          event: `Heartbeat sent to relay [${Math.floor(Math.random() * 999)}]`,
          type: 'info'
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
        
        // Send heartbeat to server (for real client, this will verify AC is running)
        fetch('/api/ac/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: '2.4.1',
            systemInfo: {
              ping: '14ms',
              cpu: '0.4%',
            }
          })
        }).catch(err => console.error('Heartbeat failed:', err));
      }, 8000);
      
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [isConnected]);

  const toggleConnection = async () => {
    if (isConnected) {
      // Disconnect
      setConnected(false);
      toast({
        title: 'Client Disconnected',
        description: 'Anti-cheat protection is no longer active',
        variant: 'destructive',
      });
    } else {
      // Connect
      setIsBooting(true);
      
      // Simulate driver loading sequence
      setTimeout(() => {
        setIsBooting(false);
        setConnected(true);
        toast({
          title: 'Client Connected',
          description: 'Anti-cheat protection is now active',
        });
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[9999] drop-shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
      {/* WINDOW FRAME */}
      <div className="w-[380px] h-[600px] bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* TITLE BAR */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
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
        <div className="flex-1 flex flex-col relative bg-zinc-950">
          {/* Status Indicator Bar */}
          {isConnected && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_hsl(var(--primary))]" />
          )}

          {/* Header User Info */}
          <div className="p-6 pb-0 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                  <Shield className={`w-5 h-5 ${isConnected ? 'text-primary' : 'text-zinc-600'}`} />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-950 ${isConnected ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Anti-Cheat Client</div>
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">
                  {isConnected ? 'Session Active' : 'Disconnected'}
                </div>
              </div>
            </div>
            <Settings className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" />
          </div>

          {/* CENTER ACTION AREA */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 gap-6 px-6">
            
            {/* BIG POWER BUTTON */}
            <button 
              onClick={toggleConnection}
              disabled={isBooting}
              className={`
                relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
                ${isConnected 
                  ? 'bg-primary/10 shadow-[0_0_40px_hsl(var(--primary)/0.2)] border-2 border-primary' 
                  : 'bg-zinc-900 shadow-none border-2 border-zinc-800 hover:border-zinc-700'}
              `}
            >
              {isBooting ? (
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Power className={`w-12 h-12 transition-all duration-300 ${isConnected ? 'text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  {isConnected && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 duration-1000" />
                  )}
                </>
              )}
            </button>

            {/* STATUS TEXT */}
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-bold tracking-tight ${isConnected ? 'text-white' : 'text-zinc-500'}`}>
                {isBooting ? 'INITIALIZING...' : (isConnected ? 'PROTECTED' : 'READY TO CONNECT')}
              </h2>
              <p className={`text-xs font-mono ${isConnected ? 'text-primary' : 'text-zinc-600'}`}>
                {isConnected ? 'ECLIP DRIVER ACTIVE' : 'SYSTEM IDLE'}
              </p>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-3 gap-2 w-full">
               <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1">
                   <Wifi className="w-3 h-3" /> PING
                 </div>
                 <div className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-zinc-700'}`}>
                   {isConnected ? '14ms' : '--'}
                 </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1">
                   <Cpu className="w-3 h-3" /> CPU
                 </div>
                 <div className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-zinc-700'}`}>
                   {isConnected ? '0.4%' : '--'}
                 </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-center">
                 <div className="text-[10px] text-zinc-500 uppercase mb-1 flex justify-center items-center gap-1">
                   <Shield className="w-3 h-3" /> VER
                 </div>
                 <div className="text-sm font-bold text-zinc-400">2.4.1</div>
               </div>
            </div>
          </div>

          {/* BOTTOM TABS */}
          <div className="h-40 bg-zinc-900 border-t border-zinc-800 flex flex-col z-10">
            <div className="flex border-b border-zinc-800">
              <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors ${activeTab === 'status' ? 'text-white border-b-2 border-primary' : 'text-zinc-600'}`}
              >
                System Status
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors ${activeTab === 'logs' ? 'text-white border-b-2 border-primary' : 'text-zinc-600'}`}
              >
                Event Logs
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {activeTab === 'logs' ? (
                <div className="space-y-1.5 font-mono text-[10px]">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-zinc-500">[{log.time}]</span>
                      <span className={log.type === 'success' ? 'text-primary' : log.type === 'error' ? 'text-red-500' : 'text-zinc-300'}>
                        {log.event}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-zinc-600 italic">No logs available.</div>}
                </div>
              ) : (
                <div className="space-y-2">
                   <StatusRow label="Anti-Cheat Driver" status={isConnected ? 'RUNNING' : 'STOPPED'} isConnected={isConnected} />
                   <StatusRow label="Process Monitor" status={isConnected ? 'SCANNING' : 'IDLE'} isConnected={isConnected} />
                   <StatusRow label="Integrity Check" status={isConnected ? 'VERIFIED' : 'PENDING'} isConnected={isConnected} />
                   <StatusRow label="Server Relay" status={isConnected ? 'CONNECTED (EU-WEST)' : 'DISCONNECTED'} isConnected={isConnected} />
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status, isConnected }: { label: string, status: string, isConnected: boolean }) => {
  const isActive = status.includes('RUNNING') || status.includes('SCANNING') || status.includes('VERIFIED') || status.includes('CONNECTED');
  
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <div className="flex items-center gap-1.5">
        {isActive ? (
          <CheckCircle2 className="w-3 h-3 text-primary" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-zinc-600" />
        )}
        <span className={`font-mono font-bold ${isActive ? 'text-primary' : 'text-zinc-600'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

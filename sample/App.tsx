import React, { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Gamepad2, 
  ShoppingBag, 
  Users, 
  Settings, 
  Bell, 
  Menu, 
  Trophy,
  Coins,
  Crosshair,
  Zap,
  Activity,
  Server,
  Monitor,
  WifiOff,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Minus,
  Power,
  Globe
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// Internal Imports
import { QueueState } from './types';
import { MOCK_USER, RECENT_MATCHES, MAP_POOL } from './constants';
import { WindowsClient } from './WindowsClient';

// --- Client Context (Global State for Windows App Connection) ---

interface ClientContextType {
  isClientConnected: boolean;
  setClientConnected: (status: boolean) => void;
  isClientOpen: boolean;
  setClientOpen: (status: boolean) => void;
  clientVersion: string;
}

const ClientContext = createContext<ClientContextType>({
  isClientConnected: false,
  setClientConnected: () => {},
  isClientOpen: false,
  setClientOpen: () => {},
  clientVersion: 'v2.4.1'
});

const useClient = () => useContext(ClientContext);

// --- Components ---

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const location = useLocation();
  const { isClientConnected, setClientOpen } = useClient();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Play', path: '/play', icon: Gamepad2 },
    { name: 'Client', path: '/client', icon: Monitor }, 
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-dark-900 border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neon-500 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                <Crosshair className="text-black w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">
                ECLIP<span className="text-neon-400">.PRO</span>
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-neon-500/10 text-neon-400 border border-neon-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-neon-400' : 'text-zinc-500 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />}
                </Link>
              );
            })}
          </nav>

          {/* User Mini Profile - Status Indicator Area */}
          <div className="p-4 border-t border-white/5">
            <div 
              onClick={() => setClientOpen(true)}
              className={`glass-panel p-3 rounded-xl flex items-center gap-3 border transition-colors duration-500 cursor-pointer hover:bg-white/5 ${isClientConnected ? 'border-neon-500/50 bg-neon-500/5' : 'border-red-500/20 bg-red-500/5'}`}
            >
              <div className="relative">
                <img src={MOCK_USER.avatarUrl} alt="User" className="w-10 h-10 rounded-lg object-cover" />
                {/* Status Dot */}
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-dark-900 flex items-center justify-center ${isClientConnected ? 'bg-neon-500' : 'bg-red-500'}`}>
                  {isClientConnected && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">{MOCK_USER.username}</h4>
                  {isClientConnected ? (
                    <Shield className="w-3.5 h-3.5 text-neon-500 fill-neon-500/20" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-[10px] font-mono mt-0.5">
                  <span className={isClientConnected ? 'text-neon-400' : 'text-red-400'}>
                    {isClientConnected ? 'PROTECTED' : 'UNSECURED'}
                  </span>
                </div>
              </div>
            </div>
            {!isClientConnected && (
              <div className="mt-2 text-[10px] text-center text-zinc-500">
                Click status to open client
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

// --- Landing Page ---

const Landing = () => (
  <div className="min-h-screen bg-black text-white relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-neon-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
    </div>

    <header className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
      <div className="text-2xl font-bold flex items-center gap-2">
         <div className="w-8 h-8 rounded-lg bg-neon-500 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            <Crosshair className="text-black w-5 h-5" />
          </div>
        <span>ECLIP.PRO</span>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">Login</Link>
        <Link to="/dashboard" className="px-6 py-2 text-sm font-bold bg-neon-500 text-black rounded-lg hover:bg-neon-400 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.4)]">
          Play Now
        </Link>
      </div>
    </header>

    <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neon-400 mb-8">
        <span className="w-2 h-2 rounded-full bg-neon-500 animate-pulse"></span>
        SEASON 2 IS LIVE
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        COMPETE. <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-400 to-emerald-600">EVOLVE.</span> <br />
        EARN REWARDS.
      </h1>
      <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        The ultimate competitive CS2 platform. Fair matchmaking, invasive-level anti-cheat protection, and a real economy where your skill earns you currency.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/client" className="px-8 py-4 bg-neon-500 text-black font-bold rounded-xl text-lg hover:bg-neon-400 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> Download Client
        </Link>
        <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl text-lg hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all">
          View Leaderboards
        </button>
      </div>
    </main>
  </div>
);

// --- Anti-Cheat Page (Client Download & Connection Hub) ---

const AntiCheatPanel = () => {
  const { isClientConnected, setClientConnected, setClientOpen, isClientOpen } = useClient();
  const [downloading, setDownloading] = useState(false);

  // Auto-open client for demo purposes when visiting this page
  useEffect(() => {
    if (!isClientOpen && !isClientConnected) {
      const timer = setTimeout(() => setClientOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    
    // Simulate downloading an actual EXE file
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob(["// This is a dummy Eclip Anti-Cheat executable\n// In a real environment, this would be a binary file."], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "EclipAntiCheat_Setup.exe";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloading(false);
    }, 1500);
  }

  const handleLaunch = () => {
    setClientOpen(true);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-10">
      
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl mb-4">
          <Monitor className="w-12 h-12 text-neon-500" />
        </div>
        <h2 className="text-4xl font-bold text-white">Eclip Desktop Client</h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          To play on Eclip.pro, you must download and run our custom Anti-Cheat client.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Step 1: Download */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden group hover:border-neon-500/30 transition-colors">
          <div className="absolute inset-0 bg-neon-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-neon-500 font-bold text-2xl border border-zinc-700 z-10">
            1
          </div>
          <h3 className="text-xl font-bold text-white z-10">Download Installer</h3>
          <p className="text-sm text-zinc-400 z-10">
            Get the latest version (v2.4.1) for Windows 10/11. Lightweight and optimized for performance.
          </p>
          
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="z-10 w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download for Windows
              </>
            )}
          </button>
          <p className="text-[10px] text-zinc-600 z-10">File size: 45MB • Version 2.4.1</p>
        </div>

        {/* Step 2: Connect */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-neon-500 font-bold text-2xl border border-zinc-700">
            2
          </div>
          <h3 className="text-xl font-bold text-white">Launch & Connect</h3>
          <p className="text-sm text-zinc-400">
            Open the installed application (Simulated below) and click the Power button to secure your session.
          </p>
          
          {isClientOpen ? (
             <div className="w-full py-3 bg-zinc-800 text-zinc-400 font-bold rounded-lg border border-zinc-700 flex items-center justify-center gap-2 cursor-not-allowed">
               <CheckCircle2 className="w-4 h-4" /> Client Running
             </div>
          ) : (
            <button 
              onClick={handleLaunch}
              className="w-full py-3 bg-neon-500 text-black font-bold rounded-lg hover:bg-neon-400 transition-colors shadow-[0_0_15px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" /> Launch Client
            </button>
          )}
           <p className="text-[10px] text-zinc-600 z-10">Look for the window at the bottom right</p>
        </div>
      </div>

      {/* System Requirements */}
      <div className="border-t border-white/5 pt-8">
        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">System Requirements</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-zinc-400">
          <div>
            <span className="block text-zinc-600 text-xs">OS</span>
            Windows 10 / 11 (64-bit)
          </div>
          <div>
            <span className="block text-zinc-600 text-xs">Processor</span>
            Intel Core i3 / AMD Ryzen 3
          </div>
          <div>
            <span className="block text-zinc-600 text-xs">Memory</span>
            4GB RAM
          </div>
          <div>
            <span className="block text-zinc-600 text-xs">Storage</span>
            200MB available space
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Play Page ---

const Play = () => {
  const { isClientConnected, setClientOpen } = useClient();
  const [queueState, setQueueState] = useState<QueueState>(QueueState.IDLE);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (queueState === QueueState.SEARCHING) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [queueState]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQueue = () => {
    if (!isClientConnected) return; // Should be handled by UI state
    setQueueState(QueueState.SEARCHING);
    // Simulate finding match
    setTimeout(() => {
      setQueueState(QueueState.ACCEPTED);
    }, 4500);
  };

  const cancelQueue = () => setQueueState(QueueState.IDLE);

  if (!isClientConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/20">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-3xl font-bold text-white">Anti-Cheat Required</h2>
          <p className="text-zinc-400">
            You must have the Eclip Client running and connected to queue for ranked matches. This ensures a fair environment for everyone.
          </p>
        </div>
        <button 
          onClick={() => setClientOpen(true)}
          className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Power className="w-4 h-4" /> Open Client
        </button>
      </div>
    );
  }

  if (queueState === QueueState.ACCEPTED) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 animate-in zoom-in duration-300">
        <div className="text-5xl font-black text-neon-500 tracking-tighter animate-pulse">MATCH FOUND</div>
        <div className="glass-panel p-8 rounded-2xl border border-neon-500/30 flex flex-col items-center gap-6 w-full max-w-lg">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <img src={MAP_POOL[0].image} className="w-32 h-20 object-cover rounded-lg border border-zinc-700 opacity-50" />
              <div className="text-xs font-bold mt-2 text-zinc-500">YOUR TEAM</div>
            </div>
            <div className="text-2xl font-bold text-white">VS</div>
             <div className="text-center">
              <img src={MAP_POOL[1].image} className="w-32 h-20 object-cover rounded-lg border border-zinc-700 opacity-50" />
              <div className="text-xs font-bold mt-2 text-zinc-500">ENEMY TEAM</div>
            </div>
          </div>
          <div className="w-full space-y-2">
            <div className="text-center text-sm font-mono text-neon-400">Map: DE_MIRAGE</div>
            <div className="text-center text-sm font-mono text-zinc-400">Server: London #4</div>
          </div>
          <button className="w-full py-4 bg-neon-500 hover:bg-neon-400 text-black font-black text-xl rounded-xl shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all transform hover:scale-105">
            ACCEPT MATCH (0:09)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Play</h2>
          <p className="text-zinc-400">Select game mode and region</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-neon-500/10 rounded-lg border border-neon-500/20 text-neon-400 text-sm font-bold">
           <Shield className="w-4 h-4" /> SECURE CONNECTION ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Queue Card */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-neon-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex gap-4 mb-8">
              <button className="px-6 py-3 bg-neon-500 text-black font-bold rounded-lg shadow-lg">5v5 Ranked</button>
              <button className="px-6 py-3 bg-white/5 text-zinc-400 font-bold rounded-lg hover:bg-white/10 hover:text-white transition-colors">Wingman</button>
              <button className="px-6 py-3 bg-white/5 text-zinc-400 font-bold rounded-lg hover:bg-white/10 hover:text-white transition-colors">1v1 Aim</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-neon-500/50 cursor-pointer transition-colors group">
                <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Region</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neon-500" /> Europe (West)
                </div>
              </div>
               <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-neon-500/50 cursor-pointer transition-colors group">
                <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Map Pool</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {MAP_POOL.slice(0,3).map(m => (
                      <img key={m.name} src={m.image} className="w-6 h-6 rounded-full border border-black" />
                    ))}
                  </div>
                  Active Duty
                </div>
              </div>
            </div>

            {queueState === QueueState.SEARCHING ? (
              <div className="w-full py-8 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                <div className="w-full h-1 bg-zinc-800 absolute top-0 left-0">
                  <div className="h-full bg-neon-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
                <div className="text-zinc-400 font-mono text-sm">SEARCHING FOR MATCH...</div>
                <div className="text-4xl font-black text-white font-mono">{formatTime(timer)}</div>
                <button onClick={cancelQueue} className="px-6 py-2 text-sm text-red-500 font-bold hover:bg-red-500/10 rounded-lg transition-colors">
                  CANCEL
                </button>
              </div>
            ) : (
              <button 
                onClick={startQueue}
                className="w-full py-6 bg-neon-500 hover:bg-neon-400 text-black font-black text-2xl rounded-xl shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <Crosshair className="w-6 h-6" /> FIND MATCH
              </button>
            )}
          </div>
        </div>

        {/* Stats / Info Side */}
        <div className="space-y-6">
           <div className="glass-panel p-6 rounded-2xl border border-white/5">
             <h3 className="text-zinc-400 font-bold text-sm uppercase mb-4">Lobby</h3>
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
               <div className="relative">
                  <img src={MOCK_USER.avatarUrl} className="w-10 h-10 rounded-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-500 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                  </div>
               </div>
               <div>
                 <div className="text-white font-bold text-sm">{MOCK_USER.username}</div>
                 <div className="text-neon-500 text-xs font-bold">{MOCK_USER.rank}</div>
               </div>
               <div className="ml-auto">
                 <Settings className="w-4 h-4 text-zinc-600 hover:text-white cursor-pointer" />
               </div>
             </div>
             <button className="w-full mt-4 py-3 border-2 border-dashed border-zinc-800 text-zinc-600 font-bold rounded-xl hover:border-zinc-700 hover:text-zinc-500 transition-colors">
               + Invite Friend
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {MOCK_USER.username}</h1>
            <p className="text-zinc-400">Ready to grind? Your rank decay starts in 2 days.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-3">
               <div className="p-2 bg-yellow-500/20 rounded-lg">
                 <Trophy className="w-5 h-5 text-yellow-500" />
               </div>
               <div>
                 <div className="text-xs text-zinc-500 font-bold uppercase">Rank</div>
                 <div className="text-white font-bold">{MOCK_USER.rank}</div>
               </div>
             </div>
             <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-3">
               <div className="p-2 bg-neon-500/20 rounded-lg">
                 <Activity className="w-5 h-5 text-neon-500" />
               </div>
               <div>
                 <div className="text-xs text-zinc-500 font-bold uppercase">MMR</div>
                 <div className="text-white font-bold">{MOCK_USER.mmr}</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Recent Matches</h3>
            <Link to="/matches" className="text-sm text-neon-500 hover:text-neon-400 font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {RECENT_MATCHES.map((match) => (
              <div key={match.id} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-12 rounded-full ${match.result === 'WIN' ? 'bg-neon-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="text-white font-bold text-lg">{match.map}</div>
                    <div className="text-zinc-500 text-xs">{match.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center hidden sm:block">
                    <div className="text-zinc-500 text-xs uppercase font-bold">Score</div>
                    <div className={`font-mono font-bold ${match.result === 'WIN' ? 'text-neon-400' : 'text-red-400'}`}>
                      {match.score}
                    </div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-zinc-500 text-xs uppercase font-bold">K/D/A</div>
                    <div className="text-white font-mono">{match.kda}</div>
                  </div>
                  <div className="text-center">
                     <div className="text-zinc-500 text-xs uppercase font-bold">HS%</div>
                     <div className="text-white font-mono">{match.hsPercentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart (Mock) */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold text-white">Headshot % (Last 20)</h3>
           <div className="glass-panel p-4 rounded-2xl border border-white/5 h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  {name: '1', uv: 40}, {name: '2', uv: 55}, {name: '3', uv: 45}, 
                  {name: '4', uv: 60}, {name: '5', uv: 58}, {name: '6', uv: 70}, 
                  {name: '7', uv: 65}
                ]}>
                  <defs>
                    <linearGradient id="colorHs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="uv" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorHs)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/10 to-transparent">
             <div className="flex items-center gap-3 mb-2">
               <Coins className="text-purple-400 w-5 h-5" />
               <span className="text-purple-400 font-bold uppercase tracking-wider text-xs">Eclip Coins</span>
             </div>
             <div className="text-3xl font-black text-white">{MOCK_USER.coins.toFixed(2)}</div>
             <div className="text-zinc-500 text-xs mt-1">Next payout at 500.00</div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root Layout ---

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isClientConnected, setClientConnected, isClientOpen, setClientOpen } = useClient();

  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-e5e5e5 font-sans selection:bg-neon-500/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-dark-900 border-b border-white/5 flex items-center px-4 justify-between sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
          <Menu />
        </button>
        <span className="font-bold text-white">ECLIP</span>
        <div className="w-8" />
      </div>

      <main className="lg:pl-64 min-h-screen">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-20">
           {/* Breadcrumb / Page Title */}
           <div className="hidden md:block text-zinc-500 text-sm font-medium">
             Eclip <span className="mx-2">/</span> <span className="text-white capitalize">{location.pathname.replace('/', '')}</span>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-6 ml-auto">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
               <Coins className="w-4 h-4 text-purple-400" />
               <span className="text-sm font-bold text-white">{MOCK_USER.coins.toFixed(2)}</span>
             </div>
             <button className="relative text-zinc-400 hover:text-white transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-neon-500 rounded-full"></span>
             </button>
             <div className="w-px h-6 bg-zinc-800"></div>
             {isClientConnected ? (
                <div className="flex items-center gap-2 text-xs font-bold text-neon-500 bg-neon-500/10 px-3 py-1 rounded-full border border-neon-500/20">
                  <Shield className="w-3 h-3 fill-neon-500" /> CLIENT CONNECTED
                </div>
             ) : (
                <Link to="/client" className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                  <Monitor className="w-3 h-3" /> CLIENT MISSING
                </Link>
             )}
           </div>
        </div>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/play" element={<Play />} />
            <Route path="/client" element={<AntiCheatPanel />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Windows Client Overlay - The "App" itself */}
      <WindowsClient 
        isOpen={isClientOpen} 
        onClose={() => setClientOpen(false)}
        isConnected={isClientConnected}
        setConnected={setClientConnected}
      />
    </div>
  );
};

const App = () => {
  const [isClientConnected, setClientConnected] = useState(false);
  const [isClientOpen, setClientOpen] = useState(false);

  return (
    <ClientContext.Provider value={{ 
      isClientConnected, 
      setClientConnected,
      isClientOpen,
      setClientOpen,
      clientVersion: 'v2.4.1' 
    }}>
      <HashRouter>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </HashRouter>
    </ClientContext.Provider>
  );
};

export default App;
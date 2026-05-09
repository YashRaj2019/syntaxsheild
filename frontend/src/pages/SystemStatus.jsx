import React from 'react';
import { Server, Activity, Database, Cpu, ShieldCheck } from 'lucide-react';

const SystemStatus = () => {
  const components = [
    { name: 'API Server', status: 'Healthy', uptime: '99.9%', ping: '12ms', icon: Server, color: 'text-teal-400' },
    { name: 'Gemini AI Agent', status: 'Active', uptime: '100%', ping: '450ms', icon: Cpu, color: 'text-purple-400' },
    { name: 'Redis Queue', status: 'Online', uptime: '99.8%', ping: '5ms', icon: Activity, color: 'text-amber-400' },
    { name: 'MongoDB Cluster', status: 'Connected', uptime: '100%', ping: '20ms', icon: Database, color: 'text-blue-400' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header>
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          System Infrastructure
        </h1>
        <p className="text-gray-500 mt-2">Live monitoring of your AI review engine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {components.map((c, i) => (
          <div key={i} className="glass-panel p-6 border-dark-700 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <c.icon className="w-12 h-12" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-dark-800 ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-200">{c.name}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="text-green-400 font-bold uppercase tracking-tighter">{c.status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Latency</span>
                <span className="text-gray-300 font-mono">{c.ping}</span>
              </div>
              <div className="w-full bg-dark-800 h-1 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-500 h-full w-[95%] animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-bold">Node Pulse Visualization</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 relative">
          {/* Animated concentric circles */}
          <div className="absolute w-64 h-64 border-2 border-primary-500/20 rounded-full animate-ping opacity-20"></div>
          <div className="absolute w-48 h-48 border-2 border-primary-500/30 rounded-full animate-ping delay-75 opacity-20"></div>
          
          <div className="z-10 bg-dark-900 p-8 rounded-full border-4 border-primary-500/50 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <Cpu className="w-16 h-16 text-primary-500 animate-pulse" />
          </div>
          <p className="mt-12 text-sm font-mono text-primary-400 tracking-[0.3em] uppercase">Worker Core-01: Listening</p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;

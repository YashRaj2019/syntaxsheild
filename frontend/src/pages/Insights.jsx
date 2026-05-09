import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import axios from 'axios';

const Insights = () => {
  const [data, setData] = useState({
    issueTypes: [
      { name: 'Security', value: 45, color: '#ef4444' },
      { name: 'Performance', value: 25, color: '#f59e0b' },
      { name: 'Best Practice', value: 20, color: '#6366f1' },
      { name: 'Logic', value: 10, color: '#10b8a6' }
    ],
    commonFiles: [
      { name: 'auth.js', issues: 12 },
      { name: 'database.sql', issues: 9 },
      { name: 'server.py', issues: 7 },
      { name: 'utils.ts', issues: 5 },
      { name: 'App.jsx', issues: 3 }
    ]
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header>
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Intelligence Insights
        </h1>
        <p className="text-gray-500 mt-2">AI-driven analytics across all your repositories.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Issue Distribution */}
        <div className="glass-panel p-8 min-h-[450px] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">Vulnerability Distribution</h2>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.issueTypes}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.issueTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Files */}
        <div className="glass-panel p-8 min-h-[450px] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold">Hotspot Analysis</h2>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.commonFiles} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Bar dataKey="issues" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Strategic Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800/30 p-6 rounded-2xl border border-dark-700 space-y-4">
              <h3 className="font-bold text-red-400">Security Priority</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                45% of issues relate to hardcoded keys. Consider implementing a centralized Secret Manager.
              </p>
            </div>
            <div className="bg-dark-800/30 p-6 rounded-2xl border border-dark-700 space-y-4">
              <h3 className="font-bold text-primary-400">Perf Optimization</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nested loops in `auth.js` are causing latency. Recommend refactoring into Map/Set lookups.
              </p>
            </div>
            <div className="bg-dark-800/30 p-6 rounded-2xl border border-dark-700 space-y-4">
              <h3 className="font-bold text-teal-400">Architecture Shift</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Logic errors are rising. Implement unit testing in your pipeline to catch these before PR.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Insights;

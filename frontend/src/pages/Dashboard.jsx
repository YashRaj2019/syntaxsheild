import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Settings, Play, CheckCircle2, GitPullRequest, Plus, Zap, Shield, Trash2, Terminal, BarChart3, Activity, Clock, AlertCircle, ArrowRight, MessageSquare, Info, Gauge, Timer, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [repos, setRepos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, totalSuggestions: 0, successRate: 100, activeRepos: 0, activityData: [] });
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [fixingId, setFixingId] = useState(null);
  const [fixedIds, setFixedIds] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatTopic, setChatTopic] = useState(null);
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), msg: "Diagnostic kernel v3.0 active.", type: "system" },
    { id: 2, time: new Date().toLocaleTimeString(), msg: "Ready for Deep Code Analysis.", type: "ai" }
  ]);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 5));
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const headers = { Authorization: `Bearer ${token}` };
      const [reposRes, reviewsRes, statsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/repositories`, { headers }),
        axios.get(`${apiUrl}/api/repositories/reviews`, { headers }),
        axios.get(`${apiUrl}/api/repositories/stats`, { headers })
      ]);
      setRepos(reposRes.data);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => { fetchData(); addLog("Live signal received: AI analysis complete.", "success"); };
    window.addEventListener('review-updated', handleUpdate);
    return () => window.removeEventListener('review-updated', handleUpdate);
  }, []);

  const handleImport = async () => {
    const fullName = window.prompt("Repo Name (username/repo):");
    if (!fullName) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      addLog(`Initializing connection to ${fullName}...`, "info");
      
      const response = await axios.post(`${apiUrl}/api/repositories/import`, { fullName }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      fetchData();
      addLog(`Secure connection to ${fullName} established.`, "success");
    } catch (error) { 
      const errorMsg = error.response?.data?.msg || error.message || "Unknown Connection Error";
      addLog(`CONNECTION FAILED: ${errorMsg}`, "warning");
      alert(`Import Failed: ${errorMsg}\n\nPlease check your Backend logs and ensure PUBLIC_URL is set in Render!`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove repo?")) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.delete(`${apiUrl}/api/repositories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      addLog("Repo removed from registry.", "warning");
    } catch (error) { alert("Delete failed"); }
  };

  const handleSimulateFix = (index) => {
    setFixingId(index);
    addLog(`Synthesizing patch for #${index + 1}...`, "ai");
    setTimeout(() => {
      setFixingId(null);
      setFixedIds(prev => [...prev, index]);
      addLog(`Patch synthesis complete. Bug eliminated.`, "success");
    }, 2000);
  };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const openChat = (comment) => {
    setChatTopic(comment);
    setMessages([
      { role: 'ai', text: `Hello! I analyzed this ${comment.priority.toLowerCase()} issue in ${comment.path}. How can I help you understand the proposed fix?` }
    ]);
    setShowChat(true);
  };

  const [lastReplyIndex, setLastReplyIndex] = useState(-1);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue.toLowerCase();
    const userMsg = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = "";

      if (text.includes("security") || text.includes("safe") || text.includes("leak")) {
        reply = `Security is the top priority here. The original code was exposing raw credentials. By moving them to 'process.env', we ensure they stay on the server and never reach the client-side bundle.`;
      } else if (text.includes("performance") || text.includes("slow") || text.includes("fast")) {
        reply = `The optimized version uses a Map/Set lookup or a batch query. This reduces the time complexity from O(n²) to O(n), which means your app stays fast even with 100,000+ users.`;
      } else if (text.includes("how") || text.includes("implement") || text.includes("work")) {
        reply = `It works by intercepting the standard execution flow and applying a more modern pattern. You just need to swap the highlighted lines, and the underlying engine handles the rest.`;
      } else if (text.includes("why") || text.includes("benefit")) {
        reply = `The main benefit is 'Maintainability'. This new pattern is the industry standard used by teams at Google and Meta. It makes the code easier for other developers to read and debug.`;
      } else {
        const genericReplies = [
          "That's an interesting perspective. From a system architecture standpoint, this change is highly recommended.",
          "I suggest applying this fix and then checking your logs to see the immediate improvement in execution time.",
          "Do you have any specific concerns about the logic? I can break it down further if you'd like."
        ];
        let newIndex;
        do { newIndex = Math.floor(Math.random() * genericReplies.length); } while (newIndex === lastReplyIndex);
        setLastReplyIndex(newIndex);
        reply = genericReplies[newIndex];
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      addLog("AI Agent analyzed developer inquiry.", "ai");
    }, 1200);
  };

  if (loading) return <div className="flex items-center justify-center h-[80vh] font-mono text-primary-500 animate-pulse">BOOTING INTELLIGENCE ENGINE...</div>;

  const statCards = [
    { label: 'Total Reviews', value: stats.totalReviews, icon: GitPullRequest, border: 'border-blue-500/30', color: 'from-blue-500/10' },
    { label: 'AI Suggestions', value: stats.totalSuggestions, icon: Zap, border: 'border-amber-500/30', color: 'from-amber-500/10' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, border: 'border-teal-500/30', color: 'from-teal-500/10' },
    { label: 'Active Agents', value: stats.activeRepos, icon: Shield, border: 'border-purple-500/30', color: 'from-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 px-4">
      
      {/* AI CHAT SIDE DRAWER */}
      {showChat && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-500">
          <div onClick={() => setShowChat(false)} className="absolute inset-0"></div>
          <div className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300">
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg"><MessageSquare className="w-5 h-5 text-primary-400" /></div>
                <h3 className="font-bold text-white">Ask SyntaxShield AI</h3>
              </div>
              <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/5 rounded-full"><Plus className="w-5 h-5 rotate-45 text-gray-500" /></button>
            </header>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Smart Suggestions */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
                  {['Why this fix?', 'Security risks?', 'Performance impact?', 'How to apply?'].map(q => (
                    <button 
                      key={q} 
                      onClick={() => { setInputValue(q); }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 hover:text-primary-400 hover:border-primary-500/50 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-dark-800/50 text-gray-300 ml-8 border border-white/5' : 'bg-primary-600/10 border border-primary-500/10 text-gray-200 mr-8'
                }`}>
                  <span className="font-bold text-xs block mb-2 opacity-50 uppercase tracking-tighter">
                    {msg.role === 'user' ? 'Developer' : 'SyntaxShield AI'}
                  </span>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-primary-600/10 border border-primary-500/10 p-4 rounded-2xl text-xs text-gray-400 mr-8 animate-pulse">
                  AI Agent is typing...
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/5 bg-black">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a follow-up question..." 
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none pr-12" 
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-primary-600 rounded-lg text-white hover:bg-primary-500 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VERSION 3.0 DIAGNOSTIC MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] w-full max-w-7xl h-[92vh] flex flex-col border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.25)]">
            
            {/* Header with Health Metrics */}
            <header className="p-8 border-b border-white/5 bg-gradient-to-r from-dark-900 to-black flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl border border-primary-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">AI Diagnostic Report v3.0</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> PR #{selectedReview.pullRequestNumber}
                    </div>
                    <div className="h-1 w-1 bg-gray-700 rounded-full"></div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">{selectedReview.repoFullName}</div>
                  </div>
                </div>
              </div>

              {/* Health Dashboard Widgets */}
              <div className="hidden lg:flex items-center gap-6 mr-10">
                <div className="px-5 py-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                  <p className="text-[10px] text-red-500/70 font-black uppercase tracking-[0.2em] mb-1">Security Grade</p>
                  <p className="text-2xl font-black text-red-500">{selectedReview.securityGrade || 'B'}</p>
                </div>
                <div className="px-5 py-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
                  <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em] mb-1">Tech Debt</p>
                  <p className="text-2xl font-black text-amber-500">{selectedReview.technicalDebt || '4h'}</p>
                </div>
              </div>

              <button onClick={() => setSelectedReview(null)} className="p-3 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"><Plus className="w-10 h-10 rotate-45" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-black/50">
              {selectedReview.comments?.map((c, i) => (
                <div key={i} className="space-y-6 relative group">
                  
                  {/* Left Indicator */}
                  <div className={`absolute -left-12 top-0 w-1.5 h-full rounded-full blur-sm transition-all ${
                    c.priority === 'CRITICAL' ? 'bg-red-500 opacity-50' : 'bg-amber-500 opacity-30'
                  }`}></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${
                        c.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {c.priority} • RISK: {c.riskScore || 80}/100
                      </span>
                      {/* Risk Impact Meter */}
                      <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <span className="text-[8px] font-black text-gray-500 uppercase mr-2">Impact:</span>
                        {[1,2,3,4,5].map(step => (
                          <div key={step} className={`w-3 h-1.5 rounded-sm ${
                            step <= (c.riskScore / 20) ? (c.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/10'
                          }`}></div>
                        ))}
                      </div>
                      <h4 className="text-2xl font-bold text-white tracking-tight">{c.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                      <span className="bg-dark-800 px-3 py-1 rounded-lg border border-white/5">{c.path} : L{c.line}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-[0.2em]">
                      <Info className="w-4 h-4" /> AI Logic Explanation (English)
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed italic">
                      "{c.body || 'Analyzing logic...'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest ml-4">Earlier Logic</div>
                      <div className="bg-[#120a0a] border border-red-500/20 p-8 rounded-[2rem] font-mono text-sm leading-relaxed text-red-300/80 shadow-inner min-h-[120px]">
                        <pre className="whitespace-pre-wrap">{c.originalCode || "// No source data available"}</pre>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-green-500 uppercase tracking-widest ml-4">AI Recommendation</div>
                      <div className="bg-[#0a120a] border border-green-500/20 p-8 rounded-[2rem] font-mono text-sm leading-relaxed text-green-400 shadow-inner min-h-[120px]">
                        <pre className="whitespace-pre-wrap">{c.correctedCode || "// No optimized data available"}</pre>
                      </div>
                    </div>
                  </div>

                  {/* PRO ACTION BAR */}
                  <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5 relative z-[50]">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openChat(c); }} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-xl text-sm font-bold transition-all border border-primary-500/20 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> Discuss with AI
                      </button>
                    </div>
                    <button 
                      onClick={() => handleSimulateFix(i)}
                      disabled={fixingId === i || fixedIds.includes(i)}
                      className={`flex items-center gap-3 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        fixedIds.includes(i) ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        fixingId === i ? 'bg-white/5 text-gray-500' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                      }`}
                    >
                      {fixedIds.includes(i) ? <CheckCircle2 className="w-4 h-4" /> : fixingId === i ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {fixedIds.includes(i) ? 'Logic Verified' : fixingId === i ? 'Patching...' : 'Apply Fix'}
                    </button>
                  </div>
                  
                  {i < selectedReview.comments.length - 1 && <div className="border-b border-white/5 pt-12"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {statCards.map((card, i) => (
          <div key={i} className={`lg:col-span-3 bg-dark-900/40 p-8 border ${card.border} rounded-[2rem] relative group hover:scale-[1.05] transition-all duration-500`}>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">{card.label}</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black text-white">{card.value}</h3>
              <card.icon className={`w-10 h-10 text-primary-400 opacity-20 group-hover:opacity-100 transition-opacity`} />
            </div>
          </div>
        ))}

        <div className="lg:col-span-8 bg-dark-900/10 border border-white/5 rounded-[2.5rem] p-10 min-h-[450px]">
          <div className="flex items-center justify-between mb-10"><h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter"><Gauge className="w-7 h-7 text-primary-500" /> Intelligence Stream</h2><div className="flex items-center gap-3 text-[10px] text-gray-500 font-black tracking-widest uppercase"><span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping"></span> Live Kernel Active</div></div>
          <div className="flex-1 w-full h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.activityData}><defs><linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} /><XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '20px' }} /><Area type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={5} fill="url(#colorReviews)" /></AreaChart></ResponsiveContainer></div>
        </div>

        <div className="lg:col-span-4 bg-dark-900/10 border border-white/5 rounded-[2.5rem] flex flex-col p-8">
          <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-accent-500" /> Active Agents</h2><button onClick={handleImport} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Plus className="w-5 h-5" /></button></div>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
            {repos.map(repo => (
              <div key={repo._id} className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-primary-500/5 transition-all">
                <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${repo.webhookActive ? 'bg-green-500 shadow-[0_0_15px_green]' : 'bg-gray-700'}`}></div><span className="font-bold text-gray-200">{repo.fullName.split('/')[1]}</span></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><Link to={`/builder/${repo._id}`} className="p-2 hover:bg-dark-800 rounded-xl text-gray-400"><Settings className="w-4 h-4" /></Link><button onClick={() => handleDelete(repo._id)} className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-12 bg-black border border-white/5 rounded-[3rem] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 border-r border-white/5">
              <div className="flex items-center gap-3 mb-8 font-black text-xl tracking-tighter"><Clock className="w-6 h-6 text-blue-500" /> Intelligence Feed</div>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} onClick={() => setSelectedReview(review)} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary-500/50 cursor-pointer transition-all flex justify-between items-center group">
                    <div className="flex flex-col"><span className="text-lg font-black text-gray-100">{review.repoFullName}</span><span className="text-xs font-mono text-gray-600 uppercase tracking-widest">PR #{review.pullRequestNumber} • {review.commentCount} Insights</span></div>
                    <ArrowRight className="w-6 h-6 text-gray-800 group-hover:text-primary-500 group-hover:translate-x-2 transition-all" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-10 bg-[#040404]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 font-black text-lg tracking-tighter text-green-500/80"><Terminal className="w-5 h-5" /> Kernel Logs</div>
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div></div>
              </div>
              <div className="font-mono text-[11px] space-y-3 max-h-[350px] overflow-y-auto pr-4">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-all"><span className="text-gray-700">[{log.time}]</span><span className={log.type === 'success' ? 'text-green-500' : log.type === 'ai' ? 'text-purple-400' : 'text-gray-500'}> {log.type === 'ai' ? '🤖' : '⚙️'} {log.msg}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

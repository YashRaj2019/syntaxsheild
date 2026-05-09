import React from 'react';
import { Github, Shield, Cpu, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-primary-500/30">
      {/* Navigation */}
      <nav className="border-b border-dark-800 bg-dark-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-500" />
            <span className="font-bold text-xl tracking-tight">SyntaxShield<span className="text-primary-500">.ai</span></span>
          </div>
          <button 
            onClick={handleLogin}
            className="bg-white text-dark-950 hover:bg-gray-200 px-5 py-2 rounded-full text-sm font-semibold transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 rounded-full text-primary-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Zap className="w-4 h-4" />
            <span>AI Code Review Platform v1.0 is Live</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Ship Safer Code <br />
            With <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">AI Agents.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed">
            Automate your PR reviews with custom AI pipelines. Catch security vulnerabilities, performance bugs, and logic flaws in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary-500/25"
            >
              <Github className="w-6 h-6" />
              Get Started with GitHub
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 border-t border-dark-800 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 group hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gemini-Powered</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Leverage the power of Google Gemini 1.5 Flash to perform deep contextual code analysis on every Pull Request.
              </p>
            </div>
            <div className="glass-panel p-8 group hover:border-accent-500/50 transition-colors">
              <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-accent-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Asynchronous Queues</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Built with Redis and BullMQ to handle large-scale code reviews without ever timing out your webhooks.
              </p>
            </div>
            <div className="glass-panel p-8 group hover:border-primary-500/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Visual Pipelines</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Build your own review workflow using our intuitive drag-and-drop ReactFlow builder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-dark-800 text-center">
        <p className="text-gray-500 text-sm">© 2024 SyntaxShield.ai - Built for Professional AI-Powered Code Reviews.</p>
      </footer>
    </div>
  );
};

export default Landing;

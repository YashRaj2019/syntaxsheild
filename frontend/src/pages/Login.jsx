import React from 'react';
import { Github, Shield } from 'lucide-react';

const Login = () => {
  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-700">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel p-10 max-w-md w-full text-center relative z-10 border-t border-t-white/10 shadow-2xl shadow-primary-500/10">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
          <Shield className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 tracking-tight">SyntaxShield</h1>
        <p className="text-gray-400 mb-8">AI-powered code reviews integrated directly into your GitHub workflow.</p>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-dark-900 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>
        
        <div className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Secure OAuth Authentication
        </div>
      </div>
    </div>
  );
};

export default Login;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Github, LogOut, Activity, Brain, Zap } from 'lucide-react';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-primary-500/10 rounded-lg group-hover:bg-primary-500/20 transition-colors">
            <Shield className="w-6 h-6 text-primary-500" />
          </div>
          <span className="font-bold text-xl tracking-tight">Syntax<span className="text-primary-400">Shield</span></span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <Activity className="w-4 h-4" />
            Dashboard
          </Link>
          
          <Link to="/insights" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <Brain className="w-4 h-4 text-purple-400" />
            Intelligence Hub
          </Link>

          <Link to="/status" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <Zap className="w-4 h-4 text-amber-400" />
            System Status
          </Link>
          
          <div className="h-6 w-px bg-dark-700"></div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

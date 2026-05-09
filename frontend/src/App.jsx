import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AuthSuccess from './pages/AuthSuccess';
import Insights from './pages/Insights';
import SystemStatus from './pages/SystemStatus';
import Navbar from './components/Navbar';
import { io } from 'socket.io-client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const socket = io(apiUrl);

    socket.on('review-completed', (data) => {
      console.log('Real-time review notification:', data);
      // In a real app, we'd use a nice toast library like react-hot-toast
      alert(`🚀 AI Review Completed for ${data.repoFullName} PR #${data.pullRequestNumber}!\n${data.commentCount} suggestions found.`);
      // Refresh dashboard if user is on it
      window.dispatchEvent(new Event('review-updated'));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-white selection:bg-primary-500 selection:text-white flex flex-col">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        <main className={`flex-1 w-full ${isAuthenticated ? 'max-w-7xl mx-auto p-4 md:p-8' : ''}`}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/success" element={<AuthSuccess setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/insights" element={isAuthenticated ? <Insights /> : <Navigate to="/" />} />
            <Route path="/status" element={isAuthenticated ? <SystemStatus /> : <Navigate to="/" />} />
            <Route path="/builder/:repoId" element={isAuthenticated ? <WorkflowBuilder /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

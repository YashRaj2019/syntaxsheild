import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Play, Save } from 'lucide-react';
import axios from 'axios';

const WorkflowBuilder = () => {
  const { repoId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await axios.get(`${apiUrl}/api/workflows/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNodes(res.data.nodes || []);
        setEdges(res.data.edges || []);
      } catch (error) {
        console.error('Failed to fetch workflow', error);
        alert('Failed to load workflow.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [repoId, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.put(`${apiUrl}/api/workflows/${repoId}`, { nodes, edges }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pipeline saved successfully!');
    } catch (error) {
      console.error('Failed to save pipeline', error);
      alert('Failed to save pipeline.');
    } finally {
      setSaving(false);
    }
  };

  const [simulating, setSimulating] = useState(false);

  const handleTestRun = async () => {
    setSimulating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.post(`${apiUrl}/api/repositories/${repoId}/simulate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🚀 Simulation Successful! Your Dashboard stats have been updated.");
      window.dispatchEvent(new Event('review-updated'));
    } catch (error) {
      alert("Simulation failed.");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
// ... existing loading UI ...
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[85vh] flex flex-col glass-panel overflow-hidden border border-dark-700/50 shadow-2xl">
      {/* Builder Header */}
      <header className="flex items-center justify-between p-4 border-b border-dark-700/50 bg-dark-900">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-semibold text-lg">Agent Workflow Planner</h2>
            <p className="text-xs text-gray-400">Editing flow for Repository</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleTestRun}
            disabled={simulating}
            className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-dark-600 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 text-green-400 ${simulating ? 'animate-spin' : ''}`} /> 
            {simulating ? 'Simulating...' : 'Test Run'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Pipeline'}
          </button>
        </div>
      </header>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full bg-[#121212]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Background color="#2a2a2a" gap={16} />
          <Controls className="bg-dark-800 border-dark-700 fill-white" />
          <MiniMap nodeColor="#6366f1" maskColor="rgba(18, 18, 18, 0.7)" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = ({ setIsAuthenticated }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setIsAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;

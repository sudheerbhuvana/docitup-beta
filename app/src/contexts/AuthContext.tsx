import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string, fullName?: string) => Promise<{ requiresVerification: boolean; email: string }>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // If it's demo mode, skip API verification
      if (storedToken === 'demo-token') {
        setLoading(false);
        return;
      }
      
      // Verify token by fetching profile
      authAPI.getProfile()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          // Only clear if not demo mode
          if (storedToken !== 'demo-token') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    logger.auth.login(email);
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    logger.auth.loginSuccess(user);
  };

  const register = async (email: string, password: string, username?: string, fullName?: string) => {
    const response = await authAPI.register({ email, password, username, fullName });
    
    // If registration requires OTP verification, return early
    if (response.data?.requiresVerification) {
      return { requiresVerification: true, email: response.data.email };
    }
    
    // Otherwise, complete registration (shouldn't happen with new flow)
    const { user, token } = response.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { requiresVerification: false, email };
  };
  
  const verifyOTP = async (email: string, code: string) => {
    const response = await authAPI.verifyOTP({ email, code });
    const { user, token } = response.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    logger.auth.loginSuccess(user);
  };
  
  const resendOTP = async (email: string) => {
    await authAPI.resendOTP({ email });
  };

  const logout = () => {
    logger.auth.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, verifyOTP, resendOTP, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


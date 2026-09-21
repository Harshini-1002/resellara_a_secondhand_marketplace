import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sellara_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sellara_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('sellara_token', authData.token);
      localStorage.setItem('sellara_user', JSON.stringify(authData));
      toast.success(`Welcome back, ${authData.fullName}!`);
      return authData;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await authApi.loginWithOtp(email, otp);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('sellara_token', authData.token);
      localStorage.setItem('sellara_user', JSON.stringify(authData));
      toast.success(`Welcome back, ${authData.fullName}!`);
      return authData;
    } catch (err) {
      toast.error(err.message || 'OTP login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('sellara_token', authData.token);
      localStorage.setItem('sellara_user', JSON.stringify(authData));
      toast.success(`Welcome to Sellara, ${authData.fullName}!`);
      return authData;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sellara_token');
    localStorage.removeItem('sellara_user');
    toast.success('Logged out successfully');
  };

  const isSeller = user?.role === 'ROLE_SELLER';
  const isBuyer = user?.role === 'ROLE_BUYER';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isSeller,
        isBuyer,
        loading,
        login,
        loginWithOtp,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
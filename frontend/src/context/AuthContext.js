import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// 配置 axios 默认值
axios.defaults.baseURL = 'http://localhost:8000/api';

// 创建认证上下文
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// 获取认证头部的函数
export const getAuthHeader = () => {
  const tokens = localStorage.getItem('tokens');
  if (tokens) {
    const { access } = JSON.parse(tokens);
    return {
      headers: {
        'Authorization': `Bearer ${access}`
      }
    };
  }
  return {};
};

// 辅助函数：显示通知 (可以替换为更复杂的通知系统)
const showToast = (message, type = 'info') => {
  // 简单实现，未来可以集成如 react-toastify
  console.log(`[${type.toUpperCase()}]: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 初始化：检查是否有保存的登录状态
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedTokens = localStorage.getItem('tokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          const decoded = jwt_decode(parsedTokens.access);
          const expirationTime = decoded.exp * 1000;

          if (Date.now() < expirationTime) {
            setTokens(parsedTokens);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access}`;
            const response = await axios.get('/api/users/me/');
            setCurrentUser(response.data);
            setIsAuthenticated(true);
          } else {
            await attemptRefreshToken(parsedTokens.refresh);
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        await performLogout(); // 使用 await 确保 logout 完成
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依赖项中移除了 refreshToken 和 logout，以避免不必要的重渲染循环

  // 尝试刷新令牌的函数
  const attemptRefreshToken = async (refreshTokenValue) => {
    try {
      const response = await axios.post('/api/token/refresh/', { refresh: refreshTokenValue });
      const { access } = response.data;
      const newTokens = { access, refresh: refreshTokenValue };
      localStorage.setItem('tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const userResponse = await axios.get('/api/users/me/');
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await performLogout(); // Token refresh failed, logout user
      return false;
    }
  };

  // 登录函数
  const login = async (username, password) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      const { user, access, refresh } = response.data;
      const newTokens = { access, refresh };
      localStorage.setItem('tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setCurrentUser(user);
      setIsAuthenticated(true);
      showToast('Login successful!', 'success');
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Login failed. Please check credentials.';
      setAuthError(errorMessage);
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (userData) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/register/', userData);
      showToast('Registration successful! Please login to continue.', 'success');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      // 更详细的错误处理
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data) {
        const errors = error.response.data;
        // Convert field errors to English
        const fieldErrors = Object.entries(errors).map(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          switch (field) {
            case 'username':
              return message.includes('already exists') ? 'Username already exists' : 'Username is required';
            case 'email':
              return message.includes('already exists') ? 'Email already exists' : 'Email is required';
            case 'password':
              return 'Password is required';
            case 'confirmPassword':
              return 'Please confirm your password';
            default:
              return message;
          }
        }).join('. ');
        if (fieldErrors) errorMessage = fieldErrors;
      }
      setAuthError(errorMessage);
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 登出函数 (内部使用，不直接暴露给 refreshToken)
  const performLogout = async () => {
    try {
      const currentTokens = JSON.parse(localStorage.getItem('tokens')); // Get fresh tokens
      if (currentTokens?.refresh) {
        await axios.post('/api/auth/logout/', { refresh: currentTokens.refresh });
      }
    } catch (error) {
      console.error('Logout request failed (token might be invalid):', error);
    } finally {
      localStorage.removeItem('tokens');
      setTokens(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      showToast('Logged out.', 'info');
    }
  };

  // 暴露给外部的登出函数
  const logout = async () => {
    setIsLoading(true);
    await performLogout();
    setIsLoading(false);
  };

  // 更新用户信息
  const updateUserProfileContext = async (userData) => {
    // Renamed to avoid conflict with updateUser in API file
    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/users/${currentUser.id}/`, userData);
      setCurrentUser(response.data);
      showToast('Profile updated successfully!', 'success');
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile.';
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    tokens,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    attemptRefreshToken,
    updateUserProfileContext,
    showToast,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
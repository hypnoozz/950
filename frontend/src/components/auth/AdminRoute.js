import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 管理员路由保护组件
 * 只允许管理员和员工角色访问
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  // 用户未登录或不是管理员/员工角色时重定向到首页
  if (!isAuthenticated || (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 
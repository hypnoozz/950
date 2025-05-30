import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminLayout = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果用户不是管理员或员工，则重定向到首页
    if (!isLoading && (!isAuthenticated || (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff'))) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  // 确保只有已认证的管理员或员工可以访问
  if (!isAuthenticated || (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
    return null; // 返回空组件，useEffect会处理重定向
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <AdminSidebar />
      
      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        
        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
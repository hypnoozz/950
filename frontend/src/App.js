import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 导入布局组件
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/admin/AdminLayout';

// 导入前台页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import SchedulesPage from './pages/courses/SchedulesPage';
import MembershipPage from './pages/membership/MembershipPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// 导入管理后台页面组件
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/users/UserManagementPage';
import CourseManagementPage from './pages/admin/courses/CourseManagementPage';
import CategoryManagementPage from './pages/admin/courses/CategoryManagementPage';
import ScheduleManagementPage from './pages/admin/courses/ScheduleManagementPage';
import EnrollmentManagementPage from './pages/admin/courses/EnrollmentManagementPage';
import InstructorManagementPage from './pages/admin/instructors/InstructorManagementPage';
import MembershipPlanManagementPage from './pages/admin/membership/MembershipPlanManagementPage';
import OrderManagementPage from './pages/admin/orders/OrderManagementPage';
import MemberManagementPage from './pages/admin/members/MemberManagementPage';

// 导入新创建的管理后台组件
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserPage from './pages/admin/AdminUserPage';

// 导入权限组件
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { useAuth } from './context/AuthContext';

// 导入新添加的统计报表页面和系统设置页面
import ReportsPage from './pages/admin/reports/ReportsPage';
import SettingsPage from './pages/admin/settings/SettingsPage';

// ...

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 管理员登录路由 - 需要放在管理后台路由之前 */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* 管理后台路由 */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="schedules" element={<ScheduleManagementPage />} />
        <Route path="enrollments" element={<EnrollmentManagementPage />} />
        <Route path="instructors" element={<InstructorManagementPage />} />
        <Route path="membership" element={<MembershipPlanManagementPage />} />
        <Route path="orders" element={<OrderManagementPage />} />
        <Route path="members" element={<MemberManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* 更多后台页面路由 */}
      </Route>

      {/* 前台路由 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" replace />}
        />
        <Route
          path="register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/profile" replace />}
        />

        {/* 需要登录才能访问的页面 */}
        <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="courses/schedules" element={<SchedulesPage />} />
        <Route path="membership" element={<MembershipPage />} />
        <Route path="orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />

        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App; 
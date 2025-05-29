import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  Settings, 
  Tag,
  BarChart,
  BookOpen,
  Layers,
  UserCog,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center px-4 py-3 ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-200'} rounded-md transition-colors duration-150`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{label}</span>
  </Link>
);

const AdminSidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAdmin = currentUser?.role === 'admin';
  
  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Control Panel', exact: true },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/members', icon: UserPlus, label: 'Member Management' },
    { to: '/admin/instructors', icon: UserCog, label: 'Instructor Management' },
    { to: '/admin/categories', icon: Layers, label: 'Course Category' },
    { to: '/admin/courses', icon: Dumbbell, label: 'Course Management' },
    { to: '/admin/schedules', icon: Calendar, label: 'Course Schedule' },
    { to: '/admin/enrollments', icon: ClipboardList, label: 'Course Enrollment' },
    { to: '/admin/membership', icon: Tag, label: 'Member Package' },
    { to: '/admin/orders', icon: CreditCard, label: 'Order Management' },
    { to: '/admin/reports', icon: BarChart, label: 'Statistical Report' },
    // 只有管理员可以看到的菜单
    ...(isAdmin ? [{ to: '/admin/settings', icon: Settings, label: 'System Settings' }] : []),
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="bg-white w-64 border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/admin" className="flex items-center justify-center space-x-2">
          <Dumbbell className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-gray-800">Fitness Management System</span>
        </Link>
      </div>
      
      {/* 导航菜单 */}
      <nav className="mt-6 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavItem 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            label={item.label} 
            isActive={isActive(item.to, item.exact)}
          />
        ))}
      </nav>
      
      {/* 用户信息 */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {currentUser?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{currentUser?.username || 'Admin'}</p>
            <p className="text-xs text-gray-500">{currentUser?.role === 'admin' ? 'Admin' : 'Employee'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, Sun, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminHeader = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center w-1/3 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Theme Toggle */}
          <button className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
            <Sun className="w-5 h-5" />
          </button>
          
          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium hidden md:inline">{currentUser?.username || 'Admin'}</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl border border-gray-200 invisible group-hover:visible transition-all duration-150 z-10">
              <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <User className="w-4 h-4 mr-2" />
                Profile
              </a>
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 
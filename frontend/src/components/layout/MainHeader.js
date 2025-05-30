import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, LogOut, User, LayoutDashboard, Dumbbell, CalendarDays, Sparkles, HomeIcon } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';

const NavLink = ({ to, children, icon }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-primary-light/20 rounded-md transition-colors duration-150"
  >
    {icon && React.createElement(icon, { className: "w-5 h-5 mr-2" })}
    {children}
  </Link>
);

const MainHeader = () => {
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center text-2xl font-bold text-primary">
            <Dumbbell className="w-8 h-8 mr-2 text-primary-light" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">GymSys</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <NavLink to="/" icon={HomeIcon}>Home</NavLink>
            <NavLink to="/courses" icon={Dumbbell}>Courses</NavLink>
            <NavLink to="/courses/schedules" icon={CalendarDays}>Schedules</NavLink>
            <NavLink to="/membership" icon={Sparkles}>Membership</NavLink>
          </nav>

          {/* Auth Links & User Info */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : isAuthenticated && currentUser ? (
              <>
                <NavLink to="/profile" icon={User}>
                  {currentUser.username}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors duration-150"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" icon={LogIn}>Login</NavLink>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors duration-150 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader; 
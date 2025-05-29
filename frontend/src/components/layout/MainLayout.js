import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from './MainHeader';
import MainFooter from './MainFooter';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-900 text-gray-100">
      {/* Background image will be applied via global styles in index.css */}
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24"> 
        {/* pt-24 to account for fixed header height (approx 6rem or 96px) */}
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
};

export default MainLayout; 
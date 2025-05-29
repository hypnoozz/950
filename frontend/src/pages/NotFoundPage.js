import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-6 text-secondary flex justify-center">
          <AlertTriangle className="h-24 w-24" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">404</span>
        </h1>
        
        <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
        
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors duration-300 shadow-lg"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Homepage
        </Link>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default NotFoundPage; 
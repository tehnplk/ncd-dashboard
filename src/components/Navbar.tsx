'use client'

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-blue-600 py-2 px-3 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold hover:opacity-90 transition-opacity duration-200 flex items-center">
          <img src="/icon/doctor.png" alt="Doctor" className="h-6 w-6 mr-1.5 object-contain" />
          NCD Dashboard
        </Link>
        <div className="flex space-x-2">
          <Link 
            href="/amp/carb" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <img src="/icon/carb.png" alt="Carb Icon" className="h-4 w-4 mr-1.5 object-contain" /> Carb
          </Link>
          <Link 
            href="/amp/prevention" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <img src="/icon/prevention.png" alt="Prevention Icon" className="h-4 w-4 mr-1.5 object-contain" /> Prevention
          </Link>
          <Link 
            href="/amp/remission" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <img src="/icon/remission.png" alt="Remission Icon" className="h-4 w-4 mr-1.5 object-contain" /> Remission
          </Link>
          <Link 
            href="/" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <img src="/icon/growth.png" alt="Overview Icon" className="h-4 w-4 mr-1.5 object-contain" /> ภาพรวม
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <img src="/icon/logout.png" alt="Logout Icon" className="h-4 w-4 mr-1.5 object-contain" /> Logout({username})
            </button>
          ) : (
            <Link 
              href="/login" 
              className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <img src="/icon/login.png" alt="Login Icon" className="h-4 w-4 mr-1.5 object-contain" /> Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

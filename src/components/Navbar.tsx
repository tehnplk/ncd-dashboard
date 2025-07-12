import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 py-2 px-3 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold hover:opacity-90 transition-opacity duration-200 flex items-center">
          <img src="/icon/doctor.png" alt="Doctor" className="h-6 w-6 mr-1.5 object-contain" />
          NCD Dashboard
        </Link>
        <div className="flex space-x-2">
          <Link 
            href="/carb" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <span className="mr-1.5">📊</span> Carb
          </Link>
          <Link 
            href="/prevention" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <span className="mr-1.5">🛡️</span> Prevention
          </Link>
          <Link 
            href="/remission" 
            className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <span className="mr-1.5">📉</span> Remission
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

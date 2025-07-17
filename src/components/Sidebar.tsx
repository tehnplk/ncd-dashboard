'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    // For the root path, only match exactly
    if (path === '/') {
      return pathname === path;
    }
    // For other paths, match if the pathname starts with the path and is followed by a slash or the end of the string
    return pathname === path || 
           (pathname.startsWith(path) && 
            (pathname[path.length] === '/' || pathname.length === path.length));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      href: '/',
      label: 'ภาพรวม',
      icon: '/icon/growth.png',
      alt: 'Overview Icon'
    },
    {
      href: '/amp/carb',
      label: 'Carb',
      icon: '/icon/carb.png',
      alt: 'Carb Icon'
    },
    {
      href: '/amp/prevention',
      label: 'Prevention',
      icon: '/icon/prevention.png',
      alt: 'Prevention Icon'
    },
    {
      href: '/amp/remission',
      label: 'Remission',
      icon: '/icon/remission.png',
      alt: 'Remission Icon'
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-56'} bg-blue-600 min-h-screen shadow-lg flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-blue-500 flex items-center justify-between">
        <Link href="/" className={`text-white text-xl font-bold hover:opacity-90 transition-opacity duration-200 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <img src="/icon/doctor.png" alt="Doctor" className="h-8 w-8 object-contain" />}
          {!isCollapsed && <span className="ml-3">NCDs</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-white p-1 rounded-md hover:bg-blue-700 transition-colors duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center rounded-lg text-white transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-700 border-l-4 border-white'
                    : 'hover:bg-blue-700'
                } ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`}
                title={isCollapsed ? item.label : ''}
              >
                <img 
                  src={item.icon} 
                  alt={item.alt} 
                  className={`h-5 w-5 object-contain ${isCollapsed ? 'mx-auto' : ''}`}
                />
                {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
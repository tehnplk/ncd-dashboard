'use client'

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
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
    <div className="w-56 bg-blue-600 min-h-screen shadow-lg flex flex-col">
      {/* Logo/Header */}
      <div className="p-4 border-b border-blue-500">
        <Link href="/" className="text-white text-xl font-bold hover:opacity-90 transition-opacity duration-200 flex items-center">
          <img src="/icon/doctor.png" alt="Doctor" className="h-8 w-8 mr-3 object-contain" />
          NCDs
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-white transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-700 border-l-4 border-white'
                    : 'hover:bg-blue-700'
                }`}
              >
                <img 
                  src={item.icon} 
                  alt={item.alt} 
                  className="h-5 w-5 mr-3 object-contain" 
                />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
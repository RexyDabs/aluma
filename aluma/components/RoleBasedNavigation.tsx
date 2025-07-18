'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, getNavigationItems, canAccessPage } from '../lib/auth';
import type { User } from '../lib/auth';
import { Badge } from './ui/badge';

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
}

export default function RoleBasedNavigation() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function initializeNavigation() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      if (user) {
        const items = getNavigationItems(user);
        setNavigationItems(items);
      }
      
      setLoading(false);
    }
    
    initializeNavigation();
  }, []);

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900">Aluma</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!currentUser) {
    return (
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
                Aluma
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 mr-8 hover:text-blue-600">
              Aluma
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const canAccess = canAccessPage(currentUser, item.href);
                  
                  if (!canAccess) return null;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{currentUser.full_name}</span>
              <Badge className={getRoleBadgeColor(currentUser.role)}>
                {currentUser.role}
              </Badge>
              {process.env.NODE_ENV === 'development' && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  DEV
                </Badge>
              )}
            </div>
            <button
              onClick={async () => {
                // Handle both Supabase auth and dev bypass logout
                if (process.env.NODE_ENV === 'development') {
                  localStorage.removeItem('dev-user');
                }
                await fetch('/api/auth/signout', { method: 'POST' });
                window.location.href = '/';
              }}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const canAccess = canAccessPage(currentUser, item.href);
              
              if (!canAccess) return null;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function getRoleBadgeColor(role: string): string {
  const roleColors: Record<string, string> = {
    'admin': 'bg-red-100 text-red-800',
    'manager': 'bg-purple-100 text-purple-800',
    'technician': 'bg-blue-100 text-blue-800',
    'subcontractor': 'bg-orange-100 text-orange-800',
    'staff': 'bg-gray-100 text-gray-800',
  };
  
  return roleColors[role] || 'bg-gray-100 text-gray-800';
} 
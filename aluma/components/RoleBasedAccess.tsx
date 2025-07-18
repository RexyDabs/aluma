'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentUser, canAccessPage } from '../lib/auth';
import type { User } from '../lib/auth';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export default function RoleBasedAccess({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  showLoading = true,
}: RoleBasedAccessProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check role-based access
      if (requiredRole && user.role !== requiredRole) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check permission-based access
      if (requiredPermission) {
        const canAccess = canAccessPage(user, requiredPermission);
        setHasAccess(canAccess);
      } else {
        setHasAccess(true);
      }
      
      setLoading(false);
    }
    
    checkAccess();
  }, [requiredPermission, requiredRole]);

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {currentUser && (
              <span className="block mt-2">
                Your current role: <span className="font-medium">{currentUser.role}</span>
              </span>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string,
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleBasedAccess requiredPermission={requiredPermission} requiredRole={requiredRole}>
        <Component {...props} />
      </RoleBasedAccess>
    );
  };
}

// Hook for checking permissions in components
export function useRoleAccess(requiredPermission?: string, requiredRole?: string) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (requiredPermission) {
        const canAccess = canAccessPage(user, requiredPermission);
        setHasAccess(canAccess);
      } else {
        setHasAccess(true);
      }
      
      setLoading(false);
    }
    
    checkAccess();
  }, [requiredPermission, requiredRole]);

  return { currentUser, loading, hasAccess };
} 
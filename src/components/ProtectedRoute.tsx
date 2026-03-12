'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export function ProtectedRoute({ children, requiredAdmin = false }: { children: React.ReactNode; requiredAdmin?: boolean }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found');
          router.push('/login');
          return;
        }

        // Verify token with server
        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // User must be valid
        if (!response.data.valid) {
          console.warn('Invalid token');
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }

        // User must be admin to access dashboard
        if (!response.data.isAdmin) {
          console.warn('User is not an admin');
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Authorization error:', error);
        setError(error.message || 'Authorization failed');
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    };

    verifyToken();
  }, [router, requiredAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block border-4 border-primary border-t-transparent rounded-full w-10 h-10 animate-spin mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error || 'Access Denied'}</p>
          <p className="text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

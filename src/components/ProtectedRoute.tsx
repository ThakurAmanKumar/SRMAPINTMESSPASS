'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export function ProtectedRoute({ children, requiredAdmin = false }: { children: React.ReactNode; requiredAdmin?: boolean }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If admin access is required, check if user is admin
        if (requiredAdmin && !response.data.isAdmin) {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

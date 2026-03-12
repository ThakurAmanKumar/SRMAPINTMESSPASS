'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, History, AlertCircle, Database } from 'lucide-react';

interface Statistics {
  totalAdmins: number;
  totalPasses: number;
  totalRequests: number;
  revokedPasses: number;
}

interface ActivityStats {
  total: number;
  last24h: number;
  byType: Array<{ _id: string; count: number }>;
}

interface DatabaseStats {
  storage: {
    used: { bytes: number; mb: number; gb: number };
    available: { bytes: number; mb: number; gb: number };
    total: { bytes: number; mb: number; gb: number };
    percentageUsed: number;
    percentageAvailable: number;
  };
  database: {
    dataSize: { bytes: number; mb: number; gb: number };
    collections: number;
    indexes: number;
  };
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('superadmin-token');
        
        // Fetch system statistics
        const statsResponse = await axios.get('/api/superadmin/statistics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsResponse.data.statistics);
        setActivityStats(statsResponse.data.statistics.activityStats);

        // Fetch database storage stats
        const dbStatsResponse = await axios.get('/api/superadmin/database-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDbStats(dbStatsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#484622' }}>Super Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system activity and manage administrators</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-3" size={20} />
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Admins */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#484622' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Admins</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#484622' }}>{stats?.totalAdmins || 0}</p>
            </div>
            <Users size={40} style={{ color: '#484622' }} />
          </div>
        </div>

        {/* Total Passes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#10b981' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Passes</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{stats?.totalPasses || 0}</p>
            </div>
            <FileText size={40} className="text-green-600" />
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#a855f7' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Requests</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">{stats?.totalRequests || 0}</p>
            </div>
            <History size={40} className="text-purple-600" />
          </div>
        </div>

        {/* Database Storage */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#0284c7' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Storage Used</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#0284c7' }}>
                {dbStats ? `${dbStats.storage.used.gb.toFixed(2)} GB` : '-- GB'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dbStats ? `${dbStats.storage.percentageUsed.toFixed(1)}% of ${dbStats.storage.total.gb.toFixed(2)} GB` : 'Loading...'}
              </p>
            </div>
            <Database size={40} style={{ color: '#0284c7' }} />
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#484622' }}>Activity Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: '#efeee3' }}>
              <span className="text-gray-700">Total Actions (All Time)</span>
              <span className="text-2xl font-bold" style={{ color: '#484622' }}>{activityStats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: '#efeee3' }}>
              <span className="text-gray-700">Actions (Last 24 Hours)</span>
              <span className="text-2xl font-bold text-green-600">{activityStats?.last24h || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#484622' }}>Actions by Type</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activityStats?.byType && activityStats.byType.length > 0 ? (
              activityStats.byType.map((action) => (
                <div key={action._id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: '#efeee3' }}>
                  <span className="text-gray-700 font-medium">{action._id}</span>
                  <span className="px-3 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: '#484622' }}>
                    {action.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/SupAdm/protected/admins"
          className="text-white rounded-lg p-6 text-center transition transform hover:scale-105 shadow-md"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
        >
          <Users size={32} className="mx-auto mb-2" />
          <p className="font-semibold text-lg">Manage Admins</p>
          <p className="text-sm mt-1 opacity-90">View, add, or remove administrators</p>
        </a>

        <a
          href="/SupAdm/protected/history"
          className="text-white rounded-lg p-6 text-center transition transform hover:scale-105 shadow-md"
          style={{ backgroundColor: '#a855f7' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a855f7'}
        >
          <History size={32} className="mx-auto mb-2" />
          <p className="font-semibold text-lg">Activity History</p>
          <p className="text-sm mt-1 opacity-90">View all admin activities and actions</p>
        </a>

        <a
          href="/"
          className="text-white rounded-lg p-6 text-center transition transform hover:scale-105 shadow-md"
          style={{ backgroundColor: '#10b981' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          <FileText size={32} className="mx-auto mb-2" />
          <p className="font-semibold text-lg">Main Portal</p>
          <p className="text-sm mt-1 opacity-90">Return to main portal</p>
        </a>
      </div>
    </div>
  );
}

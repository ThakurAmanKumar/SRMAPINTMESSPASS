'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, 
  CheckCircle, 
  BarChart3, 
  Zap, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  FileText,
  Plus,
  Search,
  Calendar,
  UserCheck,
  AlertCircle,
  Activity,
  RefreshCw,
  XCircle,
  Hourglass
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Statistics {
  totalPasses: number;
  todaysPasses: number;
  totalStudents: number;
  last7Days: { date: string; dayName: string; passes: number; requests: number }[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  hourlyData: { hour: string; passes: number }[];
}

interface PassRequest {
  _id: string;
  requestNumber: string;
  fullName: string;
  registrationNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// Color palette
const COLORS = {
  primary: '#484622',
  secondary: '#6b6b32',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  yellow: '#d4a017'
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentRequests, setRecentRequests] = useState<PassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch statistics
      const statsResponse = await axios.get('/api/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsResponse.data);

      // Fetch recent pass requests
      const requestsResponse = await axios.get('/api/pass-requests/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get only the 5 most recent requests
      const allRequests = requestsResponse.data.requests || [];
      const sortedRequests = allRequests
        .sort((a: PassRequest, b: PassRequest) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
        .slice(0, 5);
      setRecentRequests(sortedRequests);
      
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh: longer interval on mobile, faster on desktop
    // Detect mobile to optimize battery usage
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const refreshInterval = isMobile ? 120000 : 60000; // 2 min on mobile, 1 min on desktop
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle size={14} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            <XCircle size={14} /> Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            <Hourglass size={14} /> Pending
          </span>
        );
    }
  };

  // Prepare pie chart data
  const statusData = stats ? [
    { name: 'Pending', value: stats.pendingCount, color: COLORS.amber },
    { name: 'Approved', value: stats.approvedCount, color: COLORS.emerald },
    { name: 'Rejected', value: stats.rejectedCount, color: COLORS.red }
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <div className="w-full h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={24} className="text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCount = recentRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full dashboard-bg">
      {/* Animated Background Pattern - Hidden on mobile for better performance */}
      <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 gradient-blob-1"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 rounded-full opacity-15 gradient-blob-2"></div>
        <div className="absolute bottom-20 right-1/3 w-40 h-40 rounded-full opacity-10 gradient-blob-3"></div>
      </div>

      <div className="p-3 md:p-4 lg:p-6 xl:p-8 relative z-10 w-full">
        {/* Hero Section */}
        <div className="mb-4 md:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-primary to-[#6b6b32] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white shadow-xl mb-4 md:mb-6 lg:mb-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                    <Zap size={20} className="md:text-[28px] text-yellow-300" />
                  </div>
                  <span className="text-yellow-300 font-semibold tracking-wide uppercase text-xs md:text-sm">Admin Portal</span>
                </div>
                <button 
                  onClick={fetchData}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-white hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs md:text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-3">International Mess Pass</h1>
              <p className="text-sm md:text-base lg:text-xl text-yellow-100 max-w-2xl">
                Manage international mess passes and student access efficiently
              </p>
              
              {/* Quick Stats in Hero */}
              <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6 mt-4 md:mt-6 lg:mt-8 pt-3 md:pt-4 lg:pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                    <CheckCircle size={16} className="md:text-[20px] text-white" />
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold">{stats?.totalPasses || 0}</p>
                    <p className="text-yellow-200 text-xs md:text-sm">Total Passes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                    <BarChart3 size={16} className="md:text-[20px] text-white" />
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold">{stats?.todaysPasses || 0}</p>
                    <p className="text-yellow-200 text-xs md:text-sm">Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                    <Users size={16} className="md:text-[20px] text-white" />
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold">{stats?.totalStudents || 0}</p>
                    <p className="text-yellow-200 text-xs md:text-sm">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                    <Activity size={16} className="md:text-[20px] text-white" />
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold">{stats?.pendingCount || 0}</p>
                    <p className="text-yellow-200 text-xs md:text-sm">Pending</p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="mt-4 text-xs text-yellow-200/70">
                  Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Charts & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Passes Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <CheckCircle size={28} className="text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                    <TrendingUp size={16} />
                    <span>+12%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Passes</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats?.totalPasses || 0}</p>
                <p className="text-gray-400 text-xs mt-2">All-time issued</p>
              </div>

              {/* Today's Passes Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <BarChart3 size={28} className="text-amber-600" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                    <TrendingUp size={16} />
                    <span>+8%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Today&apos;s Passes</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats?.todaysPasses || 0}</p>
                <p className="text-gray-400 text-xs mt-2">Issued today</p>
              </div>

              {/* Total Students Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Users size={28} className="text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
                    <TrendingUp size={16} />
                    <span>+5%</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Students</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats?.totalStudents || 0}</p>
                <p className="text-gray-400 text-xs mt-2">Registered users</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 7-Day Passes Trend - Area Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Weekly Pass Trends
                  </h3>
                  <span className="text-xs text-gray-400">Last 7 days</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats?.last7Days || []}>
                    <defs>
                      <linearGradient id="colorPasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dayName" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="passes" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPasses)" 
                      name="Passes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Requests vs Passes - Bar Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    Requests vs Passes
                  </h3>
                  <span className="text-xs text-gray-400">Last 7 days</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.last7Days || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dayName" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Bar dataKey="requests" fill={COLORS.amber} radius={[4, 4, 0, 0]} name="Requests" />
                    <Bar dataKey="passes" fill={COLORS.emerald} radius={[4, 4, 0, 0]} name="Passes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  Today&apos;s Hourly Activity
                </h3>
                <span className="text-xs text-gray-400">Passes issued per hour</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats?.hourlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#888" fontSize={10} interval={2} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="passes" 
                    stroke={COLORS.purple} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.purple, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: COLORS.purple }}
                    name="Passes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Requests Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
                  <p className="text-gray-500 text-sm mt-1">Latest pass requests from students</p>
                </div>
                <a 
                  href="/dashboard/pass-requests" 
                  className="flex items-center gap-2 text-primary font-semibold hover:text-yellow-700 transition-colors"
                >
                  View All <ArrowRight size={18} />
                </a>
              </div>
              
              {recentRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No requests yet</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto md:overflow-x-visible">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-300">
                        <th className="px-3 md:px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Student</th>
                        <th className="px-3 md:px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Registration</th>
                        <th className="px-3 md:px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Request No.</th>
                        <th className="px-3 md:px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Date Submitted</th>
                        <th className="px-3 md:px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request) => (
                        <tr 
                          key={request._id}
                          className="hover:bg-yellow-50 transition-colors duration-150 cursor-pointer border-b border-gray-150"
                        >
                          {/* Student Name */}
                          <td className="px-3 md:px-5 py-3 md:py-4 border-r border-gray-150">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-gradient-to-br from-primary to-[#6b6b32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {request.fullName.charAt(0).toUpperCase()}
                              </div>
                              <p className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-1">{request.fullName}</p>
                            </div>
                          </td>

                          {/* Registration Number */}
                          <td className="px-3 md:px-5 py-3 md:py-4 border-r border-gray-150">
                            <p className="text-xs md:text-sm text-gray-600 font-medium line-clamp-1">{request.registrationNumber}</p>
                          </td>

                          {/* Request Number */}
                          <td className="px-3 md:px-5 py-3 md:py-4 border-r border-gray-150">
                            <p className="text-xs md:text-sm text-gray-500 font-mono line-clamp-1">{request.requestNumber}</p>
                          </td>

                          {/* Date */}
                          <td className="px-3 md:px-5 py-3 md:py-4 border-r border-gray-150">
                            <p className="text-xs md:text-sm text-gray-600">{new Date(request.submittedAt).toLocaleDateString('en-IN')}</p>
                          </td>

                          {/* Status */}
                          <td className="px-3 md:px-5 py-3 md:py-4 text-center">
                            {getStatusBadge(request.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6 flex flex-col">
            {/* Request Status Overview - Candlestick-like */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Request Status Overview
              </h3>
              
              {statusData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="space-y-2">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No requests yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/issue-pass"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary to-[#6b6b32] text-white hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <div>
                  <p className="font-bold">Issue New Pass</p>
                  <p className="text-yellow-200 text-sm">Create pass for student</p>
                  </div>
                </a>
                
                <a
                  href="/dashboard/issued-passes"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-primary hover:bg-white transition-all duration-300"
                >
                  <div className="bg-gray-100 group-hover:bg-primary/10 p-2 rounded-lg transition-colors">
                    <FileText size={24} className="text-gray-600 group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">View All Passes</p>
                    <p className="text-gray-500 text-sm">Browse issued passes</p>
                  </div>
                </a>
                
                <a
                  href="/dashboard/pass-requests"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-primary hover:bg-white transition-all duration-300"
                >
                  <div className="bg-gray-100 group-hover:bg-primary/10 p-2 rounded-lg transition-colors">
                    <Search size={24} className="text-gray-600 group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Pass Requests</p>
                    <p className="text-gray-500 text-sm">Review pending requests</p>
                  </div>
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </a>
              </div>
            </div>


          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            © 2024 SRM University AP • International Mess Committee • All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

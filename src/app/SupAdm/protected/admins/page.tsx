'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertCircle, Check } from 'lucide-react';

interface Admin {
  _id: string;
  email: string;
  createdAt: string;
}

export default function AdminsManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin-token');
      const response = await axios.get('/api/superadmin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.admins);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('superadmin-token');
      await axios.post('/api/superadmin/admins', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Admin added successfully');
      setFormData({ email: '', password: '' });
      setShowAddForm(false);
      await fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${adminEmail}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('superadmin-token');
      await axios.delete(`/api/superadmin/admins?id=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Admin deleted successfully');
      await fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#484622' }}>Manage Admins</h1>
          <p className="text-gray-600 mt-1">Total Admins: <span className="font-bold" style={{ color: '#484622' }}>{admins.length}</span></p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition font-semibold"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
        >
          <Plus size={20} />
          <span>Add New Admin</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-3" size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <Check className="mr-3" size={20} />
          {success}
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#484622' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#484622' }}>Create New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="admin@srmap.edu.in"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                style={{ backgroundColor: '#10b981' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 text-white py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4" style={{ borderColor: '#484622' }}>
        {admins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: '#efeee3' }}>
                <tr style={{ borderBottom: '2px solid #484622' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Created Date</th>
                  <th className="px-6 py-4 text-right text-sm font-bold" style={{ color: '#484622' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr
                    key={admin._id}
                    style={{ 
                      borderBottom: '1px solid #d1d5db',
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafaf9'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#efeee3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafaf9'}
                  >
                    <td className="px-6 py-4 text-gray-800 font-semibold text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                        className="font-semibold flex items-center space-x-1 ml-auto transition px-3 py-1 rounded"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={18} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No admins found. Click &quot;Add New Admin&quot; to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

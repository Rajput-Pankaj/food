import { useState } from 'react';
import { getPublicUsers, updateUserRole } from '../../utils/authStorage';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export default function AdminUsers() {
  const { user, refreshUser } = useAuth();
  const [users, setUsers] = useState(getPublicUsers);

  const handleRoleChange = (userId, role) => {
    if (userId === user?.id && role !== ROLES.ADMIN) {
      alert('You cannot remove your own admin access.');
      return;
    }
    updateUserRole(userId, role);
    setUsers(getPublicUsers());
    refreshUser();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Users</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-0.5">
          Manage customer and admin accounts ({users.length} total)
        </p>
      </div>

      {/* Mobile & tablet cards */}
      <div className="md:hidden space-y-3">
        {users.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{entry.name}</p>
                <p className="text-sm text-gray-500 truncate">{entry.email}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                  entry.role === ROLES.ADMIN
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {entry.role}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">
                Joined{' '}
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : '—'}
              </span>
              <select
                value={entry.role}
                onChange={(e) => handleRoleChange(entry.id, e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500 bg-white"
                disabled={entry.id === user?.id}
                aria-label={`Change role for ${entry.name}`}
              >
                <option value={ROLES.CUSTOMER}>customer</option>
                <option value={ROLES.ADMIN}>admin</option>
              </select>
            </div>
            {entry.id === user?.id && (
              <p className="text-xs text-gray-400 mt-2">You cannot change your own role</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 lg:px-5 py-3 font-semibold text-gray-700">Name</th>
                <th className="text-left px-4 lg:px-5 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 lg:px-5 py-3 font-semibold text-gray-700">Role</th>
                <th className="text-left px-4 lg:px-5 py-3 font-semibold text-gray-700">Joined</th>
                <th className="text-left px-4 lg:px-5 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 lg:px-5 py-4 font-medium text-gray-800">{entry.name}</td>
                  <td className="px-4 lg:px-5 py-4 text-gray-600">{entry.email}</td>
                  <td className="px-4 lg:px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        entry.role === ROLES.ADMIN
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {entry.role}
                    </span>
                  </td>
                  <td className="px-4 lg:px-5 py-4 text-gray-500 whitespace-nowrap">
                    {entry.createdAt
                      ? new Date(entry.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 lg:px-5 py-4">
                    <select
                      value={entry.role}
                      onChange={(e) => handleRoleChange(entry.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                      disabled={entry.id === user?.id}
                    >
                      <option value={ROLES.CUSTOMER}>customer</option>
                      <option value={ROLES.ADMIN}>admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

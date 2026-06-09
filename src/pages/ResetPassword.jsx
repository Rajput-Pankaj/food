import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ResetPassword() {
  useDocumentTitle('Reset Password');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      navigate('/login', { state: { message: 'Password reset. Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          minLength={8}
          required
          className="w-full border rounded-lg px-3 py-2.5"
        />
        <button type="submit" disabled={loading || !token} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60">
          {loading ? 'Saving...' : 'Reset Password'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-green-600 font-semibold hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}

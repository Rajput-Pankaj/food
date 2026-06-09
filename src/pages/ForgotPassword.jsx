import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ForgotPassword() {
  useDocumentTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevToken('');
    setLoading(true);
    try {
      const result = await authApi.forgotPassword({ email });
      setMessage(result.message);
      if (result.resetToken) {
        setDevToken(result.resetToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll send reset instructions if the email exists">
      {message && (
        <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          {message}
        </div>
      )}
      {devToken && (
        <div className="mb-4 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-left space-y-2">
          <p className="font-semibold">Development reset token</p>
          <p className="font-mono text-xs break-all">{devToken}</p>
          <Link
            to={`/reset-password?token=${encodeURIComponent(devToken)}`}
            className="inline-block text-green-700 font-semibold hover:underline"
          >
            Open reset page
          </Link>
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full border rounded-lg px-3 py-2.5"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-green-600 font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

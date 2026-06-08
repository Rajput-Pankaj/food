import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LuLogIn } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPostLoginPath } from '../utils/authRedirect';
import AuthLayout from '../components/auth/AuthLayout';
import AuthFormField from '../components/auth/AuthFormField';

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@foodexpress.com', password: 'Admin@12345', color: 'purple' },
  { role: 'Customer', email: 'customer@foodexpress.com', password: 'Customer@123', color: 'green' },
];

export default function Login() {
  useDocumentTitle('Login');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState('');

  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getPostLoginPath(user, from), { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');
      try {
        const sessionUser = await login(values);
        navigate(getPostLoginPath(sessionUser, from), { replace: true });
      } catch (error) {
        setSubmitError(error.message || 'Login failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fillDemo = (email, password) => {
    formik.setFieldValue('email', email);
    formik.setFieldValue('password', password);
    setSubmitError('');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to checkout, track orders, and manage your account"
    >
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800 mb-3">Try a demo account</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => fillDemo(account.email, account.password)}
              className={`flex-1 text-left px-3 py-2.5 rounded-lg border bg-white text-sm hover:shadow-sm transition-all ${
                account.color === 'purple'
                  ? 'border-purple-200 hover:border-purple-300'
                  : 'border-green-200 hover:border-green-300'
              }`}
            >
              <span
                className={`text-xs font-bold uppercase ${
                  account.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                }`}
              >
                {account.role}
              </span>
              <p className="text-gray-600 text-xs mt-0.5 truncate">{account.email}</p>
            </button>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="mb-5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {submitError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <AuthFormField
          label="Email address"
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.email}
          error={formik.errors.email}
          touched={formik.touched.email}
        />

        <AuthFormField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.password}
          error={formik.errors.password}
          touched={formik.touched.password}
        />

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <LuLogIn className="w-5 h-5" />
          {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-green-600 font-semibold hover:underline">
          Create free account
        </Link>
      </p>
    </AuthLayout>
  );
}

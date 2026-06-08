import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LuUserPlus } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPostLoginPath } from '../utils/authRedirect';
import AuthLayout from '../components/auth/AuthLayout';
import AuthFormField from '../components/auth/AuthFormField';

const validationSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function Signup() {
  useDocumentTitle('Sign Up');
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getPostLoginPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError('');
      try {
        const sessionUser = await signup({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        resetForm();
        navigate(getPostLoginPath(sessionUser));
      } catch (error) {
        setSubmitError(error.message || 'Sign up failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join as a customer to order food and track your deliveries"
    >
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <span className="text-blue-600 text-lg">ℹ️</span>
        <p className="text-sm text-blue-800">
          New accounts are registered as <strong>customers</strong>. Admin access is assigned separately.
        </p>
      </div>

      {submitError && (
        <div className="mb-5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {submitError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <AuthFormField
          label="Full name"
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.name}
          error={formik.errors.name}
          touched={formik.touched.name}
        />

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.password}
          error={formik.errors.password}
          touched={formik.touched.password}
        />

        <AuthFormField
          label="Confirm password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
        />

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
        >
          <LuUserPlus className="w-5 h-5" />
          {formik.isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

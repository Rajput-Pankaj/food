import { useEffect, useState } from 'react';
import { ensureCsrf } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { setupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const passwordSchema = Yup.string()
  .min(8, 'Min 8 characters')
  .matches(/[A-Za-z]/, 'Must include a letter')
  .matches(/[0-9]/, 'Must include a number')
  .required('Password is required');

const schema = Yup.object({
  storeName: Yup.string().required('Store name is required'),
  storeAddress: Yup.string().required('Store address is required'),
  storePhone: Yup.string().required('Store phone is required'),
  adminName: Yup.string().required('Admin name is required'),
  adminEmail: Yup.string().email('Invalid email').required('Admin email is required'),
  adminPassword: passwordSchema,
  setupToken: Yup.string().required('Setup token is required'),
});

export default function Setup() {
  useDocumentTitle('Setup');
  const navigate = useNavigate();
  const { setNeedsSetup } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    ensureCsrf();
  }, []);

  const formik = useFormik({
    initialValues: {
      storeName: 'FoodExpress',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      setupToken: '',
      loadSampleMenu: true,
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        await setupApi.complete(values);
        setNeedsSetup(false);
        navigate('/login', { replace: true, state: { message: 'Setup complete. Sign in with your admin account.' } });
      } catch (err) {
        setError(err.message || 'Setup failed.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to FoodExpress</h1>
        <p className="text-gray-600 mt-1 mb-6 text-sm">Complete one-time setup for your restaurant.</p>

        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup token</label>
            <input
              name="setupToken"
              value={formik.values.setupToken}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="From server environment"
            />
            {formik.touched.setupToken && formik.errors.setupToken && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.setupToken}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
            <input name="storeName" value={formik.values.storeName} onChange={formik.handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store address</label>
            <textarea name="storeAddress" value={formik.values.storeAddress} onChange={formik.handleChange} rows={2} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store phone</label>
            <input name="storePhone" value={formik.values.storePhone} onChange={formik.handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <hr className="my-2" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin name</label>
            <input name="adminName" value={formik.values.adminName} onChange={formik.handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin email</label>
            <input name="adminEmail" type="email" value={formik.values.adminEmail} onChange={formik.handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin password</label>
            <input
              name="adminPassword"
              type="password"
              value={formik.values.adminPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg px-3 py-2"
            />
            {formik.touched.adminPassword && formik.errors.adminPassword && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.adminPassword}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">At least 8 characters with a letter and a number.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="loadSampleMenu" checked={formik.values.loadSampleMenu} onChange={formik.handleChange} />
            Load sample menu & blog posts
          </label>
          <button type="submit" disabled={formik.isSubmitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60">
            {formik.isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LuArrowLeft, LuArrowRight, LuRocket, LuShieldCheck, LuStore } from 'react-icons/lu';
import { setupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import AuthFormField from '../components/auth/AuthFormField';
import PasswordField from '../components/auth/PasswordField';
import SetupLayout from '../components/setup/SetupLayout';

const STEPS = [
  { id: 'token', title: 'Security', subtitle: 'Verify deploy token' },
  { id: 'store', title: 'Your store', subtitle: 'Restaurant details' },
  { id: 'admin', title: 'Admin account', subtitle: 'Owner login' },
  { id: 'launch', title: 'Launch', subtitle: 'Review & go live' },
];

const passwordSchema = Yup.string()
  .min(8, 'Min 8 characters')
  .matches(/[A-Za-z]/, 'Must include a letter')
  .matches(/[0-9]/, 'Must include a number')
  .required('Password is required');

const schemas = [
  Yup.object({
    setupToken: Yup.string().trim().required('Setup token is required'),
  }),
  Yup.object({
    storeName: Yup.string().trim().required('Store name is required'),
    storeAddress: Yup.string().trim().required('Store address is required'),
    storePhone: Yup.string().trim().required('Store phone is required'),
    storeEmail: Yup.string()
      .trim()
      .transform((v) => v || undefined)
      .email('Invalid email')
      .optional(),
  }),
  Yup.object({
    adminName: Yup.string().trim().required('Admin name is required'),
    adminEmail: Yup.string().trim().email('Invalid email').required('Admin email is required'),
    adminPassword: passwordSchema,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('adminPassword')], 'Passwords must match')
      .required('Please confirm your password'),
  }),
  Yup.object({}),
];

function StepHeader({ icon, title, description }) {
  const StepIcon = icon;
  return (
    <div className="mb-6">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 mb-3">
        <StepIcon className="w-5 h-5" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{description}</p>
    </div>
  );
}

export default function Setup() {
  useDocumentTitle('Setup');
  const navigate = useNavigate();
  const { setNeedsSetup } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const formik = useFormik({
    initialValues: {
      setupToken: '',
      storeName: 'FoodExpress',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      loadSampleMenu: true,
    },
    validationSchema: schemas[step],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      setSubmitting(true);
      try {
        const { confirmPassword: _confirm, ...payload } = values;
        if (!payload.storeEmail?.trim()) delete payload.storeEmail;
        await setupApi.complete(payload);
        setNeedsSetup(false);
        navigate('/login', {
          replace: true,
          state: { message: 'Setup complete. Sign in with your admin account.' },
        });
      } catch (err) {
        setError(err.message || 'Setup failed.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const validateCurrentStep = async () => {
    const schema = schemas[step];
    const stepFields = Object.keys(schema.fields || {});
    const touched = stepFields.reduce((acc, key) => ({ ...acc, [key]: true }), {});
    formik.setTouched({ ...formik.touched, ...touched });

    try {
      await schema.validate(formik.values, { abortEarly: false });
      return true;
    } catch (validationError) {
      const fieldErrors = {};
      validationError.inner?.forEach((e) => {
        if (e.path) fieldErrors[e.path] = e.message;
      });
      formik.setErrors({ ...formik.errors, ...fieldErrors });
      return false;
    }
  };

  const handleNext = async () => {
    setError('');
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (step === 0) {
      setVerifying(true);
      try {
        const result = await setupApi.verifyToken(formik.values.setupToken.trim());
        if (!result.valid) {
          setError('Invalid setup token. Copy the full SETUP_TOKEN from your server .env file.');
          return;
        }
      } catch (err) {
        setError(err.message || 'Could not verify setup token.');
        return;
      } finally {
        setVerifying(false);
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const isLastStep = step === STEPS.length - 1;

  return (
    <SetupLayout steps={STEPS} currentStep={step}>
      {error && (
        <div className="mb-5 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate>
        {step === 0 && (
          <>
            <StepHeader
              icon={LuShieldCheck}
              title="Verify your setup token"
              description="This one-time token proves you control the server. Find SETUP_TOKEN in your .env file or deploy logs."
            />
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 mb-5 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-medium mb-1">Where to find it</p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200/90">
                <li>SSH: <code className="text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">grep SETUP_TOKEN .env</code></li>
                <li>Docker / Coolify / Hostinger: check environment variables for the API service</li>
              </ul>
            </div>
            <AuthFormField
              label="Setup token"
              id="setupToken"
              name="setupToken"
              type="text"
              placeholder="Paste the full token — do not truncate"
              autoComplete="off"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.setupToken}
              error={formik.errors.setupToken}
              touched={formik.touched.setupToken}
            />
          </>
        )}

        {step === 1 && (
          <>
            <StepHeader
              icon={LuStore}
              title="Store information"
              description="These details appear on receipts, contact page, and customer emails."
            />
            <div className="space-y-4">
              <AuthFormField
                label="Store name"
                id="storeName"
                name="storeName"
                type="text"
                placeholder="e.g. FoodExpress"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.storeName}
                error={formik.errors.storeName}
                touched={formik.touched.storeName}
              />
              <div>
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Store address
                </label>
                <textarea
                  id="storeAddress"
                  name="storeAddress"
                  rows={3}
                  placeholder="Street, city, state, PIN"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.storeAddress}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none"
                />
                {formik.touched.storeAddress && formik.errors.storeAddress && (
                  <p className="text-red-500 text-sm mt-1.5">{formik.errors.storeAddress}</p>
                )}
              </div>
              <AuthFormField
                label="Store phone"
                id="storePhone"
                name="storePhone"
                type="tel"
                placeholder="+91 98765 43210"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.storePhone}
                error={formik.errors.storePhone}
                touched={formik.touched.storePhone}
              />
              <AuthFormField
                label="Store email (optional)"
                id="storeEmail"
                name="storeEmail"
                type="email"
                placeholder="orders@yourrestaurant.com"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.storeEmail}
                error={formik.errors.storeEmail}
                touched={formik.touched.storeEmail}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader
              icon={LuShieldCheck}
              title="Create admin account"
              description="This account has full access to orders, menu, settings, and users."
            />
            <div className="space-y-4">
              <AuthFormField
                label="Admin name"
                id="adminName"
                name="adminName"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.adminName}
                error={formik.errors.adminName}
                touched={formik.touched.adminName}
              />
              <AuthFormField
                label="Admin email"
                id="adminEmail"
                name="adminEmail"
                type="email"
                placeholder="admin@yourdomain.com"
                autoComplete="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.adminEmail}
                error={formik.errors.adminEmail}
                touched={formik.touched.adminEmail}
              />
              <PasswordField
                label="Admin password"
                id="adminPassword"
                name="adminPassword"
                value={formik.values.adminPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.adminPassword}
                touched={formik.touched.adminPassword}
                hint="At least 8 characters with a letter and a number."
              />
              <PasswordField
                label="Confirm password"
                id="confirmPassword"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
                placeholder="Re-enter your password"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader
              icon={LuRocket}
              title="Ready to launch"
              description="Review your settings, then complete setup."
            />
            <dl className="rounded-xl border border-gray-200 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600 mb-6 text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Store</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.storeName}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.storePhone}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Admin</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.adminEmail}</dd>
              </div>
            </dl>
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-600 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                name="loadSampleMenu"
                checked={formik.values.loadSampleMenu}
                onChange={formik.handleChange}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Load sample menu & blog posts
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  50 demo dishes and blog content — great for testing. You can edit or remove them later.
                </span>
              </span>
            </label>
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LuArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div className="hidden sm:block flex-1" />
          )}

          {isLastStep ? (
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <LuRocket className="w-5 h-5" />
              {formik.isSubmitting ? 'Setting up...' : 'Complete setup'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={verifying}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {verifying ? 'Verifying token...' : 'Continue'}
              {!verifying && <LuArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </form>
    </SetupLayout>
  );
}

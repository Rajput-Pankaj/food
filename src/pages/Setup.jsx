import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuGlobe,
  LuLoader,
  LuRocket,
  LuShieldCheck,
  LuSparkles,
  LuStore,
  LuX,
} from 'react-icons/lu';
import { setupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import AuthFormField from '../components/auth/AuthFormField';
import PasswordField from '../components/auth/PasswordField';
import SetupLayout from '../components/setup/SetupLayout';

const STEPS = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Auto-connect & verify' },
  { id: 'store', title: 'Your store', subtitle: 'Restaurant details' },
  { id: 'admin', title: 'Admin account', subtitle: 'Owner login' },
  { id: 'launch', title: 'Domain & launch', subtitle: 'Go live' },
];

const passwordSchema = Yup.string()
  .min(8, 'Min 8 characters')
  .matches(/[A-Za-z]/, 'Must include a letter')
  .matches(/[0-9]/, 'Must include a number')
  .required('Password is required');

const domainField = Yup.string()
  .trim()
  .matches(
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/,
    'Enter a valid domain like foodexpress.com'
  )
  .required('Domain is required');

const schemas = [
  Yup.object({}),
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
  Yup.object({
    domain: domainField,
  }),
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

function StatusRow({ ok, label, detail }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          ok === true
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : ok === false
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        }`}
      >
        {ok === true ? <LuCheck className="w-3.5 h-3.5" /> : ok === false ? <LuX className="w-3.5 h-3.5" /> : <LuLoader className="w-3.5 h-3.5 animate-spin" />}
      </span>
      <span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {detail && <span className="block text-gray-500 dark:text-gray-400 text-xs mt-0.5">{detail}</span>}
      </span>
    </li>
  );
}

function SetupCompletePanel({ result, traefikAvailable, onContinue }) {
  const customDomain = result.domainChanged && result.domain;
  const loginUrl = result.appUrl ? `${result.appUrl.replace(/\/$/, '')}/login` : '/login';

  return (
    <div>
      <StepHeader
        icon={LuRocket}
        title="Setup complete"
        description="Your store is configured. One quick server step applies your domain with HTTPS."
      />

      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 mb-5 text-sm">
        <p className="font-medium text-green-900 dark:text-green-100 mb-1">Saved successfully</p>
        <p className="text-green-800 dark:text-green-200">
          Admin account and store settings are ready.
          {customDomain && (
            <>
              {' '}
              Domain set to <strong>{result.domain}</strong>
              {result.legacyDomain && (
                <> — old URL <strong>{result.legacyDomain}</strong> stays active until redeploy</>
              )}
              .
            </>
          )}
        </p>
      </div>

      {result.redeployRequired && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 mb-5 text-sm">
          <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Run on your VPS (SSH)</p>
          <pre className="text-xs font-mono bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-lg p-3 overflow-x-auto text-gray-800 dark:text-gray-100">
            cd ~/foodexpress{'\n'}
            {result.redeployCommand || './scripts/redeploy-domain.sh'}
          </pre>
          <p className="text-amber-800 dark:text-amber-200 mt-2 text-xs">
            This updates Traefik HTTPS, CORS, and cookies for your domain — usually under a minute downtime.
          </p>
        </div>
      )}

      {customDomain && traefikAvailable && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 mb-5 text-sm">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">DNS for {result.domain}</p>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
            Add an <strong>A record</strong> pointing to your VPS IP before or right after redeploy:
          </p>
          <dl className="text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
            <div className="flex gap-2">
              <dt className="text-gray-500 shrink-0">Type</dt>
              <dd>A</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 shrink-0">Name</dt>
              <dd>@ or www (match your domain)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 shrink-0">Value</dt>
              <dd>Your VPS public IP</dd>
            </div>
          </dl>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
      >
        Continue to sign in
        <LuArrowRight className="w-4 h-4" />
      </button>
      {result.appUrl && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
          After redeploy, open{' '}
          <a href={loginUrl} className="text-green-600 font-medium hover:underline">
            {loginUrl}
          </a>
        </p>
      )}
    </div>
  );
}

export default function Setup() {
  useDocumentTitle('Setup');
  const navigate = useNavigate();
  const { setNeedsSetup } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [bootStatus, setBootStatus] = useState('loading');
  const [bootMessage, setBootMessage] = useState('');
  const [context, setContext] = useState(null);
  const [completeResult, setCompleteResult] = useState(null);

  const formik = useFormik({
    initialValues: {
      storeName: 'FoodExpress',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      domain: '',
      loadSampleMenu: true,
    },
    validationSchema: schemas[step],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');

      // Enter on earlier steps must not submit setup — only step 4 (domain) completes
      if (step !== STEPS.length - 1) {
        await handleNext();
        return;
      }

      setSubmitting(true);
      try {
        const { confirmPassword: _confirm, ...payload } = values;
        if (!payload.storeEmail?.trim()) delete payload.storeEmail;

        const result = await setupApi.complete(payload);
        setNeedsSetup(false);

        if (result.redeployRequired) {
          setCompleteResult(result);
          return;
        }

        navigate('/login', { replace: true, state: { message: 'Setup complete. Sign in with your admin account.' } });
      } catch (err) {
        setError(err.message || 'Setup failed.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setBootStatus('loading');
      setBootMessage('Connecting to server and preparing database…');

      try {
        const ctx = await setupApi.context();
        if (cancelled) return;
        setContext(ctx);

        if (ctx.setupComplete) {
          setBootStatus('done');
          navigate('/login', { replace: true });
          return;
        }

        await setupApi.begin();
        if (cancelled) return;

        setBootStatus('ready');
        setBootMessage('Server verified. Database is ready. Continue to configure your restaurant.');

        if (ctx.defaultDomain || ctx.domain) {
          formik.setFieldValue('domain', ctx.defaultDomain || ctx.domain);
        }
      } catch (err) {
        if (cancelled) return;
        setBootStatus('error');
        setBootMessage(err.message || 'Could not start setup. Is the API running?');
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
    if (step === 0 && bootStatus !== 'ready') return;

    const valid = await validateCurrentStep();
    if (!valid) return;

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
  const showContinue = !isLastStep && (step !== 0 || bootStatus === 'ready');

  const handleFinishLogin = () => {
    const message = completeResult?.domainChanged
      ? `Setup complete! Run "${completeResult.redeployCommand}" on your server, then sign in at ${completeResult.appUrl || 'your domain'}.`
      : 'Setup complete. Sign in with your admin account.';
    navigate('/login', { replace: true, state: { message } });
  };

  if (completeResult) {
    return (
      <SetupLayout steps={STEPS} currentStep={STEPS.length - 1}>
        <SetupCompletePanel
          result={completeResult}
          traefikAvailable={context?.traefikAvailable}
          onContinue={handleFinishLogin}
        />
      </SetupLayout>
    );
  }

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
              icon={LuSparkles}
              title="Welcome to FoodExpress"
              description="Deploy is done. We will verify your server automatically — no setup token to copy."
            />
            <ul className="rounded-xl border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700 mb-5">
              <li className="p-4">
                <StatusRow
                  ok={bootStatus === 'ready' ? true : bootStatus === 'error' ? false : null}
                  label="Server & database"
                  detail={bootMessage}
                />
              </li>
              <li className="p-4">
                <StatusRow
                  ok={bootStatus === 'ready'}
                  label="Secure setup session"
                  detail={
                    bootStatus === 'ready'
                      ? 'Authorized for 30 minutes from this browser.'
                      : 'Starting automatically…'
                  }
                />
              </li>
              {context?.traefikAvailable && (
                <li className="p-4">
                  <StatusRow
                    ok={true}
                    label="Traefik detected"
                    detail="You can connect a custom domain on the last step for automatic HTTPS."
                  />
                </li>
              )}
            </ul>
            {bootStatus === 'error' && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-green-600 font-semibold hover:underline"
              >
                Retry connection
              </button>
            )}
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
              icon={LuGlobe}
              title="Domain & launch"
              description="Deploy auto-fills your Hostinger URL. Change it to your custom domain (e.g. foodexpress.com) — we update HTTPS settings automatically."
            />

            {context?.defaultDomain && (
              <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 mb-4">
                Current deploy URL:{' '}
                <code className="font-mono text-green-700 dark:text-green-300">{context.defaultDomain}</code>
                {context.traefikAvailable && ' — edit below to switch to your own domain.'}
              </p>
            )}

            <AuthFormField
              label="Public domain"
              id="domain"
              name="domain"
              type="text"
              placeholder="foodexpress.com"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.domain}
              error={formik.errors.domain}
              touched={formik.touched.domain}
            />

            {context?.traefikAvailable ? (
              <p className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 mb-5">
                Traefik will request a Let&apos;s Encrypt certificate for your domain after you run{' '}
                <code className="font-mono">./scripts/redeploy-domain.sh</code> on the server. The old Hostinger URL
                stays active briefly during DNS propagation.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Point your domain DNS A record to this server. Without Traefik, the app stays on port{' '}
                {context?.appPort || '8080'}.
              </p>
            )}

            {formik.values.domain &&
              context?.defaultDomain &&
              formik.values.domain.trim().toLowerCase() !== context.defaultDomain.toLowerCase() && (
                <p className="text-xs text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 mb-5">
                  Switching to <strong>{formik.values.domain}</strong> — setup will update DOMAIN, CORS, cookies, and
                  Traefik in <code className="font-mono">.env</code>. Run redeploy on the server to go live.
                </p>
              )}

            {formik.values.domain && context?.deployEnvWritable === false && (
              <p className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-5">
                Set <code className="font-mono">DOMAIN={formik.values.domain}</code> in your platform env vars, then redeploy.
              </p>
            )}

            <dl className="rounded-xl border border-gray-200 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600 mb-6 text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Store</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.storeName}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Admin</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.adminEmail}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500 dark:text-gray-400">Domain</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{formik.values.domain}</dd>
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
                  50 demo dishes and blog content — great for testing.
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
              disabled={formik.isSubmitting || bootStatus !== 'ready'}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <LuRocket className="w-5 h-5" />
              {formik.isSubmitting ? 'Setting up...' : 'Complete setup'}
            </button>
          ) : showContinue ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              Continue
              <LuArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </form>
    </SetupLayout>
  );
}

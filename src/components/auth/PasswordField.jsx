import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export default function PasswordField({
  label,
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder = 'Enter password',
  autoComplete = 'new-password',
  hint,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const hasError = touched && error;

  return (
    <div className={`text-left ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 pr-11 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-colors duration-200 ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
              : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
        </button>
      </div>
      {hasError && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
      {hint && !hasError && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function AuthFormField({
  label,
  id,
  error,
  touched,
  className = '',
  ...inputProps
}) {
  const hasError = touched && error;

  return (
    <div className={`text-left ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-colors duration-200 ${
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
            : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'
        }`}
        {...inputProps}
      />
      {hasError && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  );
}

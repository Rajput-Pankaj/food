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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-800 placeholder:text-gray-400 outline-none transition-colors ${
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
        }`}
        {...inputProps}
      />
      {hasError && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  );
}

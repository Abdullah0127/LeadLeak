function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
}) {
  // REUSABLE INPUT COMPONENT STYLES

  const inputId = name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-ink"
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink
          outline-none transition-colors
          placeholder:text-gray-400
          focus:border-brand-500 focus:ring-2 focus:ring-brand-100
          disabled:cursor-not-allowed disabled:bg-gray-100
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-border"}
          ${className}
        `}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;

function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-brand-700 text-white hover:bg-brand-600",
    secondary: "border border-border bg-white text-ink hover:bg-surface",
    danger: "bg-red-600 text-white hover:bg-red-700",
    forest:
      "bg-forest-900 text-white hover:bg-forest-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest-900/20",
    sage: "bg-sage text-forest-900 hover:bg-lime hover:-translate-y-0.5",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

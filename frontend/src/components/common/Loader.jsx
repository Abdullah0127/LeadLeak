function Loader({ size = "md", label = "Loading...", fullScreen = false }) {
  // REUSABLE LOADER COMPONENT STYLES

  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-7 w-7 border-[3px]",
    lg: "h-10 w-10 border-4",
  };

  const loader = (
    <div
      className="flex items-center justify-center gap-3"
      role="status"
      aria-label={label}
    >
      <div
        className={`
          animate-spin rounded-full border-brand-100
          border-t-brand-700
          ${sizes[size] || sizes.md}
        `}
      />

      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        {loader}
      </div>
    );
  }

  return loader;
}

export default Loader;

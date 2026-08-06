const Select = ({ label, id, error, className = '', children, ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <select
      id={id}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800
        outline-none transition-all duration-200
        ${
          error
            ? 'border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]'
            : 'border-brand-primary/20 focus:border-brand-primary focus:shadow-[0_0_0_4px_rgba(8,89,124,0.12)]'
        }
        ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

export default Select;

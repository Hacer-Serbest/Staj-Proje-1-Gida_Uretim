const Input = ({ label, id, error, icon: Icon, className = '', ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/40" />
      )}
      <input
        id={id}
        className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-800
          outline-none transition-all duration-200 placeholder:text-slate-400
          ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'}
          ${
            error
              ? 'border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]'
              : 'border-brand-primary/20 focus:border-brand-primary focus:shadow-[0_0_0_4px_rgba(8,89,124,0.12)]'
          }
          ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;

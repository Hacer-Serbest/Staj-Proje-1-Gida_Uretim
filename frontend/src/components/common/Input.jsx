const Input = ({ label, id, error, className = '', ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1
        ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary'}
        ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;

const VARIANT_CLASSES = {
  primary:
    'bg-brand-primary text-white shadow-soft-sm hover:bg-brand-primary-dark hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-soft-sm focus-visible:outline-brand-primary',
  secondary:
    'bg-brand-accent text-white shadow-soft-sm hover:bg-brand-accent-dark hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-soft-sm focus-visible:outline-brand-accent',
  outline:
    'border border-brand-primary/30 bg-white text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 hover:shadow-soft-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-brand-primary',
  danger:
    'bg-red-600 text-white shadow-soft-sm hover:bg-red-700 hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-soft-sm focus-visible:outline-red-600',
};

const Button = ({ variant = 'primary', className = '', disabled, children, ...props }) => (
  <button
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
      transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out
      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
      disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0
      ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;

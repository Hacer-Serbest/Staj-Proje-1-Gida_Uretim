const VARIANT_CLASSES = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark focus-visible:outline-brand-primary',
  secondary: 'bg-brand-accent text-white hover:bg-brand-accent-dark focus-visible:outline-brand-accent',
  outline: 'border border-brand-primary text-brand-primary hover:bg-brand-primary/10 focus-visible:outline-brand-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
};

const Button = ({ variant = 'primary', className = '', disabled, children, ...props }) => (
  <button
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
      transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
      disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;

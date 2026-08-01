const Spinner = ({ className = '' }) => (
  <div
    role="status"
    aria-label="Yükleniyor"
    className={`h-6 w-6 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary ${className}`}
  />
);

export default Spinner;

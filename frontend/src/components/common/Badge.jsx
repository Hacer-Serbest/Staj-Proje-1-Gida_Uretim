const TONE_CLASSES = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-brand-primary/10 text-brand-primary',
  accent: 'bg-brand-accent/15 text-brand-accent-dark',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
};

const Badge = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
    {children}
  </span>
);

export default Badge;

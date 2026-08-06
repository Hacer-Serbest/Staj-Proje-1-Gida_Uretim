// Bu hex değerler utils/statusLabels.js'deki ORDER_STATUS_COLORS / PRODUCTION_STATUS_COLORS
// ile birebir aynı olmalı (rozet ve dashboard grafiği aynı durumu aynı renkte göstersin diye).
// Tailwind arbitrary value sınıfları derleme zamanında statik metin taraması gerektirdiği için
// buradaki hex'ler JS'ten dinamik enjekte edilemiyor — elle senkron tutulur.
const TONE_CLASSES = {
  neutral: 'bg-slate-100 text-slate-600',
  primary: 'bg-brand-primary/10 text-brand-primary',
  accent: 'bg-brand-accent/15 text-brand-accent-dark',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  plum: 'bg-[#7c3677]/15 text-[#7c3677]',
  forest: 'bg-[#2e512c]/15 text-[#2e512c]',
  maroon: 'bg-[#7e0108]/15 text-[#7e0108]',
};

const DOT_CLASSES = {
  neutral: 'bg-slate-400',
  primary: 'bg-brand-primary',
  accent: 'bg-brand-accent-dark',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  plum: 'bg-[#7c3677]',
  forest: 'bg-[#2e512c]',
  maroon: 'bg-[#7e0108]',
};

const Badge = ({ tone = 'neutral', dot = true, children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
  >
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`} />}
    {children}
  </span>
);

export default Badge;

const TONE_TEXT = {
  neutral: 'text-brand-primary',
  critical: 'text-[#d03b3b]',
};

/**
 * Tek bir KPI'ı gösteren stat tile. Bir çizgi grafiği DEĞİL — dataviz skill'inin
 * "single headline number" için önerdiği form budur.
 */
const StatTile = ({ label, value, tone = 'neutral', hint }) => (
  <div className="rounded-xl bg-white/70 p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-600">{label}</p>
    <p className={`mt-2 text-3xl font-semibold ${TONE_TEXT[tone]}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export default StatTile;

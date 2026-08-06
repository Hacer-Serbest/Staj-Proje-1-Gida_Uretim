import Card from '../common/Card';

const TONE_TEXT = {
  neutral: 'text-brand-primary',
  critical: 'text-[#d03b3b]',
  navy: 'text-brand-navy',
};

const TONE_ICON_WRAP = {
  neutral: 'bg-brand-primary/10 text-brand-primary',
  critical: 'bg-[#d03b3b]/10 text-[#d03b3b]',
  navy: 'bg-brand-navy/10 text-brand-navy',
};

/**
 * Tek bir KPI'ı gösteren stat tile. Bir çizgi grafiği DEĞİL — dataviz skill'inin
 * "single headline number" için önerdiği form budur.
 */
const StatTile = ({ label, value, tone = 'neutral', hint, icon: Icon }) => (
  <Card hoverable className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${TONE_TEXT[tone]}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE_ICON_WRAP[tone]}`}>
          <Icon size={20} />
        </span>
      )}
    </div>
  </Card>
);

export default StatTile;

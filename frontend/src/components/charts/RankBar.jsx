/**
 * Adlandırılmış kategoriler arası büyüklük karşılaştırması — dataviz kuralı:
 * "Compare magnitude → bar → sequential (tek renk)".
 */
const RankBar = ({ label, value, max, formattedValue, color = '#08597c' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-medium text-slate-700">{label}</span>
        <span className="shrink-0 text-xs text-slate-500">{formattedValue}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default RankBar;

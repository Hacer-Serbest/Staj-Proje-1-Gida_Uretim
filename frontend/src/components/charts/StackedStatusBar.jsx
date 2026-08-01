/**
 * Part-to-whole tek yatay stacked bar + her zaman görünür legend (sayılarla).
 * Tooltip (title) sadece destekleyici — tüm değerler zaten legend'de okunabilir.
 * @param {{ segments: { key: string, label: string, count: number, color: string }[], emptyLabel?: string }} props
 */
const StackedStatusBar = ({ segments, emptyLabel = 'Kayıt yok' }) => {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const visible = segments.filter((s) => s.count > 0);

  if (total === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="flex h-5 w-full gap-[2px]">
        {visible.map((seg, i) => {
          const pct = Math.round((seg.count / total) * 100);
          return (
            <div
              key={seg.key}
              tabIndex={0}
              title={`${seg.label}: ${seg.count} (%${pct})`}
              aria-label={`${seg.label}: ${seg.count} (%${pct})`}
              style={{ width: `${(seg.count / total) * 100}%`, backgroundColor: seg.color }}
              className={`h-full outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                ${i === 0 ? 'rounded-l-md' : ''} ${i === visible.length - 1 ? 'rounded-r-md' : ''}`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {visible.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-600">{seg.label}</span>
            <span className="font-medium text-slate-800">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackedStatusBar;

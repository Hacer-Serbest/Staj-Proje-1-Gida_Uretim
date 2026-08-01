import { STATUS } from '../../utils/chartPalette';

const severityColor = (ratio) => {
  if (ratio <= 0.34) return STATUS.critical;
  if (ratio <= 0.67) return STATUS.serious;
  return STATUS.warning;
};

/**
 * Tek hammaddenin kritik stok seviyesine göre "limite karşı oran" meter'ı.
 * Bu listedeki her satır zaten current <= critical koşulunu sağlıyor (kritik stok filtresi).
 */
const MeterRow = ({ label, current, limit, unit }) => {
  const ratio = limit > 0 ? current / limit : 0;
  const pct = Math.min(ratio * 100, 100);
  const color = severityColor(ratio);

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="shrink-0 text-xs text-slate-500">
          {current} / {limit} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full" style={{ backgroundColor: `${color}20` }}>
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default MeterRow;

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Factory, ArrowLeftRight, Calendar } from 'lucide-react';
import * as reportApi from '../../api/report.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import RankBar from '../../components/charts/RankBar';
import { formatNumber, formatCurrency } from '../../utils/inventoryLabels';

const toDateOnly = (date) => date.toISOString().slice(0, 10);

const PRESETS = [
  { key: '7d', label: 'Son 7 Gün', days: 7 },
  { key: '30d', label: 'Son 30 Gün', days: 30 },
  { key: '90d', label: 'Son 90 Gün', days: 90 },
];

const presetRange = (days) => {
  const to = new Date();
  const from = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  return { from: toDateOnly(from), to: toDateOnly(to) };
};

const StatRow = ({ items }) => (
  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {items.map((item) => (
      <div key={item.label} className="rounded-xl bg-slate-50 px-3.5 py-3">
        <p className="text-xs text-slate-500">{item.label}</p>
        <p className="mt-0.5 text-lg font-bold text-brand-primary">{item.value}</p>
      </div>
    ))}
  </div>
);

const EmptyNote = ({ children }) => <p className="text-sm text-slate-500">{children}</p>;

const Reports = () => {
  const initial = presetRange(30);
  const [activePreset, setActivePreset] = useState('30d');
  const [fromDate, setFromDate] = useState(initial.from);
  const [toDate, setToDate] = useState(initial.to);

  const [production, setProduction] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [sales, setSales] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    const params = { from: fromDate, to: toDate };

    Promise.all([
      reportApi.getProductionReport(params),
      reportApi.getInventoryReport(params),
      reportApi.getSalesReport(params),
    ])
      .then(([prodRes, invRes, salesRes]) => {
        if (cancelled) return;
        setProduction(prodRes.data.data);
        setInventory(invRes.data.data);
        setSales(salesRes.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Raporlar yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate]);

  const applyPreset = (preset) => {
    setActivePreset(preset.key);
    const range = presetRange(preset.days);
    setFromDate(range.from);
    setToDate(range.to);
  };

  const salesMaxRevenue = useMemo(
    () => Math.max(0, ...(sales?.byProduct.map((p) => Number(p.total_revenue)) || [0])),
    [sales]
  );
  const customerMaxRevenue = useMemo(
    () => Math.max(0, ...(sales?.byCustomer.map((c) => Number(c.total_revenue)) || [0])),
    [sales]
  );
  const productionMax = useMemo(
    () => Math.max(0, ...(production?.byProduct.map((p) => Number(p.total_produced)) || [0])),
    [production]
  );
  const inventoryMax = useMemo(
    () => Math.max(0, ...(inventory?.byMaterial.map((m) => Number(m.total_out)) || [0])),
    [inventory]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Raporlar</h1>
        <p className="mt-1 text-sm text-slate-600">Üretim, stok hareketi ve satış performansının seçilen tarih aralığındaki özeti.</p>
      </div>

      <Card className="mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="flex items-center gap-1.5 pr-2 text-sm font-medium text-slate-600">
          <Calendar size={16} className="text-brand-primary/60" />
          Tarih Aralığı
        </div>
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            variant={activePreset === preset.key ? 'primary' : 'outline'}
            className="px-3 py-1.5 text-xs"
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
        <div className="ml-auto flex items-end gap-2">
          <Input
            label="Başlangıç"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setActivePreset(null);
              setFromDate(e.target.value);
            }}
            className="py-1.5 text-xs"
          />
          <Input
            label="Bitiş"
            type="date"
            value={toDate}
            onChange={(e) => {
              setActivePreset(null);
              setToDate(e.target.value);
            }}
            className="py-1.5 text-xs"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
                <TrendingUp size={16} />
              </span>
              <h2 className="text-sm font-semibold text-slate-700">Satış Raporu</h2>
            </div>
            <StatRow
              items={[
                { label: 'Toplam Ciro', value: formatCurrency(sales.totals.totalRevenue) },
                { label: 'Sipariş Sayısı', value: sales.totals.orderCount },
                { label: 'Toplam Adet', value: formatNumber(sales.totals.totalQuantity) },
              ]}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Ürüne Göre Ciro</p>
                {sales.byProduct.length === 0 ? (
                  <EmptyNote>Bu aralıkta satış yok.</EmptyNote>
                ) : (
                  <div className="flex flex-col gap-3">
                    {sales.byProduct.map((p) => (
                      <RankBar
                        key={p.product_id}
                        label={p.product_name}
                        value={Number(p.total_revenue)}
                        max={salesMaxRevenue}
                        formattedValue={formatCurrency(p.total_revenue)}
                        color="#0f2438"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Müşteriye Göre Ciro</p>
                {sales.byCustomer.length === 0 ? (
                  <EmptyNote>Bu aralıkta satış yok.</EmptyNote>
                ) : (
                  <div className="flex flex-col gap-3">
                    {sales.byCustomer.map((c) => (
                      <RankBar
                        key={c.customer_id}
                        label={c.customer_name}
                        value={Number(c.total_revenue)}
                        max={customerMaxRevenue}
                        formattedValue={formatCurrency(c.total_revenue)}
                        color="#c79abd"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Factory size={16} />
              </span>
              <h2 className="text-sm font-semibold text-slate-700">Üretim Raporu</h2>
            </div>
            <StatRow
              items={[
                { label: 'Tamamlanan Emir', value: production.totals.orderCount },
                { label: 'Toplam Üretim', value: formatNumber(production.totals.totalProduced) },
              ]}
            />
            {production.byProduct.length === 0 ? (
              <EmptyNote>Bu aralıkta tamamlanan üretim emri yok.</EmptyNote>
            ) : (
              <div className="flex flex-col gap-3">
                {production.byProduct.map((p) => (
                  <RankBar
                    key={p.product_id}
                    label={p.product_name}
                    value={Number(p.total_produced)}
                    max={productionMax}
                    formattedValue={`${formatNumber(p.total_produced)} ${p.unit}`}
                    color="#08597c"
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent-dark">
                <ArrowLeftRight size={16} />
              </span>
              <h2 className="text-sm font-semibold text-slate-700">Stok Hareket Raporu</h2>
            </div>
            <StatRow
              items={[
                { label: 'Toplam Giriş', value: formatNumber(inventory.totals.totalIn) },
                { label: 'Toplam Çıkış', value: formatNumber(inventory.totals.totalOut) },
                { label: 'Hareket Sayısı', value: inventory.totals.movementCount },
              ]}
            />
            {inventory.byMaterial.length === 0 ? (
              <EmptyNote>Bu aralıkta stok hareketi yok.</EmptyNote>
            ) : (
              <div className="flex flex-col gap-3">
                {inventory.byMaterial.map((m) => (
                  <RankBar
                    key={m.material_id}
                    label={m.material_name}
                    value={Number(m.total_out)}
                    max={inventoryMax}
                    formattedValue={`↓${formatNumber(m.total_out)} ↑${formatNumber(m.total_in)} ${m.unit}`}
                    color="#0d7aa3"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;

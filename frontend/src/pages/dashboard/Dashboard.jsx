import { useEffect, useMemo, useState } from 'react';
import * as materialApi from '../../api/material.api';
import * as productionApi from '../../api/production.api';
import * as orderApi from '../../api/order.api';
import useAuth from '../../hooks/useAuth';
import StatTile from '../../components/charts/StatTile';
import StackedStatusBar from '../../components/charts/StackedStatusBar';
import MeterRow from '../../components/charts/MeterRow';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { CATEGORICAL } from '../../utils/chartPalette';
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_ORDER,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  ORDER_STATUS_BADGE_TONE,
} from '../../utils/statusLabels';

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');

const statusSegments = (items, statusOrder, statusLabels) =>
  statusOrder.map((status, i) => ({
    key: status,
    label: statusLabels[status],
    count: items.filter((item) => item.status === status).length,
    color: CATEGORICAL[i],
  }));

const Dashboard = () => {
  const { user } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [criticalMaterials, setCriticalMaterials] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    Promise.all([
      materialApi.listMaterials({ isActive: true }),
      materialApi.listMaterials({ isActive: true, criticalOnly: true }),
      productionApi.listProductionOrders(),
      orderApi.listOrders(),
    ])
      .then(([materialsRes, criticalRes, productionRes, ordersRes]) => {
        if (cancelled) return;
        setMaterials(materialsRes.data.data.materials);
        setCriticalMaterials(criticalRes.data.data.materials);
        setProductionOrders(productionRes.data.data.productionOrders);
        setOrders(ordersRes.data.data.orders);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Panel verileri yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const inProgressProduction = useMemo(
    () => productionOrders.filter((p) => p.status === 'in_progress'),
    [productionOrders]
  );
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);

  const productionSegments = useMemo(
    () => statusSegments(productionOrders, PRODUCTION_STATUS_ORDER, PRODUCTION_STATUS_LABELS),
    [productionOrders]
  );
  const orderSegments = useMemo(
    () => statusSegments(orders, ORDER_STATUS_ORDER, ORDER_STATUS_LABELS),
    [orders]
  );

  const sortedCriticalMaterials = useMemo(
    () =>
      [...criticalMaterials].sort((a, b) => {
        const ratioA = Number(a.critical_stock_level) > 0 ? Number(a.current_stock) / Number(a.critical_stock_level) : 0;
        const ratioB = Number(b.critical_stock_level) > 0 ? Number(b.current_stock) / Number(b.critical_stock_level) : 0;
        return ratioA - ratioB;
      }),
    [criticalMaterials]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-primary">Merhaba, {user?.full_name}</h1>
      <p className="mt-1 text-sm text-slate-600">Üretim, stok ve sipariş durumunun genel özeti.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Toplam Hammadde" value={materials.length} hint="Aktif hammadde kalemi" />
        <StatTile
          label="Kritik Stok"
          value={criticalMaterials.length}
          tone={criticalMaterials.length > 0 ? 'critical' : 'neutral'}
          hint="Kritik seviyenin altında/eşiğinde"
        />
        <StatTile label="Aktif Üretim" value={inProgressProduction.length} hint="Devam eden üretim emri" />
        <StatTile label="Bekleyen Sipariş" value={pendingOrders.length} hint="Onay bekleyen B2B sipariş" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Kritik Stok Seviyesi</h2>
          {sortedCriticalMaterials.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Kritik seviyede hammadde yok.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {sortedCriticalMaterials.map((m) => (
                <MeterRow
                  key={m.id}
                  label={m.name}
                  current={Number(m.current_stock)}
                  limit={Number(m.critical_stock_level)}
                  unit={m.unit}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Üretim Emirleri Durumu</h2>
          <div className="mt-4">
            <StackedStatusBar segments={productionSegments} emptyLabel="Henüz üretim emri yok." />
          </div>
        </div>

        <div className="rounded-xl bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Sipariş Durumu</h2>
          <div className="mt-4">
            <StackedStatusBar segments={orderSegments} emptyLabel="Henüz sipariş yok." />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Aktif Üretimler</h2>
          {inProgressProduction.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Şu anda devam eden üretim emri yok.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-brand-primary/70">
                <tr>
                  <th className="py-2">Ürün</th>
                  <th className="py-2">Miktar</th>
                  <th className="py-2">Başlangıç</th>
                </tr>
              </thead>
              <tbody>
                {inProgressProduction.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-brand-primary/10">
                    <td className="py-2 font-medium text-slate-800">{p.product_name}</td>
                    <td className="py-2 text-slate-600">
                      {Number(p.planned_quantity)} {p.product_unit}
                    </td>
                    <td className="py-2 text-slate-600">{formatDate(p.actual_start_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Bekleyen Siparişler</h2>
          {pendingOrders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Bekleyen sipariş yok.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-brand-primary/70">
                <tr>
                  <th className="py-2">Sipariş No</th>
                  <th className="py-2">Müşteri</th>
                  <th className="py-2">Teslimat</th>
                  <th className="py-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-brand-primary/10">
                    <td className="py-2 font-medium text-slate-800">{o.order_number}</td>
                    <td className="py-2 text-slate-600">{o.customer_name}</td>
                    <td className="py-2 text-slate-600">{formatDate(o.delivery_date)}</td>
                    <td className="py-2">
                      <Badge tone={ORDER_STATUS_BADGE_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

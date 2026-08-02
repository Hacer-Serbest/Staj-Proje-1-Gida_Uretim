import { useEffect, useState } from 'react';
import * as customerApi from '../../api/customer.api';
import * as productApi from '../../api/product.api';
import * as orderApi from '../../api/order.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { formatNumber, formatCurrency } from '../../utils/inventoryLabels';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  ORDER_STATUS_BADGE_TONE,
  ORDER_STATUS_TRANSITIONS,
  ORDER_STATUS_ACTION_LABELS,
} from '../../utils/statusLabels';

const emptyCustomerForm = { name: '', contactName: '', email: '', phone: '', address: '', taxNumber: '' };
const emptyOrderForm = { customerId: '', deliveryDate: '', notes: '' };
const emptyItem = { productId: '', quantity: '', unitPrice: '' };

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');

const TABS = [
  { key: 'customers', label: 'Müşteriler' },
  { key: 'orders', label: 'Siparişler' },
];

const Orders = () => {
  const { user } = useAuth();
  const canManageCustomers = user.role === 'admin' || user.role === 'satis';
  const canCreateOrder = user.role === 'admin' || user.role === 'satis';
  const canUpdateStatus = user.role === 'admin' || user.role === 'satis' || user.role === 'uretim';
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">B2B Siparişler</h1>
        <p className="mt-1 text-sm text-slate-600">Müşteri yönetimi ve sipariş takibi.</p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-brand-primary/15">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-slate-500 hover:text-brand-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'customers' ? (
        <CustomersPanel canManage={canManageCustomers} />
      ) : (
        <OrdersPanel canCreate={canCreateOrder} canUpdateStatus={canUpdateStatus} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Müşteriler
// ---------------------------------------------------------------------------

const CustomersPanel = ({ canManage }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyCustomerForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = () => {
    setIsLoading(true);
    setListError('');
    customerApi
      .listCustomers(search ? { search } : undefined)
      .then((res) => setCustomers(res.data.data.customers))
      .catch((err) => setListError(err.response?.data?.message || 'Müşteriler yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const openCreateForm = () => {
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
    setFormErrors({});
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      contactName: customer.contact_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      taxNumber: customer.tax_number || '',
    });
    setFormErrors({});
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormErrors({});
    setIsSubmitting(true);

    try {
      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, form);
      } else {
        await customerApi.createCustomer(form);
      }
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setFormErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      }
      setFormError(err.response?.data?.message || 'Müşteri kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (customer) => {
    try {
      await customerApi.updateCustomer(customer.id, { isActive: !customer.is_active });
      loadCustomers();
    } catch (err) {
      setListError(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Müşteri adına göre ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        {canManage && <Button onClick={openCreateForm}>Yeni Müşteri</Button>}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white/70 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          <Input
            id="name"
            label="Firma Adı"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            id="contactName"
            label="Yetkili Kişi"
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            error={formErrors.contactName}
          />
          <Input
            id="email"
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={formErrors.email}
          />
          <Input
            id="phone"
            label="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={formErrors.phone}
          />
          <Input
            id="address"
            label="Adres"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            error={formErrors.address}
          />
          <Input
            id="taxNumber"
            label="Vergi No"
            value={form.taxNumber}
            onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
            error={formErrors.taxNumber}
          />

          {formError && <p className="col-span-full text-sm text-red-600">{formError}</p>}

          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : editingCustomer ? 'Değişiklikleri Kaydet' : 'Müşteriyi Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : listError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{listError}</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-slate-500">Kayıtlı müşteri yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white/70 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Yetkili</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-brand-primary/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.contact_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Aktif' : 'Pasif'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => openEditForm(c)}>
                          Düzenle
                        </Button>
                        <Button
                          variant={c.is_active ? 'danger' : 'primary'}
                          className="px-3 py-1 text-xs"
                          onClick={() => handleToggleActive(c)}
                        >
                          {c.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Siparişler
// ---------------------------------------------------------------------------

const OrdersPanel = ({ canCreate, canUpdateStatus }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyOrderForm);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailOrder, setDetailOrder] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [statusActionError, setStatusActionError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadOrders = () => {
    setIsLoading(true);
    setListError('');
    orderApi
      .listOrders(statusFilter ? { status: statusFilter } : undefined)
      .then((res) => setOrders(res.data.data.orders))
      .catch((err) => setListError(err.response?.data?.message || 'Siparişler yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadOrders, [statusFilter]);

  const openCreateForm = () => {
    setForm(emptyOrderForm);
    setItems([{ ...emptyItem }]);
    setFormError('');
    setShowForm(true);
    if (customers.length === 0) {
      customerApi.listCustomers({ isActive: true }).then((res) => setCustomers(res.data.data.customers));
    }
    if (products.length === 0) {
      productApi.listProducts({ isActive: true }).then((res) => setProducts(res.data.data.products));
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };
  const addItemRow = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItemRow = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const payloadItems = items
      .filter((item) => item.productId && item.quantity)
      .map((item) => {
        const built = { productId: item.productId, quantity: item.quantity };
        if (item.unitPrice) built.unitPrice = item.unitPrice;
        return built;
      });

    if (payloadItems.length === 0) {
      setFormError('En az bir ürün eklemelisiniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { customerId: form.customerId, items: payloadItems };
      if (form.deliveryDate) payload.deliveryDate = form.deliveryDate;
      if (form.notes) payload.notes = form.notes;
      await orderApi.createOrder(payload);
      setShowForm(false);
      loadOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Sipariş oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetail = (order) => {
    setDetailOrder(order);
    setDetailError('');
    setStatusActionError('');
    setIsLoadingDetail(true);
    orderApi
      .getOrder(order.id)
      .then((res) => setDetailOrder(res.data.data.order))
      .catch((err) => setDetailError(err.response?.data?.message || 'Sipariş detayı yüklenemedi.'))
      .finally(() => setIsLoadingDetail(false));
  };

  const handleStatusChange = async (newStatus) => {
    setStatusActionError('');
    setIsUpdatingStatus(true);
    try {
      await orderApi.updateOrderStatus(detailOrder.id, newStatus);
      const res = await orderApi.getOrder(detailOrder.id);
      setDetailOrder(res.data.data.order);
      loadOrders();
    } catch (err) {
      setStatusActionError(err.response?.data?.message || 'Durum güncellenemedi.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const itemsTotal = (order) =>
    order.items?.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0) || 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="">Tüm Durumlar</option>
          {ORDER_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        {canCreate && <Button onClick={openCreateForm}>Yeni Sipariş</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4 rounded-xl bg-white/70 p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              id="customerId"
              label="Müşteri"
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            >
              <option value="">Seçiniz...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              id="deliveryDate"
              label="Teslimat Tarihi (opsiyonel)"
              type="date"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            />
            <Input
              id="notes"
              label="Not (opsiyonel)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Ürünler</p>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label={index === 0 ? 'Ürün' : undefined}
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      label={index === 0 ? 'Miktar' : undefined}
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label={index === 0 ? 'Birim Fiyat (opsiyonel)' : undefined}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Satış fiyatı"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="mb-2 text-slate-400 hover:text-red-600"
                      aria-label="Satırı sil"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addItemRow} className="mt-2">
              + Ürün Ekle
            </Button>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Oluşturuluyor...' : 'Siparişi Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : listError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{listError}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">Kayıtlı sipariş yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white/70 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Sipariş No</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Sipariş Tarihi</th>
                <th className="px-4 py-3">Teslimat</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-brand-primary/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{o.customer_name}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(o.order_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(o.delivery_date)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS_BADGE_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => openDetail(o)}>
                      Detay
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={Boolean(detailOrder)} onClose={() => setDetailOrder(null)} title={`Sipariş — ${detailOrder?.order_number || ''}`}>
        {isLoadingDetail ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : detailError ? (
          <p className="text-sm text-red-600">{detailError}</p>
        ) : (
          detailOrder && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-slate-500">Müşteri:</span> {detailOrder.customer_name}
                </p>
                <p>
                  <span className="text-slate-500">Durum:</span>{' '}
                  <Badge tone={ORDER_STATUS_BADGE_TONE[detailOrder.status]}>{ORDER_STATUS_LABELS[detailOrder.status]}</Badge>
                </p>
                <p>
                  <span className="text-slate-500">Sipariş Tarihi:</span> {formatDate(detailOrder.order_date)}
                </p>
                <p>
                  <span className="text-slate-500">Teslimat:</span> {formatDate(detailOrder.delivery_date)}
                </p>
                {detailOrder.notes && (
                  <p className="col-span-2">
                    <span className="text-slate-500">Not:</span> {detailOrder.notes}
                  </p>
                )}
              </div>

              {detailOrder.items && (
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-1.5 pr-2">Ürün</th>
                      <th className="py-1.5 pr-2">Miktar</th>
                      <th className="py-1.5 pr-2">Birim Fiyat</th>
                      <th className="py-1.5">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="py-1.5 pr-2 text-slate-800">{item.product_name}</td>
                        <td className="py-1.5 pr-2 text-slate-600">
                          {formatNumber(item.quantity)} {item.product_unit}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600">{formatCurrency(item.unit_price)}</td>
                        <td className="py-1.5 text-slate-800">{formatCurrency(item.quantity * item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium text-slate-800">
                      <td className="py-1.5" colSpan={3}>
                        Toplam
                      </td>
                      <td className="py-1.5">{formatCurrency(itemsTotal(detailOrder))}</td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {canUpdateStatus && ORDER_STATUS_TRANSITIONS[detailOrder.status]?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Durumu Güncelle</p>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUS_TRANSITIONS[detailOrder.status].map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        variant={nextStatus === 'cancelled' ? 'danger' : 'primary'}
                        className="px-3 py-1.5 text-xs"
                        disabled={isUpdatingStatus}
                        onClick={() => handleStatusChange(nextStatus)}
                      >
                        {ORDER_STATUS_ACTION_LABELS[nextStatus]}
                      </Button>
                    ))}
                  </div>
                  {statusActionError && <p className="mt-2 text-sm text-red-600">{statusActionError}</p>}
                </div>
              )}
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default Orders;

import { useEffect, useState } from 'react';
import { Plus, Pencil, Power, FlaskConical, Play, CheckCircle2, XCircle, ClipboardX, X } from 'lucide-react';
import * as productApi from '../../api/product.api';
import * as materialApi from '../../api/material.api';
import * as productionApi from '../../api/production.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { UNITS, formatNumber, formatCurrency } from '../../utils/inventoryLabels';
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_ORDER, PRODUCTION_STATUS_BADGE_TONE } from '../../utils/statusLabels';

const emptyProductForm = { name: '', sku: '', unit: 'adet', salePrice: '0', description: '' };
const emptyOrderForm = { productId: '', plannedQuantity: '', plannedStartDate: '', plannedEndDate: '', notes: '' };

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');

const TABS = [
  { key: 'products', label: 'Ürünler & Reçeteler' },
  { key: 'orders', label: 'Üretim Emirleri' },
];

const Production = () => {
  const { user } = useAuth();
  const canManage = user.role === 'admin' || user.role === 'uretim';
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Üretim Planlama</h1>
        <p className="mt-1 text-sm text-slate-600">Ürün/reçete yönetimi ve üretim emri takibi.</p>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-xl bg-white/70 p-1 shadow-soft-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-brand-primary text-white shadow-soft-sm'
                : 'text-brand-primary/70 hover:bg-brand-primary/8 hover:text-brand-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Her iki panel de mount'lu kalır; sekme değişiminde veri yeniden çekilmez ve
          yükleniyor spinner'ı yanıp sönmez — geçiş salt CSS ile, pürüzsüz olur. */}
      <div className={activeTab === 'products' ? 'animate-fade-in' : 'hidden'}>
        <ProductsPanel canManage={canManage} />
      </div>
      <div className={activeTab === 'orders' ? 'animate-fade-in' : 'hidden'}>
        <OrdersPanel canManage={canManage} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ürünler & Reçeteler
// ---------------------------------------------------------------------------

const ProductsPanel = ({ canManage }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recipeProduct, setRecipeProduct] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [recipeItems, setRecipeItems] = useState([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState('');
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);

  const loadProducts = () => {
    setIsLoading(true);
    setListError('');
    productApi
      .listProducts()
      .then((res) => setProducts(res.data.data.products))
      .catch((err) => setListError(err.response?.data?.message || 'Ürünler yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadProducts, []);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyProductForm);
    setFormErrors({});
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      salePrice: product.sale_price,
      description: product.description || '',
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
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, form);
      } else {
        await productApi.createProduct(form);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setFormErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      }
      setFormError(err.response?.data?.message || 'Ürün kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productApi.updateProduct(product.id, { isActive: !product.is_active });
      loadProducts();
    } catch (err) {
      setListError(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  const openRecipeModal = (product) => {
    setRecipeProduct(product);
    setRecipeError('');
    setIsLoadingRecipe(true);

    const materialsPromise = materials ? Promise.resolve({ data: { data: { materials } } }) : materialApi.listMaterials({ isActive: true });

    Promise.all([materialsPromise, productApi.getProductRecipe(product.id)])
      .then(([materialsRes, recipeRes]) => {
        setMaterials(materialsRes.data.data.materials);
        const items = recipeRes.data.data.recipe.map((r) => ({
          materialId: r.material_id,
          quantityRequired: r.quantity_required,
        }));
        setRecipeItems(items.length > 0 ? items : [{ materialId: '', quantityRequired: '' }]);
      })
      .catch((err) => setRecipeError(err.response?.data?.message || 'Reçete yüklenemedi.'))
      .finally(() => setIsLoadingRecipe(false));
  };

  const updateRecipeItem = (index, field, value) => {
    setRecipeItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addRecipeRow = () => setRecipeItems((prev) => [...prev, { materialId: '', quantityRequired: '' }]);
  const removeRecipeRow = (index) => setRecipeItems((prev) => prev.filter((_, i) => i !== index));

  const handleRecipeSubmit = async (event) => {
    event.preventDefault();
    setRecipeError('');

    const items = recipeItems
      .filter((item) => item.materialId && item.quantityRequired)
      .map((item) => ({ materialId: item.materialId, quantityRequired: item.quantityRequired }));

    if (items.length === 0) {
      setRecipeError('En az bir hammadde eklemelisiniz.');
      return;
    }

    setIsSubmittingRecipe(true);
    try {
      await productApi.setProductRecipe(recipeProduct.id, items);
      setRecipeProduct(null);
    } catch (err) {
      setRecipeError(err.response?.data?.message || 'Reçete kaydedilemedi.');
    } finally {
      setIsSubmittingRecipe(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canManage && (
          <Button onClick={openCreateForm} className="gap-1.5">
            <Plus size={16} />
            Yeni Ürün
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid animate-fade-slide-up grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-soft-md sm:grid-cols-2 lg:grid-cols-5"
        >
          <Input
            id="name"
            label="Ürün Adı"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            id="sku"
            label="SKU"
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            error={formErrors.sku}
          />
          <Select id="unit" label="Birim" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Input
            id="salePrice"
            label="Satış Fiyatı (₺)"
            type="number"
            step="0.01"
            min="0"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            error={formErrors.salePrice}
          />
          <Input
            id="description"
            label="Açıklama (opsiyonel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {formError && <p className="col-span-full text-sm text-red-600">{formError}</p>}

          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
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
      ) : products.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <ClipboardX size={28} className="text-brand-stone-dark/70" />
          <p className="text-sm text-slate-500">Kayıtlı ürün yok.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Satış Fiyatı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-brand-primary/5 transition-colors last:border-0 hover:bg-brand-primary/[0.03]"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(p.sale_price)} / {p.unit}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Aktif' : 'Pasif'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="gap-1 px-3 py-1.5 text-xs" onClick={() => openRecipeModal(p)}>
                        <FlaskConical size={13} />
                        Reçete
                      </Button>
                      {canManage && (
                        <>
                          <Button variant="outline" className="gap-1 px-3 py-1.5 text-xs" onClick={() => openEditForm(p)}>
                            <Pencil size={13} />
                            Düzenle
                          </Button>
                          <Button
                            variant={p.is_active ? 'danger' : 'primary'}
                            className="gap-1 px-3 py-1.5 text-xs"
                            onClick={() => handleToggleActive(p)}
                          >
                            <Power size={13} />
                            {p.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={Boolean(recipeProduct)} onClose={() => setRecipeProduct(null)} title={`Reçete — ${recipeProduct?.name || ''}`}>
        {isLoadingRecipe ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <form onSubmit={handleRecipeSubmit} className="flex flex-col gap-3">
            <p className="text-xs text-slate-500">1 {recipeProduct?.unit} ürün için gereken hammadde miktarları.</p>

            {recipeItems.map((item, index) => {
              const selectedMaterial = materials?.find((m) => m.id === item.materialId);
              return (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label={index === 0 ? 'Hammadde' : undefined}
                      value={item.materialId}
                      onChange={(e) => updateRecipeItem(index, 'materialId', e.target.value)}
                      disabled={!canManage}
                    >
                      <option value="">Seçiniz...</option>
                      {materials?.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input
                      label={index === 0 ? `Miktar${selectedMaterial ? ` (${selectedMaterial.unit})` : ''}` : undefined}
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={item.quantityRequired}
                      onChange={(e) => updateRecipeItem(index, 'quantityRequired', e.target.value)}
                      disabled={!canManage}
                    />
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => removeRecipeRow(index)}
                      className="mb-2 rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                      aria-label="Satırı sil"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {canManage && (
              <Button type="button" variant="outline" onClick={addRecipeRow} className="gap-1.5 self-start">
                <Plus size={15} />
                Satır Ekle
              </Button>
            )}

            {recipeError && <p className="text-sm text-red-600">{recipeError}</p>}

            {canManage && (
              <Button type="submit" disabled={isSubmittingRecipe}>
                {isSubmittingRecipe ? 'Kaydediliyor...' : 'Reçeteyi Kaydet'}
              </Button>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Üretim Emirleri
// ---------------------------------------------------------------------------

const OrdersPanel = ({ canManage }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyOrderForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completingOrder, setCompletingOrder] = useState(null);
  const [producedQuantity, setProducedQuantity] = useState('');
  const [completeError, setCompleteError] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const loadOrders = () => {
    setIsLoading(true);
    setListError('');
    productionApi
      .listProductionOrders(statusFilter ? { status: statusFilter } : undefined)
      .then((res) => setOrders(res.data.data.productionOrders))
      .catch((err) => setListError(err.response?.data?.message || 'Üretim emirleri yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadOrders, [statusFilter]);

  const openCreateForm = () => {
    setForm(emptyOrderForm);
    setFormError('');
    setShowForm(true);
    if (products.length === 0) {
      productApi.listProducts({ isActive: true }).then((res) => setProducts(res.data.data.products));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const payload = { productId: form.productId, plannedQuantity: form.plannedQuantity };
      if (form.plannedStartDate) payload.plannedStartDate = form.plannedStartDate;
      if (form.plannedEndDate) payload.plannedEndDate = form.plannedEndDate;
      if (form.notes) payload.notes = form.notes;
      await productionApi.createProductionOrder(payload);
      setShowForm(false);
      loadOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Üretim emri oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = async (order) => {
    setPendingOrderId(order.id);
    setListError('');
    try {
      await productionApi.startProductionOrder(order.id);
      loadOrders();
    } catch (err) {
      setListError(err.response?.data?.message || 'Üretim başlatılamadı.');
    } finally {
      setPendingOrderId(null);
    }
  };

  const handleCancel = async (order) => {
    setPendingOrderId(order.id);
    setListError('');
    try {
      await productionApi.cancelProductionOrder(order.id);
      loadOrders();
    } catch (err) {
      setListError(err.response?.data?.message || 'Üretim iptal edilemedi.');
    } finally {
      setPendingOrderId(null);
    }
  };

  const openCompleteModal = (order) => {
    setCompletingOrder(order);
    setProducedQuantity(order.planned_quantity);
    setCompleteError('');
  };

  const handleComplete = async (event) => {
    event.preventDefault();
    setCompleteError('');
    setIsSubmittingComplete(true);
    try {
      await productionApi.completeProductionOrder(completingOrder.id, { producedQuantity });
      setCompletingOrder(null);
      loadOrders();
    } catch (err) {
      setCompleteError(err.response?.data?.message || 'Üretim tamamlanamadı.');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="">Tüm Durumlar</option>
          {PRODUCTION_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {PRODUCTION_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        {canManage && (
          <Button onClick={openCreateForm} className="gap-1.5">
            <Plus size={16} />
            Yeni Üretim Emri
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid animate-fade-slide-up grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-soft-md sm:grid-cols-2 lg:grid-cols-5"
        >
          <Select
            id="productId"
            label="Ürün"
            required
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Seçiniz...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Input
            id="plannedQuantity"
            label="Planlanan Miktar"
            type="number"
            step="0.001"
            min="0.001"
            required
            value={form.plannedQuantity}
            onChange={(e) => setForm({ ...form, plannedQuantity: e.target.value })}
          />
          <Input
            id="plannedStartDate"
            label="Planlanan Başlangıç"
            type="date"
            value={form.plannedStartDate}
            onChange={(e) => setForm({ ...form, plannedStartDate: e.target.value })}
          />
          <Input
            id="plannedEndDate"
            label="Planlanan Bitiş"
            type="date"
            value={form.plannedEndDate}
            onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })}
          />
          <Input
            id="notes"
            label="Not (opsiyonel)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {formError && <p className="col-span-full text-sm text-red-600">{formError}</p>}

          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Oluşturuluyor...' : 'Üretim Emri Oluştur'}
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
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{listError}</p>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <ClipboardX size={28} className="text-brand-stone-dark/70" />
          <p className="text-sm text-slate-500">Kayıtlı üretim emri yok.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Üretim No</th>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Planlanan</th>
                <th className="px-4 py-3">Üretilen</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Planlanan Başlangıç</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-brand-primary/5 transition-colors last:border-0 hover:bg-brand-primary/[0.03]"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{o.product_name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatNumber(o.planned_quantity)} {o.product_unit}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatNumber(o.produced_quantity)} {o.product_unit}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={PRODUCTION_STATUS_BADGE_TONE[o.status]}>{PRODUCTION_STATUS_LABELS[o.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(o.planned_start_date)}</td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <div className="flex justify-end gap-2">
                        {o.status === 'planned' && (
                          <Button
                            variant="outline"
                            className="gap-1 px-3 py-1.5 text-xs"
                            disabled={pendingOrderId === o.id}
                            onClick={() => handleStart(o)}
                          >
                            <Play size={13} />
                            Başlat
                          </Button>
                        )}
                        {o.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            className="gap-1 px-3 py-1.5 text-xs"
                            disabled={pendingOrderId === o.id}
                            onClick={() => openCompleteModal(o)}
                          >
                            <CheckCircle2 size={13} />
                            Tamamla
                          </Button>
                        )}
                        {(o.status === 'planned' || o.status === 'in_progress') && (
                          <Button
                            variant="danger"
                            className="gap-1 px-3 py-1.5 text-xs"
                            disabled={pendingOrderId === o.id}
                            onClick={() => handleCancel(o)}
                          >
                            <XCircle size={13} />
                            İptal
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={Boolean(completingOrder)} onClose={() => setCompletingOrder(null)} title={`Üretimi Tamamla — ${completingOrder?.order_number || ''}`}>
        <form onSubmit={handleComplete} className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Girilen miktar kadar hammadde reçeteye göre stoktan düşülecek. Bu işlem geri alınamaz.
          </p>
          <Input
            id="producedQuantity"
            label={`Üretilen Miktar (${completingOrder?.product_unit || ''})`}
            type="number"
            step="0.001"
            min="0.001"
            required
            value={producedQuantity}
            onChange={(e) => setProducedQuantity(e.target.value)}
          />
          {completeError && <p className="text-sm text-red-600">{completeError}</p>}
          <Button type="submit" disabled={isSubmittingComplete}>
            {isSubmittingComplete ? 'Kaydediliyor...' : 'Üretimi Tamamla'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Production;

import { useEffect, useState } from 'react';
import { Plus, History, ArrowLeftRight, Pencil, Power, PackageOpen } from 'lucide-react';
import * as materialApi from '../../api/material.api';
import * as inventoryApi from '../../api/inventory.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { UNITS, MOVEMENT_TYPE_LABELS, MOVEMENT_REASON_LABELS, MANUAL_MOVEMENT_REASONS, formatNumber, formatCurrency } from '../../utils/inventoryLabels';

const emptyMaterialForm = { name: '', unit: 'kg', currentStock: '0', criticalStockLevel: '0', unitPrice: '0' };
const emptyMovementForm = { movementType: 'in', quantity: '', reason: 'purchase', notes: '' };

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const materialStatus = (material) => {
  if (!material.is_active) return { tone: 'neutral', label: 'Pasif' };
  if (Number(material.current_stock) <= Number(material.critical_stock_level)) {
    return { tone: 'danger', label: 'Kritik' };
  }
  return { tone: 'success', label: 'Normal' };
};

const Inventory = () => {
  const { user } = useAuth();
  const canManage = user.role === 'admin' || user.role === 'depo';

  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm);
  const [materialFormErrors, setMaterialFormErrors] = useState({});
  const [materialFormError, setMaterialFormError] = useState('');
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

  const [movementMaterial, setMovementMaterial] = useState(null);
  const [movementForm, setMovementForm] = useState(emptyMovementForm);
  const [movementError, setMovementError] = useState('');
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);

  const [historyMaterial, setHistoryMaterial] = useState(null);
  const [historyMovements, setHistoryMovements] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadMaterials = () => {
    setIsLoading(true);
    setListError('');
    materialApi
      .listMaterials({ criticalOnly: criticalOnly || undefined, isActive: showInactive ? undefined : true })
      .then((res) => setMaterials(res.data.data.materials))
      .catch((err) => setListError(err.response?.data?.message || 'Hammaddeler yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadMaterials, [criticalOnly, showInactive]);

  const openCreateForm = () => {
    setEditingMaterial(null);
    setMaterialForm(emptyMaterialForm);
    setMaterialFormErrors({});
    setMaterialFormError('');
    setShowMaterialForm(true);
  };

  const openEditForm = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      unit: material.unit,
      currentStock: material.current_stock,
      criticalStockLevel: material.critical_stock_level,
      unitPrice: material.unit_price,
    });
    setMaterialFormErrors({});
    setMaterialFormError('');
    setShowMaterialForm(true);
  };

  const closeMaterialForm = () => setShowMaterialForm(false);

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    setMaterialFormError('');
    setMaterialFormErrors({});
    setIsSubmittingMaterial(true);

    try {
      if (editingMaterial) {
        await materialApi.updateMaterial(editingMaterial.id, {
          name: materialForm.name,
          unit: materialForm.unit,
          criticalStockLevel: materialForm.criticalStockLevel,
          unitPrice: materialForm.unitPrice,
        });
      } else {
        await materialApi.createMaterial(materialForm);
      }
      setShowMaterialForm(false);
      loadMaterials();
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setMaterialFormErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      }
      setMaterialFormError(err.response?.data?.message || 'Hammadde kaydedilemedi.');
    } finally {
      setIsSubmittingMaterial(false);
    }
  };

  const handleToggleActive = async (material) => {
    try {
      await materialApi.updateMaterial(material.id, { isActive: !material.is_active });
      loadMaterials();
    } catch (err) {
      setListError(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  const openMovementModal = (material) => {
    setMovementMaterial(material);
    setMovementForm(emptyMovementForm);
    setMovementError('');
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();
    setMovementError('');
    setIsSubmittingMovement(true);

    try {
      await inventoryApi.createMovement({ materialId: movementMaterial.id, ...movementForm });
      setMovementMaterial(null);
      loadMaterials();
    } catch (err) {
      setMovementError(err.response?.data?.message || 'Stok hareketi kaydedilemedi.');
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  const openHistoryModal = (material) => {
    setHistoryMaterial(material);
    setHistoryError('');
    setIsLoadingHistory(true);
    materialApi
      .getMaterialMovements(material.id)
      .then((res) => setHistoryMovements(res.data.data.movements))
      .catch((err) => setHistoryError(err.response?.data?.message || 'Geçmiş yüklenemedi.'))
      .finally(() => setIsLoadingHistory(false));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Hammadde & Stok Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-600">Hammadde listesi, stok hareketleri ve kritik stok takibi.</p>
        </div>
        {canManage && (
          <Button onClick={openCreateForm} className="gap-1.5">
            <Plus size={16} />
            Yeni Hammadde
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-5 text-sm text-slate-600">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={criticalOnly}
            onChange={(e) => setCriticalOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-primary"
          />
          Sadece kritik stoklar
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 accent-brand-primary"
          />
          Pasif olanları da göster
        </label>
      </div>

      {showMaterialForm && (
        <form
          onSubmit={handleMaterialSubmit}
          className="mb-6 grid animate-fade-slide-up grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-soft-md sm:grid-cols-2 lg:grid-cols-5"
        >
          <Input
            id="name"
            label="Hammadde Adı"
            required
            value={materialForm.name}
            onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
            error={materialFormErrors.name}
          />
          <Select
            id="unit"
            label="Birim"
            value={materialForm.unit}
            onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          {!editingMaterial && (
            <Input
              id="currentStock"
              label="Açılış Stoğu"
              type="number"
              step="any"
              min="0"
              value={materialForm.currentStock}
              onChange={(e) => setMaterialForm({ ...materialForm, currentStock: e.target.value })}
              error={materialFormErrors.currentStock}
            />
          )}
          <Input
            id="criticalStockLevel"
            label="Kritik Seviye"
            type="number"
            step="any"
            min="0"
            value={materialForm.criticalStockLevel}
            onChange={(e) => setMaterialForm({ ...materialForm, criticalStockLevel: e.target.value })}
            error={materialFormErrors.criticalStockLevel}
          />
          <Input
            id="unitPrice"
            label="Birim Fiyat (₺)"
            type="number"
            step="any"
            min="0"
            value={materialForm.unitPrice}
            onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: e.target.value })}
            error={materialFormErrors.unitPrice}
          />

          {editingMaterial && (
            <p className="col-span-full text-xs text-slate-500">
              Mevcut stok miktarını değiştirmek için tablodaki "Stok Hareketi" işlemini kullanın.
            </p>
          )}
          {materialFormError && <p className="col-span-full text-sm text-red-600">{materialFormError}</p>}

          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={isSubmittingMaterial}>
              {isSubmittingMaterial ? 'Kaydediliyor...' : editingMaterial ? 'Değişiklikleri Kaydet' : 'Hammaddeyi Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={closeMaterialForm}>
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
      ) : materials.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <PackageOpen size={28} className="text-brand-stone-dark/70" />
          <p className="text-sm text-slate-500">Kayıtlı hammadde yok.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Hammadde</th>
                <th className="px-4 py-3">Mevcut Stok</th>
                <th className="px-4 py-3">Kritik Seviye</th>
                <th className="px-4 py-3">Birim Fiyat</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const status = materialStatus(m);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-brand-primary/5 transition-colors last:border-0 hover:bg-brand-primary/[0.03]"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(m.current_stock)} {m.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(m.critical_stock_level)} {m.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(m.unit_price)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="gap-1 px-3 py-1.5 text-xs"
                          onClick={() => openHistoryModal(m)}
                        >
                          <History size={13} />
                          Geçmiş
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              variant="outline"
                              className="gap-1 px-3 py-1.5 text-xs"
                              onClick={() => openMovementModal(m)}
                            >
                              <ArrowLeftRight size={13} />
                              Stok Hareketi
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-1 px-3 py-1.5 text-xs"
                              onClick={() => openEditForm(m)}
                            >
                              <Pencil size={13} />
                              Düzenle
                            </Button>
                            <Button
                              variant={m.is_active ? 'danger' : 'primary'}
                              className="gap-1 px-3 py-1.5 text-xs"
                              onClick={() => handleToggleActive(m)}
                            >
                              <Power size={13} />
                              {m.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={Boolean(movementMaterial)} onClose={() => setMovementMaterial(null)} title={`Stok Hareketi — ${movementMaterial?.name || ''}`}>
        <form onSubmit={handleMovementSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Mevcut stok: {movementMaterial ? formatNumber(movementMaterial.current_stock) : ''} {movementMaterial?.unit}
          </p>
          <Select
            id="movementType"
            label="Hareket Tipi"
            value={movementForm.movementType}
            onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value })}
          >
            {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            id="quantity"
            label={`Miktar (${movementMaterial?.unit || ''})`}
            type="number"
            step="any"
            min="0.001"
            required
            value={movementForm.quantity}
            onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
          />
          <Select
            id="reason"
            label="Sebep"
            value={movementForm.reason}
            onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
          >
            {MANUAL_MOVEMENT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {MOVEMENT_REASON_LABELS[reason]}
              </option>
            ))}
          </Select>
          <Input
            id="notes"
            label="Not (opsiyonel)"
            value={movementForm.notes}
            onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
          />

          {movementError && <p className="text-sm text-red-600">{movementError}</p>}

          <Button type="submit" disabled={isSubmittingMovement}>
            {isSubmittingMovement ? 'Kaydediliyor...' : 'Hareketi Kaydet'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(historyMaterial)} onClose={() => setHistoryMaterial(null)} title={`Stok Geçmişi — ${historyMaterial?.name || ''}`}>
        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : historyError ? (
          <p className="text-sm text-red-600">{historyError}</p>
        ) : historyMovements.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz stok hareketi yok.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1.5 pr-2">Tarih</th>
                  <th className="py-1.5 pr-2">Tip</th>
                  <th className="py-1.5 pr-2">Miktar</th>
                  <th className="py-1.5 pr-2">Sebep</th>
                  <th className="py-1.5">Kullanıcı</th>
                </tr>
              </thead>
              <tbody>
                {historyMovements.map((mv) => (
                  <tr key={mv.id} className="border-t border-slate-100">
                    <td className="py-1.5 pr-2 text-slate-600">{dateTimeFormatter.format(new Date(mv.created_at))}</td>
                    <td className="py-1.5 pr-2">
                      <Badge tone={mv.movement_type === 'in' ? 'success' : 'danger'}>
                        {MOVEMENT_TYPE_LABELS[mv.movement_type]}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-2 text-slate-800">{formatNumber(mv.quantity)}</td>
                    <td className="py-1.5 pr-2 text-slate-600">{MOVEMENT_REASON_LABELS[mv.reason]}</td>
                    <td className="py-1.5 text-slate-600">{mv.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;

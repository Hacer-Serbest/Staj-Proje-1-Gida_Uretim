export const UNITS = ['kg', 'g', 'lt', 'ml', 'adet', 'paket'];

export const MOVEMENT_TYPE_LABELS = { in: 'Giriş', out: 'Çıkış' };

export const MOVEMENT_REASON_LABELS = {
  purchase: 'Satın Alma',
  production_consumption: 'Üretim Tüketimi',
  production_return: 'Üretim İadesi',
  adjustment: 'Manuel Düzeltme',
  initial: 'Açılış Stoğu',
  waste: 'Fire / Zayiat',
};

// Sadece bunlar manuel stok hareketi formundan girilebilir; production_consumption/
// production_return üretim servisinin kendisi tarafından otomatik oluşturulur.
export const MANUAL_MOVEMENT_REASONS = ['purchase', 'adjustment', 'initial', 'waste'];

export const formatNumber = (value) => Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 3 });

export const formatCurrency = (value) =>
  Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });

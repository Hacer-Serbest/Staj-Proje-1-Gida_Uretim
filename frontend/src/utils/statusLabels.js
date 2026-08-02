export const PRODUCTION_STATUS_LABELS = {
  planned: 'Planlandı',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const PRODUCTION_STATUS_ORDER = ['planned', 'in_progress', 'completed', 'cancelled'];

export const PRODUCTION_STATUS_BADGE_TONE = {
  planned: 'neutral',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'danger',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  in_production: 'Üretimde',
  ready: 'Hazır',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

export const ORDER_STATUS_ORDER = ['pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled'];

export const ORDER_STATUS_BADGE_TONE = {
  pending: 'neutral',
  confirmed: 'primary',
  in_production: 'accent',
  ready: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

// backend/src/services/order.service.js ALLOWED_TRANSITIONS ile birebir aynı olmalı.
export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const ORDER_STATUS_ACTION_LABELS = {
  confirmed: 'Onayla',
  in_production: 'Üretime Al',
  ready: 'Hazır Olarak İşaretle',
  delivered: 'Teslim Edildi Olarak İşaretle',
  cancelled: 'İptal Et',
};

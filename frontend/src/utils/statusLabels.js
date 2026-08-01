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

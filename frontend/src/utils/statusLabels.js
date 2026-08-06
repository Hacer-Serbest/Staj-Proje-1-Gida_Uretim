export const PRODUCTION_STATUS_LABELS = {
  planned: 'Planlandı',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const PRODUCTION_STATUS_ORDER = ['planned', 'in_progress', 'completed', 'cancelled'];

export const PRODUCTION_STATUS_BADGE_TONE = {
  planned: 'neutral',
  in_progress: 'maroon',
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
  in_production: 'plum',
  ready: 'primary',
  delivered: 'forest',
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

// components/common/Badge.jsx'teki DOT_CLASSES ile aynı renk ailesi — bu şekilde dashboard
// grafiği ile tablo rozetleri her zaman aynı durumu aynı renkte gösterir (tek kaynak burası).
const TONE_HEX = {
  neutral: '#94a3b8',
  primary: '#08597c',
  accent: '#c79abd',
  success: '#10b981',
  danger: '#dc2626',
  plum: '#7c3677',
  forest: '#2e512c',
  maroon: '#7e0108',
};

const toColorMap = (statusToneMap) =>
  Object.fromEntries(Object.entries(statusToneMap).map(([status, tone]) => [status, TONE_HEX[tone]]));

export const ORDER_STATUS_COLORS = toColorMap(ORDER_STATUS_BADGE_TONE);
export const PRODUCTION_STATUS_COLORS = toColorMap(PRODUCTION_STATUS_BADGE_TONE);

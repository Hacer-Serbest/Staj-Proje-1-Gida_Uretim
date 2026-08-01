import axiosClient from './axiosClient';

export const listProductionOrders = (params) => axiosClient.get('/production-orders', { params });
export const getProductionOrder = (id) => axiosClient.get(`/production-orders/${id}`);
export const createProductionOrder = (data) => axiosClient.post('/production-orders', data);
export const startProductionOrder = (id) => axiosClient.post(`/production-orders/${id}/start`);
export const completeProductionOrder = (id, data) => axiosClient.post(`/production-orders/${id}/complete`, data);
export const cancelProductionOrder = (id) => axiosClient.post(`/production-orders/${id}/cancel`);

import axiosClient from './axiosClient';

export const listOrders = (params) => axiosClient.get('/orders', { params });
export const getOrder = (id) => axiosClient.get(`/orders/${id}`);
export const createOrder = (data) => axiosClient.post('/orders', data);
export const updateOrderStatus = (id, status) => axiosClient.patch(`/orders/${id}/status`, { status });

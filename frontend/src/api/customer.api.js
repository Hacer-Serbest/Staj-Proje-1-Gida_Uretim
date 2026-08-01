import axiosClient from './axiosClient';

export const listCustomers = (params) => axiosClient.get('/customers', { params });
export const getCustomer = (id) => axiosClient.get(`/customers/${id}`);
export const createCustomer = (data) => axiosClient.post('/customers', data);
export const updateCustomer = (id, data) => axiosClient.patch(`/customers/${id}`, data);

import axiosClient from './axiosClient';

export const getProductionReport = (params) => axiosClient.get('/reports/production', { params });
export const getInventoryReport = (params) => axiosClient.get('/reports/inventory', { params });
export const getSalesReport = (params) => axiosClient.get('/reports/sales', { params });

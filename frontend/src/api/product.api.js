import axiosClient from './axiosClient';

export const listProducts = (params) => axiosClient.get('/products', { params });
export const getProduct = (id) => axiosClient.get(`/products/${id}`);
export const createProduct = (data) => axiosClient.post('/products', data);
export const updateProduct = (id, data) => axiosClient.patch(`/products/${id}`, data);
export const getProductRecipe = (id) => axiosClient.get(`/products/${id}/recipe`);
export const setProductRecipe = (id, items) => axiosClient.put(`/products/${id}/recipe`, { items });

import axiosClient from './axiosClient';

export const listMaterials = (params) => axiosClient.get('/materials', { params });
export const getMaterial = (id) => axiosClient.get(`/materials/${id}`);
export const createMaterial = (data) => axiosClient.post('/materials', data);
export const updateMaterial = (id, data) => axiosClient.patch(`/materials/${id}`, data);
export const getMaterialMovements = (id, params) => axiosClient.get(`/materials/${id}/movements`, { params });

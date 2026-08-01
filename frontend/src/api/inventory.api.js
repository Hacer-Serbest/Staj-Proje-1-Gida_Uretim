import axiosClient from './axiosClient';

export const listMovements = (params) => axiosClient.get('/inventory', { params });
export const createMovement = (data) => axiosClient.post('/inventory', data);

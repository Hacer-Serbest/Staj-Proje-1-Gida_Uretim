import axiosClient from './axiosClient';

export const listUsers = (params) => axiosClient.get('/users', { params });
export const getUser = (id) => axiosClient.get(`/users/${id}`);
export const updateUser = (id, data) => axiosClient.patch(`/users/${id}`, data);

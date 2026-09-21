import axiosClient from './axiosClient';

export const productApi = {
  getAll: (params = {}) =>
    axiosClient.get('/products', { params }),

  getById: (id) =>
    axiosClient.get(`/products/${id}`),

  getPriceSuggestion: (data) =>
    axiosClient.post('/products/price-suggestion', data),

  getMyListings: () =>
    axiosClient.get('/products/seller/my-listings'),

  create: (data) =>
    axiosClient.post('/products/seller', data),

  update: (id, data) =>
    axiosClient.put(`/products/seller/${id}`, data),

  delete: (id) =>
    axiosClient.delete(`/products/seller/${id}`),

  updateStatus: (id, status) =>
    axiosClient.patch(`/products/seller/${id}/status?status=${status}`),
};
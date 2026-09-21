import axiosClient from './axiosClient';

export const orderApi = {
  create: (data) =>
    axiosClient.post('/orders', data),

  getBuyerOrders: () =>
    axiosClient.get('/orders/buyer'),

  getSellerOrders: () =>
    axiosClient.get('/orders/seller'),

  updateStatus: (id, status) =>
    axiosClient.patch(`/orders/${id}/status`, { status }),
};
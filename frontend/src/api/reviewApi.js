import axiosClient from './axiosClient';

export const reviewApi = {
  create: (reviewData) => axiosClient.post('/reviews', reviewData),
  getSellerReviews: (sellerId) => axiosClient.get(`/reviews/seller/${sellerId}`),
  getOrderReview: (orderId) => axiosClient.get(`/reviews/order/${orderId}`),
};

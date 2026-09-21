import axiosClient from './axiosClient';

export const wishlistApi = {
  getWishlist: () =>
    axiosClient.get('/wishlist'),

  getWishlistIds: () =>
    axiosClient.get('/wishlist/ids'),

  toggle: (productId) =>
    axiosClient.post(`/wishlist/toggle/${productId}`),
};
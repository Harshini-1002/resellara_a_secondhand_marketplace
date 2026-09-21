import axiosClient from './axiosClient';

export const locationApi = {
  search: (query) =>
    axiosClient.get('/locations/search', { params: { query } }),

  getStates: () =>
    axiosClient.get('/locations/states'),
};
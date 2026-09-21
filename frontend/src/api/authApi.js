import axiosClient from './axiosClient';

export const authApi = {
  sendOtp: (email, otpType) =>
    axiosClient.post('/auth/send-otp', { email, otpType }),

  verifyOtp: (email, otp, otpType) =>
    axiosClient.post('/auth/verify-otp', { email, otp, otpType }),

  register: (userData) =>
    axiosClient.post('/auth/register', userData),

  login: (email, password) =>
    axiosClient.post('/auth/login', { email, password }),

  loginWithOtp: (email, otp) =>
    axiosClient.post('/auth/login-with-otp', { email, otp, otpType: 'FORGOT_PASSWORD' }),

  resetPassword: ({ email, otp, newPassword, confirmPassword }) =>
    axiosClient.post('/auth/reset-password', { email, otp, newPassword, confirmPassword }),

  getCurrentUser: () =>
    axiosClient.get('/auth/me'),
};
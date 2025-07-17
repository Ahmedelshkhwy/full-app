import apiClient from '../config/axios';

export const placeOrder = (
  token: string,
  address: string,
  paymentMethod: string
) =>
  apiClient.post(
    '/orders',
    { address, paymentMethod },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getMyOrders = (token: string) =>
  apiClient.get('/orders/my-orders', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrderDetails = (token: string, orderId: string) =>
  apiClient.get(`/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const cancelOrder = (token: string, orderId: string) =>
  apiClient.delete(`/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
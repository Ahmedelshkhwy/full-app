import apiClient from '../config/axios';

export const initiatePayment = (
  data: {
    amount: number;
    currency: string;
    description: string;
    callback_url: string;
    source: {
      type: string;
      stcpay: { phone_number: string };
    };
  }
) =>
  apiClient.post('/payment', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
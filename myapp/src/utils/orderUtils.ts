import { Theme } from '../constants/Theme';

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'processing':
      return Theme.colors.order.processing;
    case 'shipped':
      return Theme.colors.order.shipped;
    case 'delivered':
      return Theme.colors.order.delivered;
    case 'cancelled':
      return Theme.colors.order.cancelled;
    default:
      return Theme.colors.order.processing;
  }
};
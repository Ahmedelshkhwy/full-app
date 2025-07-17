import apiClient from '../config/axios';

export interface CartItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

// جلب محتويات السلة
export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get('/cart');
  return response.data;
};

// إضافة منتج إلى السلة
export const addToCart = async (data: AddToCartData): Promise<Cart> => {
  const response = await apiClient.post('/cart', data);
  return response.data;
};

// تحديث كمية منتج في السلة
export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const response = await apiClient.put(`/cart/${productId}`, { quantity });
  return response.data;
};

// حذف منتج من السلة
export const removeFromCart = async (productId: string): Promise<Cart> => {
  const response = await apiClient.delete(`/cart/${productId}`);
  return response.data;
};

// تفريغ السلة
export const clearCart = async (): Promise<void> => {
  await apiClient.delete('/cart/clear');
};
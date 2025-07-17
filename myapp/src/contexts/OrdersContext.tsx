import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { getMyOrders } from '../api/api';

export type OrderItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
};

export type Order = {
  _id: string;
  user?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'stcpay' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

type OrdersContextType = {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  loadOrdersFromBackend: (token: string) => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updatedOrder: Order) => void;
  clearOrders: () => void;
  refreshOrders: () => Promise<void>;
  syncWithBackend: (token: string) => Promise<void>;
};

export const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل الطلبات المحفوظة عند بدء التطبيق
  useEffect(() => {
    loadLocalOrders();
  }, []);

  const loadLocalOrders = async () => {
    try {
      const localOrders = await AsyncStorage.getItem('user_orders');
      if (localOrders) {
        setOrders(JSON.parse(localOrders));
      }
    } catch (error) {
      console.error('Error loading local orders:', error);
    }
  };

  const saveOrdersLocally = async (ordersData: Order[]) => {
    try {
      await AsyncStorage.setItem('user_orders', JSON.stringify(ordersData));
    } catch (error) {
      console.error('Error saving orders locally:', error);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // تحميل الطلبات المحلية فقط
      const localOrders = await AsyncStorage.getItem('user_orders');
      if (localOrders) {
        setOrders(JSON.parse(localOrders));
        console.log('Orders loaded from local storage:', JSON.parse(localOrders));
      } else {
        setOrders([]);
        console.log('No local orders found');
      }
    } catch (err: any) {
      console.error('Error loading local orders:', err);
      setError('فشل في تحميل الطلبات المحلية');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrdersFromBackend = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getMyOrders(token);
      console.log('Orders loaded from backend:', data);
      
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        await saveOrdersLocally(data.orders);
      } else if (data && Array.isArray(data)) {
        setOrders(data);
        await saveOrdersLocally(data);
      }
    } catch (err: any) {
      console.error('Error loading orders from backend:', err);
      setError('فشل في تحميل الطلبات من الصيدلية');
    } finally {
      setIsLoading(false);
    }
  };

  const addOrder = async (order: Order) => {
    try {
      // إذا كان الطلب موجود بالفعل، قم بتحديثه
      const existingOrderIndex = orders.findIndex(o => o._id === order._id);
      let updatedOrders;
      
      if (existingOrderIndex >= 0) {
        // تحديث الطلب الموجود
        updatedOrders = [...orders];
        updatedOrders[existingOrderIndex] = order;
      } else {
        // إضافة طلب جديد
        updatedOrders = [order, ...orders];
      }
      
      setOrders(updatedOrders);
      await saveOrdersLocally(updatedOrders);
      console.log('Order saved locally:', order);
    } catch (error) {
      console.error('Error adding order locally:', error);
    }
  };

  const updateOrder = async (orderId: string, updatedOrder: Order) => {
    try {
      const updatedOrders = orders.map(order => 
        order._id === orderId ? updatedOrder : order
      );
      setOrders(updatedOrders);
      await saveOrdersLocally(updatedOrders);
      console.log('Order updated locally:', updatedOrder);
    } catch (error) {
      console.error('Error updating order locally:', error);
    }
  };

  const clearOrders = async () => {
    try {
      setOrders([]);
      await AsyncStorage.removeItem('user_orders');
    } catch (error) {
      console.error('Error clearing orders:', error);
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  const syncWithBackend = async (token: string) => {
    try {
      // محاولة تحميل الطلبات من الباك اند
      const data = await getMyOrders(token);
      
      if (data.orders && Array.isArray(data.orders)) {
        // دمج الطلبات المحلية مع طلبات الباك اند
        const backendOrders = data.orders;
        const localOrders = orders.filter(order => order._id.startsWith('local_'));
        
        // إزالة الطلبات المحلية التي تم إرسالها للباك اند
        const mergedOrders = [...backendOrders, ...localOrders];
        
        setOrders(mergedOrders);
        await saveOrdersLocally(mergedOrders);
        console.log('Orders synced with backend');
      }
    } catch (err: any) {
      console.error('Error syncing with backend:', err);
      // في حالة فشل المزامنة، نبقى على الطلبات المحلية
    }
  };

  return (
    <OrdersContext.Provider 
      value={{ 
        orders, 
        isLoading, 
        error, 
        loadOrders, 
        loadOrdersFromBackend,
        addOrder, 
        updateOrder,
        clearOrders, 
        refreshOrders,
        syncWithBackend
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) {throw new Error('useOrders must be used within OrdersProvider');}
  return ctx;
}; 
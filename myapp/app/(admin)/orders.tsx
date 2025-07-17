import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import AdminHeader from '../../src/components/AdminHeader';
import { OrderCard } from '../../src/components/OrderCard';
import { OrderDetailsModal } from '../../src/components/OrderDetailsModal';
import { StatusChangeModal } from '../../src/components/StatusChangeModal';
import { Colors, Spacing, FontSizes, GlobalStyles } from '../../src/styles/globalStyles';
import SafeScreen from '../../src/components/SafeScreen';
import LoadingComponent from '../../src/components/LoadingComponent';
import ErrorComponent from '../../src/components/ErrorComponent';
import EmptyState from '../../src/components/EmptyState';
import { Theme } from '../../src/constants/Theme';

// استخدام متغيرات البيئة للـ API
const API_BASE = process.env.EXPO_PUBLIC_API_ADMIN_URL || 'http://172.19.112.1:5000/api/admin';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'cash' | 'card' | 'online';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // جلب الطلبات من الخادم
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {setLoading(true);}
      
      // إعداد timeout للطلب
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانية

      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // التأكد من أن البيانات هي array
        const safeOrdersData = Array.isArray(data) ? data : 
                              Array.isArray(data?.orders) ? data.orders : [];
        
        console.log('Orders loaded:', safeOrdersData.length);
        setOrders(safeOrdersData);
      } else {
        console.error('فشل في جلب الطلبات:', response.status);
        if (response.status === 401) {
          Alert.alert('خطأ', 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        } else if (response.status === 403) {
          Alert.alert('خطأ', 'غير مسموح بالوصول إلى هذه البيانات');
        } else {
          Alert.alert('خطأ', 'فشل في جلب الطلبات من الخادم');
        }
        setOrders([]);
      }
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات:', error);
      if (error.name === 'AbortError') {
        Alert.alert('خطأ', 'انتهت مهلة الانتظار، يرجى المحاولة مرة أخرى');
      } else {
        Alert.alert('خطأ', 'فشل في الاتصال بالخادم');
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, newStatus: string, newPaymentStatus?: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (response.ok) {
        Alert.alert('نجح', 'تم تحديث حالة الطلب بنجاح');
        fetchOrders(false);
      } else {
        // في حالة فشل الاتصال، نحدث البيانات محلياً للاختبار
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? {
                  ...order,
                  status: newStatus as any,
                  paymentStatus: newPaymentStatus as any || order.paymentStatus,
                  updatedAt: new Date().toISOString()
                }
              : order
          )
        );
        Alert.alert('نجح', 'تم تحديث حالة الطلب محلياً (وضع التجربة)');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الطلب:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  // التحديث عند السحب
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  // عرض تفاصيل الطلب
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // تغيير حالة الطلب
  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onViewDetails={handleViewDetails}
      onChangeStatus={handleChangeStatus}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      iconName="receipt-outline"
      title="لا توجد طلبات"
      subtitle="لم يتم تسجيل أي طلبات حتى الآن"
      showAction={false}
    />
  );

  if (loading) {
    return (
      <SafeScreen backgroundColor={Theme.colors.background}>
        <Stack.Screen options={{ headerShown: false }} />
        <AdminHeader title="إدارة الطلبات" />
        <LoadingComponent message="جاري تحميل الطلبات..." />
      </SafeScreen>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminHeader title="إدارة الطلبات" />
      
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* نافذة تفاصيل الطلب */}
      <OrderDetailsModal
        visible={showDetailsModal}
        order={selectedOrder}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />

      {/* نافذة تغيير حالة الطلب */}
      <StatusChangeModal
        visible={showStatusModal}
        order={selectedOrder}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        onStatusChange={updateOrderStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: Spacing.md,
    flexGrow: 1,
  },
});

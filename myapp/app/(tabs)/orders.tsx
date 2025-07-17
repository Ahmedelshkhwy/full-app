import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOrders, Order } from '../../src/contexts/OrdersContext';
import { useRouter } from 'expo-router';
import SafeScreen from '../../src/components/SafeScreen';
import AppHeader from '../../src/components/AppHeader';
import LoadingComponent from '../../src/components/LoadingComponent';
import ErrorComponent from '../../src/components/ErrorComponent';
import EmptyState from '../../src/components/EmptyState';
import { Theme } from '../../src/constants/Theme';

const PRIMARY = Theme.colors.primary;
const PINK = Theme.colors.error;
const BG = Theme.colors.background;

const statusColors = {
  pending: '#FFA500',
  processing: '#007AFF',
  shipped: '#4CAF50',
  delivered: '#4CAF50',
  cancelled: '#FF3B30',
};

const statusText = {
  pending: 'في الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

// دالة للحصول على حالة الطلب
const getOrderStatus = (order: Order) => {
  return order.orderStatus || 'processing';
};

const paymentStatusColors = {
  pending: '#FFA500',
  paid: '#4CAF50',
  failed: '#FF3B30',
};

const paymentStatusText = {
  pending: 'في الانتظار',
  paid: 'مدفوع',
  failed: 'فشل',
};

export default function OrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { token } = useAuth();
  const { orders, isLoading, error, loadOrdersFromBackend, syncWithBackend } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      loadOrdersFromBackend(token);
    }
  }, [token, loadOrdersFromBackend]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await syncWithBackend(token);
    }
    setRefreshing(false);
  };

  const handleOrderDetails = (order: Order) => {
    router.push({
      pathname: '/(modals)/order-details',
      params: { orderId: order._id }
    });
  };

  const statusFilters = [
    { id: 'all', name: 'جميع الطلبات' },
    { id: 'pending', name: 'في الانتظار' },
    { id: 'processing', name: 'قيد المعالجة' },
    { id: 'shipped', name: 'تم الشحن' },
    { id: 'delivered', name: 'تم التوصيل' },
    { id: 'cancelled', name: 'ملغي' },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => getOrderStatus(order) === selectedStatus);

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>طلب #{item._id.slice(-8)}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
        </Text>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => {
          const product = orderItem.productId;
          return (
            <View key={index} style={styles.orderItem}>
              <Image 
                source={{ uri: 'https://placehold.co/40x40?text=Product' }} 
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{product?.name || 'منتج غير محدد'}</Text>
                <Text style={styles.itemQuantity}>الكمية: {orderItem.quantity}</Text>
              </View>
            </View>
          );
        })}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} منتجات أخرى</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[getOrderStatus(item)] }]}>
            <Text style={styles.statusText}>{statusText[getOrderStatus(item)]}</Text>
          </View>
          <View style={[styles.paymentBadge, { backgroundColor: paymentStatusColors[item.paymentStatus] }]}>
            <Text style={styles.paymentText}>{paymentStatusText[item.paymentStatus]}</Text>
          </View>
        </View>
        <Text style={styles.totalAmount}>{item.totalAmount.toFixed(2)} ريال</Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => handleOrderDetails(item)}
        >
          <Ionicons name="eye-outline" size={16} color={PRIMARY} />
          <Text style={styles.detailsText}>تفاصيل الطلب</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterBtn,
        selectedStatus === item.id && styles.filterBtnActive
      ]}
      onPress={() => setSelectedStatus(item.id)}
    >
      <Text style={[
        styles.filterText,
        selectedStatus === item.id && styles.filterTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeScreen backgroundColor={BG}>
        <AppHeader title="طلباتي" />
        <LoadingComponent message="جاري تحميل الطلبات..." />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen backgroundColor={BG}>
      <AppHeader 
        title="طلباتي" 
        rightAction={{
          icon: "refresh-outline",
          onPress: onRefresh
        }}
      />

      {/* فلاتر الحالة */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusFilters}
          renderItem={renderStatusFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* قائمة الطلبات */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
        ListEmptyComponent={
          <EmptyState
            iconName="receipt-outline"
            title={selectedStatus !== 'all' ? 'لا توجد طلبات بهذه الحالة' : 'لا توجد طلبات بعد'}
            subtitle="ابدأ بالتسوق من الصفحة الرئيسية"
            actionText="تسوق الآن"
            onAction={() => router.push('/(tabs)/home')}
          />
        }
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterBtnActive: {
    backgroundColor: PRIMARY,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: PRIMARY,
    textAlign: 'center',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  detailsText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginLeft: 4,
  },

}); 
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import LoadingComponent from '../../src/components/LoadingComponent';
import ErrorComponent from '../../src/components/ErrorComponent';
import EmptyState from '../../src/components/EmptyState';
import { 
  useAdminService, 
  AdminServiceError, 
  formatPrice, 
  formatDate,
  formatDateShort,
  getOrderStatusColor,
  getOrderStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  getPaymentMethodText,
  getUserName,
  getProductName
} from '../../src/services/admin.service';
import type { Order, OrderItem, Product, User } from '../../src/services/admin.service';

const { width } = Dimensions.get('window');
const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
const SUCCESS = '#4CAF50';
const WARNING = '#FF9800';
const ERROR = '#F44336';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed';

type FilterOptions = {
  status: 'all' | OrderStatus;
  paymentStatus: 'all' | PaymentStatus;
  dateRange: 'all' | 'today' | 'week' | 'month';
};

export default function AdminOrdersScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  // Initialize admin service
  const adminService = React.useMemo(() => {
    if (!token) return null;
    try {
      return useAdminService(token);
    } catch (error) {
      console.error('Failed to initialize admin service:', error);
      return null;
    }
  }, [token]);

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status update form
  const [statusForm, setStatusForm] = useState({
    orderStatus: '' as OrderStatus,
    paymentStatus: '' as PaymentStatus,
  });

  // Effects
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.back();
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, filters, orders]);

  // Data loading
  const loadData = useCallback(async () => {
    if (!adminService) {
      setError('لا يمكن الوصول إلى الخدمة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const ordersData = await adminService.getOrders();
      
      console.log('Orders loaded:', ordersData.length);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      let errorMessage = 'فشل في تحميل الطلبات';
      
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
        if (error.statusCode === 401) {
          errorMessage = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى';
        } else if (error.statusCode === 403) {
          errorMessage = 'غير مسموح بالوصول إلى هذه البيانات';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [adminService]);

  // Filter orders
  const filterOrders = useCallback(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const orderIdMatch = order._id.toLowerCase().includes(query);
        const userMatch = getUserName(order.user).toLowerCase().includes(query);
        const itemsMatch = order.items.some(item => 
          getProductName(item.productId).toLowerCase().includes(query)
        );
        const addressMatch = `${order.shippingAddress.street} ${order.shippingAddress.city}`.toLowerCase().includes(query);
        
        return orderIdMatch || userMatch || itemsMatch || addressMatch;
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= filterDate
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  }, [orders, searchQuery, filters]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Modal handlers
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order);
    setStatusForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    setShowStatusModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setStatusForm({ orderStatus: '' as OrderStatus, paymentStatus: '' as PaymentStatus });
  };

  // Status update
  const handleUpdateStatus = async () => {
    if (!adminService || !selectedOrder) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة أو الطلب');
      return;
    }

    if (!statusForm.orderStatus || !statusForm.paymentStatus) {
      Alert.alert('خطأ', 'يرجى اختيار حالة الطلب وحالة الدفع');
      return;
    }

    setIsUpdating(true);
    try {
      // Update order status
      await adminService.updateOrderStatus(selectedOrder._id, statusForm.orderStatus);
      
      // Update payment status
      await adminService.updatePaymentStatus(selectedOrder._id, statusForm.paymentStatus);

      Alert.alert('تم التحديث', 'تم تحديث حالة الطلب بنجاح');
      closeStatusModal();
      await loadData();
    } catch (error) {
      let errorMessage = 'فشل في تحديث حالة الطلب';
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (order: Order) => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    Alert.alert(
      'حذف الطلب',
      `هل أنت متأكد من حذف الطلب #${order._id.slice(-8)}؟\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteOrder(order._id);
              Alert.alert('تم الحذف', 'تم حذف الطلب بنجاح');
              await loadData();
            } catch (error) {
              let errorMessage = 'فشل في حذف الطلب';
              if (error instanceof AdminServiceError) {
                errorMessage = error.message;
              } else if (error instanceof Error) {
                errorMessage = error.message;
              }
              Alert.alert('خطأ', errorMessage);
            }
          },
        },
      ]
    );
  };

  // Get statistics
  const getOrderStats = () => {
    const total = filteredOrders.length;
    const processing = filteredOrders.filter(o => o.orderStatus === 'processing').length;
    const shipped = filteredOrders.filter(o => o.orderStatus === 'shipped').length;
    const delivered = filteredOrders.filter(o => o.orderStatus === 'delivered').length;
    const cancelled = filteredOrders.filter(o => o.orderStatus === 'cancelled').length;
    const totalRevenue = filteredOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, processing, shipped, delivered, cancelled, totalRevenue };
  };

  // Render components
  const renderOrderCard = ({ item }: { item: Order }) => {
    const orderStatusColor = getOrderStatusColor(item.orderStatus);
    const paymentStatusColor = getPaymentStatusColor(item.paymentStatus);

    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{item._id.slice(-8)}</Text>
            <Text style={styles.orderDate}>{formatDateShort(item.createdAt)}</Text>
          </View>
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, { backgroundColor: orderStatusColor }]}>
              <Text style={styles.statusText}>{getOrderStatusText(item.orderStatus)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: paymentStatusColor }]}>
              <Text style={styles.statusText}>{getPaymentStatusText(item.paymentStatus)}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.customerName}>{getUserName(item.user)}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.paymentMethod}>{getPaymentMethodText(item.paymentMethod)}</Text>
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>المنتجات ({item.items.length})</Text>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {getProductName(orderItem.productId)}
              </Text>
              <Text style={styles.itemQuantity}>×{orderItem.quantity}</Text>
              <Text style={styles.itemPrice}>{formatPrice(orderItem.price)}</Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} منتج آخر</Text>
          )}
        </View>

        {/* Total and Address */}
        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>المجموع:</Text>
            <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
            {item.discountAmount > 0 && (
              <Text style={styles.discountAmount}>
                خصم: {formatPrice(item.discountAmount)}
              </Text>
            )}
          </View>
          <View style={styles.addressSection}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.address} numberOfLines={2}>
              {item.shippingAddress.street}, {item.shippingAddress.city}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.detailsBtn]}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text style={styles.actionText}>التفاصيل</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.statusBtn]}
            onPress={() => handleChangeStatus(item)}
          >
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={styles.actionText}>تحديث الحالة</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteOrder(item)}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    const stats = getOrderStats();
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>إحصائيات الطلبات</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: WARNING }]}>{stats.processing}</Text>
            <Text style={styles.statLabel}>قيد المعالجة</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: SUCCESS }]}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>تم التسليم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: PRIMARY }]}>{formatPrice(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>إجمالي الإيرادات</Text>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة الطلبات</Text>
        </View>
        <LoadingComponent 
          message="جاري تحميل الطلبات..."
          iconName="receipt-outline"
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة الطلبات</Text>
        </View>
        <ErrorComponent 
          message={error}
          onRetry={loadData}
          iconName="alert-circle-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة الطلبات</Text>
        <View style={styles.headerActions}>
          <Text style={styles.orderCount}>
            {filteredOrders.length} طلب
          </Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في الطلبات (رقم الطلب، العميل، المنتج، العنوان)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>
      </View>

      {/* Statistics */}
      {filteredOrders.length > 0 && renderStatsCard()}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
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
            title={searchQuery || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.dateRange !== 'all' 
              ? 'لا توجد طلبات تطابق البحث' 
              : 'لا توجد طلبات'
            }
            subtitle={searchQuery || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.dateRange !== 'all'
              ? 'جرب تغيير مصطلحات البحث أو المرشحات'
              : 'لم يتم استلام أي طلبات بعد'
            }
            onAction={() => {
              setSearchQuery('');
              setFilters({ status: 'all', paymentStatus: 'all', dateRange: 'all' });
            }}
            actionText="مسح المرشحات"
            showAction={searchQuery || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.dateRange !== 'all'}
          />
        }
      />

      {/* Order Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetailsModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              تفاصيل الطلب #{selectedOrder?._id.slice(-8)}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeDetailsModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
              {/* Order Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>معلومات الطلب</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم الطلب:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder._id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ الطلب:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>آخر تحديث:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.updatedAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>حالة الطلب:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(selectedOrder.orderStatus) }]}>
                    <Text style={styles.statusText}>{getOrderStatusText(selectedOrder.orderStatus)}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>حالة الدفع:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(selectedOrder.paymentStatus) }]}>
                    <Text style={styles.statusText}>{getPaymentStatusText(selectedOrder.paymentStatus)}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>طريقة الدفع:</Text>
                  <Text style={styles.detailValue}>{getPaymentMethodText(selectedOrder.paymentMethod)}</Text>
                </View>
              </View>

              {/* Customer Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>معلومات العميل</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>اسم العميل:</Text>
                  <Text style={styles.detailValue}>{getUserName(selectedOrder.user)}</Text>
                </View>
              </View>

              {/* Shipping Address */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>عنوان التسليم</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الشارع:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.shippingAddress.street}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>المدينة:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.shippingAddress.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الرمز البريدي:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.shippingAddress.postalCode}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>المنتجات ({selectedOrder.items.length})</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.itemDetailCard}>
                    <View style={styles.itemDetailInfo}>
                      <Text style={styles.itemDetailName}>{getProductName(item.productId)}</Text>
                      <View style={styles.itemDetailMeta}>
                        <Text style={styles.itemDetailQuantity}>الكمية: {item.quantity}</Text>
                        <Text style={styles.itemDetailPrice}>السعر: {formatPrice(item.price)}</Text>
                        <Text style={styles.itemDetailTotal}>
                          المجموع: {formatPrice(item.price * item.quantity)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Order Summary */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>ملخص الطلب</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>المجموع الفرعي:</Text>
                  <Text style={styles.summaryValue}>
                    {formatPrice(selectedOrder.totalAmount + selectedOrder.discountAmount)}
                  </Text>
                </View>
                {selectedOrder.discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>الخصم:</Text>
                    <Text style={[styles.summaryValue, { color: PINK }]}>
                      -{formatPrice(selectedOrder.discountAmount)}
                    </Text>
                  </View>
                )}
                {selectedOrder.discountCode && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>كود الخصم:</Text>
                    <Text style={styles.summaryValue}>{selectedOrder.discountCode}</Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>المجموع النهائي:</Text>
                  <Text style={styles.totalValue}>{formatPrice(selectedOrder.totalAmount)}</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeStatusModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              تحديث حالة الطلب #{selectedOrder?._id.slice(-8)}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeStatusModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Order Status */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>حالة الطلب</Text>
              {(['processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    statusForm.orderStatus === status && styles.statusOptionSelected
                  ]}
                  onPress={() => setStatusForm({ ...statusForm, orderStatus: status })}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getOrderStatusColor(status) }]} />
                  <Text style={[
                    styles.statusOptionText,
                    statusForm.orderStatus === status && styles.statusOptionTextSelected
                  ]}>
                    {getOrderStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Status */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>حالة الدفع</Text>
              {(['pending', 'paid', 'failed'] as PaymentStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    statusForm.paymentStatus === status && styles.statusOptionSelected
                  ]}
                  onPress={() => setStatusForm({ ...statusForm, paymentStatus: status })}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getPaymentStatusColor(status) }]} />
                  <Text style={[
                    styles.statusOptionText,
                    statusForm.paymentStatus === status && styles.statusOptionTextSelected
                  ]}>
                    {getPaymentStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdateStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.updateButtonText}>جاري التحديث...</Text>
                </View>
              ) : (
                <Text style={styles.updateButtonText}>تحديث الحالة</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>مرشحات البحث</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFiltersModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Order Status Filter */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>حالة الطلب</Text>
              {[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'processing', label: getOrderStatusText('processing') },
                { value: 'shipped', label: getOrderStatusText('shipped') },
                { value: 'delivered', label: getOrderStatusText('delivered') },
                { value: 'cancelled', label: getOrderStatusText('cancelled') },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.status === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({ ...filters, status: option.value as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.status === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Status Filter */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>حالة الدفع</Text>
              {[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'pending', label: getPaymentStatusText('pending') },
                { value: 'paid', label: getPaymentStatusText('paid') },
                { value: 'failed', label: getPaymentStatusText('failed') },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.paymentStatus === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({ ...filters, paymentStatus: option.value as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.paymentStatus === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date Range Filter */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>النطاق الزمني</Text>
              {[
                { value: 'all', label: 'جميع التواريخ' },
                { value: 'today', label: 'اليوم' },
                { value: 'week', label: 'آخر أسبوع' },
                { value: 'month', label: 'آخر شهر' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.dateRange === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({ ...filters, dateRange: option.value as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.dateRange === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({ status: 'all', paymentStatus: 'all', dateRange: 'all' });
                  setShowFiltersModal(false);
                }}
              >
                <Text style={styles.clearFiltersText}>مسح المرشحات</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.applyFiltersText}>تطبيق المرشحات</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  searchIcon: {
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ordersList: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadges: {
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  itemsSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
  },
  itemPrice: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  moreItems: {
    fontSize: 12,
    color: PINK,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  discountAmount: {
    fontSize: 10,
    color: PINK,
  },
  addressSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginRight: 16,
  },
  address: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
  },
  orderActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  detailsBtn: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
  },
  statusBtn: {
    backgroundColor: WARNING,
  },
  deleteBtn: {
    backgroundColor: ERROR,
    borderBottomRightRadius: 16,
    flex: 0.5,
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  modalHeader: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  itemDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemDetailInfo: {
    flex: 1,
  },
  itemDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  itemDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemDetailQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemDetailPrice: {
    fontSize: 12,
    color: '#666',
  },
  itemDetailTotal: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusOptionSelected: {
    backgroundColor: PRIMARY,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: 'white',
  },
  updateButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterOption: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterOptionSelected: {
    backgroundColor: PRIMARY,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

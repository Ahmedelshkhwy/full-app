import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useOrders } from '../../src/contexts/OrdersContext';

// دوال مساعدة للحالة
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#FFF3E0';
    case 'processing': return '#E3F2FD';
    case 'shipped': return '#E8F5E8';
    case 'delivered': return '#E8F5E8';
    case 'cancelled': return '#FFEBEE';
    default: return '#E3F2FD';
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'pending': return '#FF8F00';
    case 'processing': return '#1976D2';
    case 'shipped': return '#388E3C';
    case 'delivered': return '#2E7D32';
    case 'cancelled': return '#D32F2F';
    default: return '#1976D2';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'في الانتظار';
    case 'processing': return 'قيد المعالجة';
    case 'shipped': return 'تم الشحن';
    case 'delivered': return 'تم التوصيل';
    case 'cancelled': return 'ملغي';
    default: return 'قيد المعالجة';
  }
};

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams();
  const { orders } = useOrders();
  
  // البحث عن الطلب
  const order = orders.find(o => o._id === orderId);
  
  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>الطلب غير موجود</Text>
        </View>
      </View>
    );
  }

  const orderStatus = order.orderStatus || 'processing';
  const orderDate = new Date(order.createdAt);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>طلب #{order._id.slice(-8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(orderStatus) }]}>
                {getStatusText(orderStatus)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.orderDate}>تاريخ الطلب: {orderDate.toLocaleDateString('ar-SA')}</Text>
          <Text style={styles.orderTime}>وقت الطلب: {orderDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات المطلوبة</Text>
          
          {order.items.map((item, index) => {
            const product = item.productId;
            return (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product?.name || 'منتج غير محدد'}</Text>
                  <Text style={styles.productBrand}>الكمية: {item.quantity}</Text>
                  <Text style={styles.productQuantity}>السعر: {item.price.toFixed(2)} ريال</Text>
                </View>
                <Text style={styles.productPrice}>{(item.price * item.quantity).toFixed(2)} ريال</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل التوصيل</Text>
          
          <View style={styles.deliveryInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#23B6C7" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>عنوان التوصيل</Text>
                <Text style={styles.infoValue}>
                  {order.shippingAddress || 'غير محدد'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#23B6C7" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>رقم الهاتف</Text>
                <Text style={styles.infoValue}>+966 50 123 4567</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#23B6C7" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>وقت التوصيل المتوقع</Text>
                <Text style={styles.infoValue}>2 يناير 2024 - 16:00</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الفاتورة</Text>
          
          <View style={styles.billSummary}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>إجمالي المنتجات</Text>
              <Text style={styles.billValue}>{order.totalAmount.toFixed(2)} ريال</Text>
            </View>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>رسوم التوصيل</Text>
              <Text style={styles.billValue}>مجاناً</Text>
            </View>
            
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>الإجمالي النهائي</Text>
              <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} ريال</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الطلب</Text>
          
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>تم استلام الطلب</Text>
                <Text style={styles.timelineTime}>1 يناير 2024 - 14:30</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>تم تأكيد الطلب</Text>
                <Text style={styles.timelineTime}>1 يناير 2024 - 14:35</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#23B6C7' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>قيد التحضير</Text>
                <Text style={styles.timelineTime}>1 يناير 2024 - 15:00</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: '#999' }]}>في الطريق</Text>
                <Text style={[styles.timelineTime, { color: '#999' }]}>قريباً</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: '#999' }]}>تم التوصيل</Text>
                <Text style={[styles.timelineTime, { color: '#999' }]}>قريباً</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call" size={20} color="#23B6C7" />
          <Text style={styles.contactText}>اتصل بنا</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.trackButton}>
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.trackText}>تتبع الطلب</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  orderInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#999',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23B6C7',
  },
  deliveryInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  billSummary: {
    gap: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23B6C7',
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#23B6C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    color: '#23B6C7',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#23B6C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
}); 
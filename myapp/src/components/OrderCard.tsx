import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onChangeStatus: (order: Order) => void;
}

const Colors = {
  primary: '#23B6C7',
  secondary: '#E94B7B',
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
  },
  gray: {
    100: '#F7FAFC',
    300: '#CBD5E0',
  },
  white: '#FFFFFF',
  success: '#48BB78',
  warning: '#ED8936',
  error: '#F56565',
};

const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onChangeStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'confirmed': return Colors.primary;
      case 'shipped': return Colors.secondary;
      case 'delivered': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.gray[300];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'shipped': return 'قيد الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'completed': return 'مكتمل';
      case 'failed': return 'فاشل';
      default: return status;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>طلب #{order._id.slice(-8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('ar-SA')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>المنتجات ({order.items.length})</Text>
          {order.items.slice(0, 2).map((item) => (
            <View key={item._id} style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>الكمية: {item.quantity}</Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} منتج إضافي
            </Text>
          )}
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.label}>المبلغ الإجمالي:</Text>
            <Text style={styles.totalAmount}>{order.totalAmount.toFixed(2)} ريال</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.label}>طريقة الدفع:</Text>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'cash' ? 'نقدي' : 
               order.paymentMethod === 'card' ? 'بطاقة' : 'أونلاين'}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.label}>حالة الدفع:</Text>
            <Text style={[
              styles.paymentStatus,
              { color: order.paymentStatus === 'completed' ? Colors.success : Colors.warning }
            ]}>
              {getPaymentStatusText(order.paymentStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>عنوان التسليم</Text>
          <Text style={styles.address}>
            {order.shippingAddress.street}, {order.shippingAddress.city}
          </Text>
          <Text style={styles.phone}>{order.shippingAddress.phone}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => onViewDetails(order)}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.white} />
          <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => onChangeStatus(order)}
        >
          <Ionicons name="refresh-outline" size={16} color={Colors.white} />
          <Text style={styles.statusButtonText}>تغيير الحالة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  orderDate: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '500',
  },
  content: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  itemsSection: {
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },
  itemQuantity: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  moreItems: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  paymentSection: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  totalAmount: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  paymentMethod: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },
  paymentStatus: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  addressSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  address: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  phone: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  detailsButton: {
    backgroundColor: Colors.secondary,
  },
  detailsButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '500',
  },
  statusButton: {
    backgroundColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
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

interface OrderDetailsModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
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

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  visible, 
  order, 
  onClose 
}) => {
  if (!order) {return null;}

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>تفاصيل الطلب</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* معلومات الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الطلب</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>رقم الطلب:</Text>
              <Text style={styles.value}>#{order._id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>تاريخ الطلب:</Text>
              <Text style={styles.value}>
                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>الحالة:</Text>
              <Text style={styles.value}>{getStatusText(order.status)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>المبلغ الإجمالي:</Text>
              <Text style={[styles.value, styles.totalAmount]}>
                {order.totalAmount.toFixed(2)} ريال
              </Text>
            </View>
          </View>

          {/* المنتجات */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المنتجات ({order.items.length})</Text>
            {order.items.map((item) => (
              <View key={item._id} style={styles.productItem}>
                <Image
                  source={{ 
                    uri: item.image || 'https://placehold.co/60x60?text=منتج'
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>
                    {item.price.toFixed(2)} ريال × {item.quantity}
                  </Text>
                  <Text style={styles.productTotal}>
                    المجموع: {(item.price * item.quantity).toFixed(2)} ريال
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* معلومات الدفع */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الدفع</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>طريقة الدفع:</Text>
              <Text style={styles.value}>
                {order.paymentMethod === 'cash' ? 'نقدي' : 
                 order.paymentMethod === 'card' ? 'بطاقة' : 'أونلاين'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>حالة الدفع:</Text>
              <Text style={[
                styles.value,
                { color: order.paymentStatus === 'completed' ? Colors.success : Colors.warning }
              ]}>
                {getPaymentStatusText(order.paymentStatus)}
              </Text>
            </View>
          </View>

          {/* عنوان التسليم */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان التسليم</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </Text>
              <Text style={styles.addressText}>
                الرمز البريدي: {order.shippingAddress.zipCode}
              </Text>
              <Text style={styles.phoneText}>
                الهاتف: {order.shippingAddress.phone}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  value: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  totalAmount: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  productTotal: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  addressContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  phoneText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});

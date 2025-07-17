import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  _id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'cash' | 'card' | 'online';
}

interface StatusChangeModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string, newPaymentStatus?: string) => void;
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

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  visible,
  order,
  onClose,
  onStatusChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');

  if (!order) {return null;}

  const statusOptions = [
    { value: 'pending', label: 'في الانتظار', color: Colors.warning },
    { value: 'confirmed', label: 'مؤكد', color: Colors.primary },
    { value: 'shipped', label: 'قيد الشحن', color: Colors.secondary },
    { value: 'delivered', label: 'تم التسليم', color: Colors.success },
    { value: 'cancelled', label: 'ملغي', color: Colors.error },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'في الانتظار', color: Colors.warning },
    { value: 'completed', label: 'مكتمل', color: Colors.success },
    { value: 'failed', label: 'فاشل', color: Colors.error },
  ];

  const handleSave = () => {
    if (!selectedStatus) {
      Alert.alert('خطأ', 'يرجى اختيار حالة الطلب');
      return;
    }

    onStatusChange(order._id, selectedStatus, selectedPaymentStatus || undefined);
    onClose();
    setSelectedStatus('');
    setSelectedPaymentStatus('');
  };

  const handleCancel = () => {
    onClose();
    setSelectedStatus('');
    setSelectedPaymentStatus('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>تغيير حالة الطلب</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>طلب رقم:</Text>
            <Text style={styles.orderId}>#{order._id.slice(-8)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الطلب الحالية:</Text>
            <Text style={styles.currentStatus}>
              {statusOptions.find(s => s.value === order.status)?.label || order.status}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اختر حالة جديدة:</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  selectedStatus === status.value && styles.selectedStatusOption
                ]}
                onPress={() => setSelectedStatus(status.value)}
              >
                <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
                <Text style={[
                  styles.statusLabel,
                  selectedStatus === status.value && styles.selectedStatusLabel
                ]}>
                  {status.label}
                </Text>
                {selectedStatus === status.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الدفع (اختياري):</Text>
            {paymentStatusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  selectedPaymentStatus === status.value && styles.selectedStatusOption
                ]}
                onPress={() => setSelectedPaymentStatus(
                  selectedPaymentStatus === status.value ? '' : status.value
                )}
              >
                <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
                <Text style={[
                  styles.statusLabel,
                  selectedPaymentStatus === status.value && styles.selectedStatusLabel
                ]}>
                  {status.label}
                </Text>
                {selectedPaymentStatus === status.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  orderLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  orderId: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  currentStatus: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '500',
    padding: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusLabel: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  selectedStatusLabel: {
    color: Colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: '500',
  },
});

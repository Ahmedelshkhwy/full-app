import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';

export default function AdminTab() {
  const router = useRouter();
  const { user } = useAuth();

  // التحقق من صلاحيات المسؤول
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>غير مصرح لك بالوصول لهذه الصفحة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة الإدارة</Text>
        <Text style={styles.headerSubtitle}>مرحباً بك في لوحة التحكم</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/' as any)}
        >
          <Ionicons name="stats-chart" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>الإحصائيات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/products')}
        >
          <Ionicons name="cube" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>المنتجات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/orders')}
        >
          <Ionicons name="receipt" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>الطلبات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/users')}
        >
          <Ionicons name="people" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>المستخدمين</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/discounts')}
        >
          <Ionicons name="pricetag" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>الخصومات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/settings')}
        >
          <Ionicons name="settings" size={32} color={PRIMARY} />
          <Text style={styles.menuText}>الإعدادات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: PINK,
    textAlign: 'center',
    marginTop: 100,
  },
}); 
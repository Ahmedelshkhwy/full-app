import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
const API_BASE = 'http://192.168.8.87:5000/api/admin';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeDiscounts: number;
  lowStockProducts: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
}

interface RecentUser {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeDiscounts: 0,
    lowStockProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.replace('/(tabs)/home');
      return;
    }
    
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // جلب الإحصائيات
      const statsResponse = await fetch(`${API_BASE}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('فشل في جلب الإحصائيات:', statsResponse.status);
        Alert.alert('خطأ', 'فشل في جلب الإحصائيات من الخادم');
      }

      // جلب الطلبات الحديثة
      const ordersResponse = await fetch(`${API_BASE}/orders/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      } else {
        console.error('فشل في جلب الطلبات الحديثة:', ordersResponse.status);
        Alert.alert('خطأ', 'فشل في جلب الطلبات الحديثة من الخادم');
      }

      // جلب المستخدمين الجدد
      const usersResponse = await fetch(`${API_BASE}/users/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData.users || []);
      } else {
        console.error('فشل في جلب المستخدمين الجدد:', usersResponse.status);
        Alert.alert('خطأ', 'فشل في جلب المستخدمين الجدد من الخادم');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تأكيد', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const navigateToSection = (section: string) => {
    switch (section) {
      case 'users':
        router.push('/(admin)/users');
        break;
      case 'products':
        router.push('/(admin)/products');
        break;
      case 'orders':
        router.push('/(admin)/orders');
        break;
      case 'discounts':
        router.push('/(admin)/discounts');
        break;
      case 'settings':
        router.push('/(admin)/settings');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>جاري تحميل لوحة التحكم...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>لوحة التحكم</Text>
            <Text style={styles.headerSubtitle}>مرحباً {user?.username}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>الإحصائيات العامة</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={30} color={PRIMARY} />
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>إجمالي المستخدمين</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="cube-outline" size={30} color={PINK} />
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>المنتجات</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="receipt-outline" size={30} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>الطلبات</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={30} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.totalRevenue} ريال</Text>
              <Text style={styles.statLabel}>الإيرادات</Text>
            </View>
          </View>

          {/* Today Stats */}
          <View style={styles.todayStats}>
            <Text style={styles.todayTitle}>إحصائيات اليوم</Text>
            <View style={styles.todayGrid}>
              <View style={styles.todayCard}>
                <Text style={styles.todayNumber}>{stats.todayOrders}</Text>
                <Text style={styles.todayLabel}>طلبات اليوم</Text>
              </View>
              <View style={styles.todayCard}>
                <Text style={styles.todayNumber}>{stats.todayRevenue} ريال</Text>
                <Text style={styles.todayLabel}>إيرادات اليوم</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>إدارة النظام</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigateToSection('users')}
            >
              <Ionicons name="people" size={40} color={PRIMARY} />
              <Text style={styles.actionTitle}>إدارة المستخدمين</Text>
              <Text style={styles.actionSubtitle}>عرض وتعديل حسابات المستخدمين</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigateToSection('products')}
            >
              <Ionicons name="cube" size={40} color={PINK} />
              <Text style={styles.actionTitle}>إدارة المنتجات</Text>
              <Text style={styles.actionSubtitle}>إضافة وتعديل المنتجات</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigateToSection('orders')}
            >
              <Ionicons name="receipt" size={40} color="#4CAF50" />
              <Text style={styles.actionTitle}>إدارة الطلبات</Text>
              <Text style={styles.actionSubtitle}>متابعة وتحديث حالة الطلبات</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigateToSection('discounts')}
            >
              <Ionicons name="pricetag" size={40} color="#FF9800" />
              <Text style={styles.actionTitle}>إدارة العروض</Text>
              <Text style={styles.actionSubtitle}>إضافة وتعديل العروض والخصومات</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigateToSection('settings')}
            >
              <Ionicons name="settings" size={40} color="#9C27B0" />
              <Text style={styles.actionTitle}>إعدادات النظام</Text>
              <Text style={styles.actionSubtitle}>تعديل إعدادات التطبيق</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>الطلبات الحديثة</Text>
            <TouchableOpacity onPress={() => navigateToSection('orders')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>طلب #{order.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
              
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.user?.username || '---'}</Text>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</Text>
              </View>
              
              <View style={styles.orderTotal}>
                <Text style={styles.totalAmount}>{order.totalAmount} ريال</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Users */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>المستخدمين الجدد</Text>
            <TouchableOpacity onPress={() => navigateToSection('users')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {recentUsers.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="white" />
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.username || '---'}</Text>
                <Text style={styles.userEmail}>{user?.email || '---'}</Text>
                <Text style={styles.userDate}>
                  انضم في {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '---'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Alerts */}
        {stats.pendingOrders > 0 && (
          <View style={styles.alertCard}>
            <Ionicons name="alert-circle" size={24} color="#FF9800" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>طلبات بانتظار المعالجة</Text>
              <Text style={styles.alertText}>
                لديك {stats.pendingOrders} طلب بانتظار المراجعة والمعالجة
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => navigateToSection('orders')}
            >
              <Text style={styles.alertButtonText}>عرض</Text>
            </TouchableOpacity>
          </View>
        )}

        {stats.lowStockProducts > 0 && (
          <View style={styles.alertCard}>
            <Ionicons name="warning" size={24} color="#f44336" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>منتجات مخزون منخفض</Text>
              <Text style={styles.alertText}>
                لديك {stats.lowStockProducts} منتج بمخزون منخفض
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => navigateToSection('products')}
            >
              <Text style={styles.alertButtonText}>عرض</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  todayStats: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  todayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayCard: {
    alignItems: 'center',
  },
  todayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 4,
  },
  todayLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsGrid: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    flex: 1,
    marginLeft: 15,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 15,
  },
  recentContainer: {
    marginBottom: 30,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PINK,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 12,
  },
  alertContent: {
    flex: 1,
    marginLeft: 15,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#BF360C',
  },
  alertButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 
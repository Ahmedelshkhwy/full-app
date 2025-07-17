import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تأكيد',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login/login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(modals)/edit-profile/');
  };

  const handleChangePassword = () => {
    router.push('/(modals)/change-password/');
  };

  const handleMyOrders = () => {
    router.push('/(tabs)/orders');
  };

  const handleAdminPanel = () => {
    router.push('/(admin)/');
  };

  const handleHelp = () => {
    Alert.alert(
      'المساعدة والدعم',
      'للمساعدة والدعم الفني، يرجى التواصل معنا عبر:\n\nالبريد الإلكتروني: support@pharmacy.com\nالهاتف: 920000000',
      [{ text: 'حسناً', style: 'default' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'سياسة الخصوصية',
      'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لن نشارك معلوماتك مع أي طرف ثالث دون موافقتك.',
      [{ text: 'حسناً', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Image
          source={{ uri: 'https://placehold.co/120x120?text=User' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.username || 'اسم المستخدم'}</Text>
        <Text style={styles.email}>{user?.email || 'user@email.com'}</Text>
        <Text style={styles.phone}>{user?.phone || 'رقم الجوال'}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleEditProfile}>
          <Ionicons name="person-outline" size={22} color={PRIMARY} style={styles.icon} />
          <Text style={styles.rowText}>تعديل البيانات الشخصية</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
          <Ionicons name="lock-closed-outline" size={22} color={PRIMARY} style={styles.icon} />
          <Text style={styles.rowText}>تغيير كلمة المرور</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.row} onPress={handleMyOrders}>
          <Ionicons name="receipt-outline" size={22} color={PRIMARY} style={styles.icon} />
          <Text style={styles.rowText}>طلباتي</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
        </TouchableOpacity>
        
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.row} onPress={handleAdminPanel}>
            <Ionicons name="settings-outline" size={22} color="#FF6B35" style={styles.icon} />
            <Text style={[styles.rowText, { color: '#FF6B35' }]}>لوحة الإدارة</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF6B35" style={styles.arrow} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={PINK} style={styles.icon} />
          <Text style={[styles.rowText, { color: PINK }]}>تسجيل الخروج</Text>
          <Ionicons name="chevron-forward" size={20} color={PINK} style={styles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>معلومات التطبيق</Text>
        <Text style={styles.infoText}>إصدار التطبيق: 1.0.0</Text>
        <Text style={styles.infoText}>آخر تحديث: ديسمبر 2024</Text>
        <Text style={styles.infoText}>صيدلية إلكترونية متكاملة</Text>
      </View>

      <View style={styles.supportSection}>
        <TouchableOpacity style={styles.supportRow} onPress={handleHelp}>
          <Ionicons name="help-circle-outline" size={22} color={PRIMARY} style={styles.icon} />
          <Text style={styles.rowText}>المساعدة والدعم</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportRow} onPress={handlePrivacy}>
          <Ionicons name="document-text-outline" size={22} color={PRIMARY} style={styles.icon} />
          <Text style={styles.rowText}>سياسة الخصوصية</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
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
  avatarBox: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 28,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  phone: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
  },
  rowText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  icon: {
    marginRight: 16,
  },
  arrow: {
    marginLeft: 'auto',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  supportSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 20,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
  },
});
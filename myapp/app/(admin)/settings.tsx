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
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const BG = '#E6F3F7';
const API_BASE = 'http://192.168.8.87:5000/api/admin';

interface SystemSettings {
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxOrderAmount: number;
  deliveryFee: number;
  taxRate: number;
  currency: string;
  language: string;
  timezone: string;
}

export default function SettingsScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'صيدلية إلكترونية',
    appVersion: '1.0.0',
    maintenanceMode: false,
    allowRegistration: true,
    maxOrderAmount: 1000,
    deliveryFee: 15,
    taxRate: 15,
    currency: 'SAR',
    language: 'ar',
    timezone: 'Asia/Riyadh',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.back();
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        Alert.alert('نجح', 'تم حفظ الإعدادات بنجاح');
      } else {
        Alert.alert('خطأ', 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('خطأ', 'فشل في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>جاري تحميل الإعدادات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إعدادات النظام</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>اسم التطبيق</Text>
            <TextInput
              style={styles.textInput}
              value={settings.appName}
              onChangeText={(text) => setSettings({...settings, appName: text})}
              placeholder="اسم التطبيق"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>إصدار التطبيق</Text>
            <Text style={styles.settingValue}>{settings.appVersion}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>وضع الصيانة</Text>
            <Switch
              value={settings.maintenanceMode}
              onValueChange={(value) => setSettings({...settings, maintenanceMode: value})}
              trackColor={{ false: '#767577', true: PRIMARY }}
              thumbColor={settings.maintenanceMode ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>السماح بالتسجيل</Text>
            <Switch
              value={settings.allowRegistration}
              onValueChange={(value) => setSettings({...settings, allowRegistration: value})}
              trackColor={{ false: '#767577', true: PRIMARY }}
              thumbColor={settings.allowRegistration ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الأعمال</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>الحد الأقصى للطلب (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.maxOrderAmount.toString()}
              onChangeText={(text) => setSettings({...settings, maxOrderAmount: parseFloat(text) || 0})}
              placeholder="1000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>رسوم التوصيل (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.deliveryFee.toString()}
              onChangeText={(text) => setSettings({...settings, deliveryFee: parseFloat(text) || 0})}
              placeholder="15"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>نسبة الضريبة (%)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.taxRate.toString()}
              onChangeText={(text) => setSettings({...settings, taxRate: parseFloat(text) || 0})}
              placeholder="15"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>العملة</Text>
            <TextInput
              style={styles.textInput}
              value={settings.currency}
              onChangeText={(text) => setSettings({...settings, currency: text})}
              placeholder="SAR"
            />
          </View>
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات النظام</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>اللغة</Text>
            <TextInput
              style={styles.textInput}
              value={settings.language}
              onChangeText={(text) => setSettings({...settings, language: text})}
              placeholder="ar"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>المنطقة الزمنية</Text>
            <TextInput
              style={styles.textInput}
              value={settings.timezone}
              onChangeText={(text) => setSettings({...settings, timezone: text})}
              placeholder="Asia/Riyadh"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="save-outline" size={20} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
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
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    minWidth: 100,
    textAlign: 'left',
  },
  saveButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
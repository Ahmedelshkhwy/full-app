import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useCart } from '../../../src/contexts/cartcontext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useOrders } from '../../../src/contexts/OrdersContext';
import { createOrder } from '../../../src/api/api';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';

export default function CheckoutScreen() {
  const { state, dispatch, clearCart } = useCart();
  const { token, user } = useAuth();
  const { addOrder } = useOrders();
  const router = useRouter();
  
  const [address, setAddress] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userCity, setUserCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'stcpay'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const total = state.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // الحصول على موقع المستخدم عند تحميل الصفحة
  useEffect(() => {
    getUserLocation();
  }, []);

  // دالة للحصول على موقع المستخدم
  const getUserLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      // طلب إذن الموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'نحتاج إذن الموقع لتحديد عنوان التوصيل');
        return;
      }

      // الحصول على الموقع الحالي
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ lat: latitude, lng: longitude });
      
      // الحصول على اسم المدينة من الإحداثيات
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (geocode.length > 0) {
        const firstResult = geocode[0];
        const city = firstResult?.city || firstResult?.region || 'غير محدد';
        setUserCity(city);
        
        // تحديث العنوان تلقائياً إذا كان فارغاً
        if (!address.trim()) {
          const streetAddress = firstResult?.street 
            ? `${firstResult.street}, ${firstResult?.district || ''}`
            : 'موقعك الحالي';
          setAddress(streetAddress);
        }
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('تنبيه', 'فشل في تحديد موقعك، يرجى إدخال العنوان يدوياً');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('🚀 بدء عملية إنشاء الطلب...');
    
    if (!address.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان التوصيل');
      return;
    }

    if (state.items.length === 0) {
      Alert.alert('خطأ', 'السلة فارغة');
      return;
    }

    if (!token) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول لإتمام الطلب');
      return;
    }

    console.log('📋 بيانات الطلب:', {
      items: state.items.length,
      total: total,
      address: address,
      paymentMethod: paymentMethod
    });

    setIsLoading(true);
    try {
      // إنشاء طلب محلي أولاً
      const localOrder = {
        _id: `local_${Date.now()}`,
        items: state.items.map(item => ({
          productId: {
            _id: item.id,
            name: item.name || 'منتج غير محدد',
            price: item.price || 0
          },
          quantity: item.quantity,
          price: item.price || 0
        })),
        totalAmount: total,
        paymentMethod,
        paymentStatus: 'pending' as const,
        shippingAddress: address.trim(),
        orderStatus: 'processing' as const,
        createdAt: new Date().toISOString()
      };
      
      // حفظ الطلب محلياً فوراً
      addOrder(localOrder);
      
      // محاولة إرسال الطلب للباك اند
      try {
        console.log('Sending order to backend...');
        const orderData = {
          items: state.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price || 0
          })),
          totalAmount: total,
          paymentMethod,
          shippingAddress: {
            street: address.trim(),
            city: userCity || 'غير محدد',
            postalCode: userLocation ? `${Math.floor(userLocation.lat)}${Math.floor(userLocation.lng)}` : '00000'
          }
        };

        console.log('Sending order data to backend:', JSON.stringify(orderData, null, 2));

        const result = await createOrder(orderData, token);
        console.log('Order sent to backend successfully:', result);
        
        // فحص هيكل البيانات المرجعة من الباك اند
        const backendOrder = result.order || result;
        const orderId = backendOrder._id || backendOrder.id || localOrder._id;
        const orderStatus = backendOrder.orderStatus || backendOrder.status || 'processing';
        const paymentStatus = backendOrder.paymentStatus || 'pending';
        const createdAt = backendOrder.createdAt || new Date().toISOString();
        
        // تحديث الطلب المحلي بمعلومات الباك اند
        const updatedOrder = {
          ...localOrder,
          _id: orderId,
          orderStatus,
          paymentStatus,
          createdAt
        };
        
        // تحديث الطلب في الذاكرة المحلية
        addOrder(updatedOrder);
        
        console.log('✅ تم إنشاء الطلب بنجاح، سيتم إفراغ السلة وعرض رسالة النجاح');
        
        // إفراغ السلة فوراً عند نجاح الطلب
        console.log('🔄 إفراغ السلة فوراً...');
        clearCart();
        console.log('✅ تم إفراغ السلة بنجاح');
        
        Alert.alert(
          'تم الطلب بنجاح',
          `تم إرسال طلبك بنجاح!\nرقم الطلب: ${orderId}\nسيتم التواصل معك قريباً لتأكيد الطلب`,
          [
            {
              text: 'حسناً',
              onPress: () => {
                console.log('✅ العودة للصفحة الرئيسية');
                
                // تأخير قصير للتأكد من تحديث الحالة
                setTimeout(() => {
                  router.replace('/(tabs)/home');
                }, 100);
              }
            }
          ]
        );
      } catch (backendError: any) {
        console.error('Backend error:', backendError);
        
        // في حالة فشل الباك اند، الطلب محفوظ محلياً
        const errorMessage = backendError.response?.data?.message || backendError.message || 'خطأ في الاتصال بالخادم';
        
        // إفراغ السلة فوراً حتى في حالة فشل الخادم
        console.log('🔄 إفراغ السلة (حالة الفشل)...');
        clearCart();
        console.log('✅ تم إفراغ السلة');
        
        Alert.alert(
          'تم حفظ الطلب',
          `تم حفظ طلبك بنجاح!\nرقم الطلب: ${localOrder._id}\nسيتم إرساله للصيدلية عند عودة الاتصال\n\nالخطأ: ${errorMessage}`,
          [
            {
              text: 'حسناً',
              onPress: () => {
                console.log('✅ العودة للصفحة الرئيسية');
                
                // تأخير قصير للتأكد من تحديث الحالة
                setTimeout(() => {
                  router.replace('/(tabs)/home');
                }, 100);
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('خطأ في حفظ الطلب:', error);
      Alert.alert('خطأ', 'فشل في حفظ الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyBox}>
          <Ionicons name="cart-outline" size={60} color="#bbb" />
          <Text style={styles.emptyText}>السلة فارغة</Text>
          <Text style={styles.emptySubText}>أضف منتجات للسلة أولاً</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الشراء</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* تفاصيل الطلب */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تفاصيل الطلب</Text>
        {state.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name || 'منتج غير محدد'}</Text>
              <Text style={styles.itemDetails}>
                {item.quantity} × {(item.price || 0).toFixed(2)} ر.س
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {((item.price || 0) * item.quantity).toFixed(2)} ر.س
            </Text>
          </View>
        ))}
      </View>

      {/* معلومات التوصيل */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات التوصيل</Text>
        
        {/* زر تحديد الموقع */}
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getUserLocation}
          disabled={isGettingLocation}
        >
          <Ionicons 
            name="location-outline" 
            size={20} 
            color={PRIMARY} 
          />
          <Text style={styles.locationButtonText}>
            {isGettingLocation ? 'جاري تحديد الموقع...' : 'تحديد موقعي الحالي'}
          </Text>
        </TouchableOpacity>
        
        {/* عرض المدينة */}
        {userCity && (
          <View style={styles.cityInfo}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.cityText}>المدينة: {userCity}</Text>
          </View>
        )}
        
        <TextInput
          style={styles.addressInput}
          placeholder="أدخل عنوان التوصيل الكامل"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* طريقة الدفع */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>طريقة الدفع</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'cash' && styles.paymentMethodSelected
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Ionicons 
              name="cash-outline" 
              size={24} 
              color={paymentMethod === 'cash' ? '#fff' : PRIMARY} 
            />
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'cash' && styles.paymentMethodTextSelected
            ]}>
              الدفع عند الاستلام
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'stcpay' && styles.paymentMethodSelected
            ]}
            onPress={() => setPaymentMethod('stcpay')}
          >
            <Ionicons 
              name="card-outline" 
              size={24} 
              color={paymentMethod === 'stcpay' ? '#fff' : PRIMARY} 
            />
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'stcpay' && styles.paymentMethodTextSelected
            ]}>
              STC Pay
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ملخص الطلب */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>عدد المنتجات:</Text>
          <Text style={styles.summaryValue}>{state.items.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي الطلب:</Text>
          <Text style={styles.summaryValue}>{total.toFixed(2)} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>رسوم التوصيل:</Text>
          <Text style={styles.summaryValue}>مجاناً</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>المجموع الكلي:</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} ر.س</Text>
        </View>
      </View>

      {/* زر إتمام الطلب */}
      <TouchableOpacity
        style={[styles.checkoutBtn, isLoading && styles.checkoutBtnDisabled]}
        onPress={handlePlaceOrder}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.checkoutBtnText}>إتمام الطلب</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlign: 'right',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 12,
  },
  paymentMethodSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  paymentMethodTextSelected: {
    color: '#fff',
  },
  summarySection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PINK,
  },
  checkoutBtn: {
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    gap: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  cityText: {
    fontSize: 14,
    color: '#388e3c',
    fontWeight: '600',
  },
}); 
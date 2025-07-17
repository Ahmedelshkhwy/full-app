import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useCart } from '../../../src/contexts/cartcontext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';

// مكون تحكم الكمية
function QuantityControl({ 
  quantity, 
  onUpdate, 
  itemName,
  maxStock
}: { 
  quantity: number; 
  onUpdate: (newQuantity: number) => void;
  itemName: string;
  maxStock: number;
}) {
  const handleIncrease = () => {
    if (quantity < maxStock) {
      onUpdate(quantity + 1);
    } else {
      Alert.alert('تحذير', `لا يمكن إضافة المزيد من "${itemName}". المخزون المتاح: ${maxStock}`);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdate(quantity - 1);
    } else {
      Alert.alert(
        'حذف المنتج',
        `هل تريد حذف "${itemName}" من السلة؟`,
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'حذف', style: 'destructive', onPress: () => onUpdate(0) }
        ]
      );
    }
  };

  return (
    <View style={styles.quantityControl}>
      <TouchableOpacity 
        style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]} 
        onPress={handleDecrease}
        disabled={quantity <= 1}
      >
        <Ionicons name="remove" size={16} color={quantity <= 1 ? '#ccc' : PINK} />
      </TouchableOpacity>
      <Text style={styles.quantityText}>{quantity}</Text>
      <TouchableOpacity 
        style={[styles.quantityBtn, quantity >= maxStock && styles.quantityBtnDisabled]} 
        onPress={handleIncrease}
        disabled={quantity >= maxStock}
      >
        <Ionicons name="add" size={16} color={quantity >= maxStock ? '#ccc' : PINK} />
      </TouchableOpacity>
    </View>
  );
}

export default function CartScreen() {
  const { state, removeFromCartAndSync, fetchCartFromBackend, updateQuantityAndSync } = useCart();
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      loadCart();
    }
  }, [token]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      await fetchCartFromBackend();
    } catch (error) {
      console.error('خطأ في تحميل السلة:', error);
      Alert.alert('خطأ', 'فشل في تحميل السلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (id: string, name: string) => {
    Alert.alert(
      'حذف المنتج',
      `هل تريد حذف "${name}" من السلة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCartAndSync(id);
              Alert.alert('تم الحذف', 'تم حذف المنتج من السلة بنجاح');
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('خطأ', 'فشل في حذف المنتج. يرجى المحاولة مرة أخرى.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        // حذف المنتج
        await removeFromCartAndSync(id);
      } else {
        // تحديث الكمية
        await updateQuantityAndSync(id, newQuantity);
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      Alert.alert('خطأ', error.message || 'فشل في تحديث الكمية. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert('السلة فارغة', 'أضف منتجات للسلة أولاً');
      return;
    }
    
    if (!token) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لإتمام الشراء');
      return;
    }

    // التوجيه لصفحة إتمام الشراء
    router.push('/(modals)/checkout/' as any);
  };

  const total = state.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image || 'https://placehold.co/80x80?text=Product' }} 
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name || 'منتج غير محدد'}</Text>
        <Text style={styles.itemPrice}>{(item.price || 0).toFixed(2)} ريال</Text>
        <Text style={styles.itemStock}>المخزون المتاح: {item.stock || 0}</Text>
      </View>
      <View style={styles.itemActions}>
        <QuantityControl
          quantity={item.quantity}
          onUpdate={(newQuantity) => handleUpdateQuantity(item.id, newQuantity)}
          itemName={item.name || 'المنتج'}
          maxStock={item.stock || 0}
        />
        <Text style={styles.itemTotal}>{((item.price || 0) * item.quantity).toFixed(2)} ريال</Text>
        <TouchableOpacity 
          style={styles.removeBtn}
          onPress={() => handleRemoveItem(item.id, item.name || 'المنتج')}
        >
          <Ionicons name="trash-outline" size={20} color={PINK} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ marginTop: 16, color: PRIMARY, fontSize: 16 }}>جاري تحميل السلة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>سلة المشتريات</Text>
          <TouchableOpacity onPress={loadCart} style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={24} color={PRIMARY} />
          </TouchableOpacity>
        </View>
        
        {!token ? (
          <View style={styles.emptyBox}>
            <Ionicons name="log-in-outline" size={60} color="#bbb" />
            <Text style={styles.emptyText}>تسجيل الدخول مطلوب</Text>
            <Text style={styles.emptySubText}>سجل دخولك لعرض سلة مشترياتك</Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login/login')}
            >
              <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        ) : state.items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cart-outline" size={60} color="#bbb" />
            <Text style={styles.emptyText}>سلتك فارغة</Text>
            <Text style={styles.emptySubText}>أضف منتجات من الصفحة الرئيسية</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.shopButtonText}>تسوق الآن</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={state.items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>الإجمالي:</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} ريال</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>إتمام الشراء</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: PINK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 2,
  },
  itemStock: {
    fontSize: 12,
    color: '#888',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  quantityBtn: {
    padding: 8,
    borderRadius: 4,
  },
  quantityBtnDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PINK,
    marginBottom: 8,
  },
  removeBtn: {
    padding: 8,
  },
  totalBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  checkoutBtn: {
    backgroundColor: PINK,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
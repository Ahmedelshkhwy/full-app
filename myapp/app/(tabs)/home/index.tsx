import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../../../src/contexts/cartcontext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { getAllProducts } from '../../../src/api/api';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7'; // الأزرق الفاتح من الشعار
const PINK = '#E94B7B';    // الوردي من الشعار
const BG = '#E6F3F7';      // خلفية فاتحة

// نوع المنتج من قاعدة البيانات
type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock: number;
  category: string;
};

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCartAndSync, state } = useCart();
  const { token } = useAuth();
  const router = useRouter();

  // حساب عدد العناصر في السلة
  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('خطأ في تحميل المنتجات:', err);
      setError('فشل في تحميل المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!product) {
      Alert.alert('خطأ', 'المنتج غير متوفر');
      return;
    }

    if (!token) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول لإضافة منتجات للسلة',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'تسجيل دخول', onPress: () => {
            router.push('/(auth)/login/login');
          }}
        ]
      );
      return;
    }

    try {
      console.log('Adding product to cart:', product); // للتشخيص
      await addToCartAndSync({
        id: product._id || '',
        name: product.name || 'منتج غير محدد',
        price: product.price || 0,
        quantity: 1
      });
      Alert.alert('تمت الإضافة', `تمت إضافة "${product.name || 'المنتج'}" إلى السلة.`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('خطأ', error.message || 'فشل في إضافة المنتج للسلة');
    }
  };

  // فلترة المنتجات حسب البحث
  const filteredProducts = products.filter((item) =>
    item && item.name && (item.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // عرض كل صف فيه كارتين
  const renderRow = ({ item, index }: { item: Product; index: number }) => {
    if (!item || index % 2 !== 0) { return null; }
    const second = filteredProducts[index + 1];
    return (
      <View style={styles.cardsRow} key={item._id || `item-${index}`}>
        <ProductCard
          product={item}
          onAdd={() => handleAddToCart(item)}
        />
        {second ? (
          <ProductCard
            product={second}
            onAdd={() => handleAddToCart(second)}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>صيدليات الشافي</Text>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ marginTop: 16, color: PRIMARY, fontSize: 16 }}>جاري تحميل المنتجات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>صيدليات الشافي</Text>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
          <Text style={{ marginTop: 16, color: '#ff6b6b', fontSize: 16, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProducts}>
            <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      {/* الهيدر */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>صيدليات الشافي</Text>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color="white" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* اسم الشركة فوق شريط البحث */}
      <View style={styles.companyNameWrapper}>
        <Text style={styles.companyName}>ALSHAFI MEDICAL COMPANY</Text>
      </View>

      {/* شريط البحث */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن الأدوية أو المنتجات"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => Alert.alert('ماسح QR', 'سيتم إضافة ماسح QR قريباً')}
          >
            <MaterialIcons name="qr-code-scanner" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/offers')}
          >
            <Ionicons name="heart-outline" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* الكروت */}
      <FlatList
        data={filteredProducts}
        renderItem={renderRow}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.cardsList}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        refreshing={isLoading}
        onRefresh={loadProducts}
      />

      {/* الفوتر */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 جميع الحقوق محفوظة لصيدليات الشافي</Text>
      </View>
    </SafeAreaView>
  );
}

// مكون الكارت الواحد
function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: product.image || 'https://placehold.co/100x100?text=Product' }} 
        style={styles.cardImg} 
      />
      <Text style={styles.cardName}>{product.name || 'منتج غير محدد'}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {product.description || 'لا يوجد وصف'}
      </Text>
      <Text style={styles.cardPrice}>{(product.price || 0).toFixed(2)} ر.س</Text>
      <Text style={styles.cardStock}>المتوفر: {product.stock || 0}</Text>
      <TouchableOpacity 
        style={[styles.addBtn, (product.stock || 0) <= 0 && styles.addBtnDisabled]} 
        onPress={onAdd}
        disabled={(product.stock || 0) <= 0}
      >
        <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.addBtnText}>
          {(product.stock || 0) <= 0 ? 'نفذ المخزون' : 'إضافة للسلة'}
        </Text>
      </TouchableOpacity>
    </View>
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
    padding: 18,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif',
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: PINK,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyNameWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  companyName: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif',
  },
  searchWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardsList: {
    paddingHorizontal: 18,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImg: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 4,
  },
  cardStock: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addBtnDisabled: {
    backgroundColor: '#ccc',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

function SloganBanner() {
  return (
    <View style={bannerStyles.container}>
      <Text style={bannerStyles.text}>الشافي ثقة تدوم 💊</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
    borderRadius: 14,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
});


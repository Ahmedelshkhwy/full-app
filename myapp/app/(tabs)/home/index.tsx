import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../../src/contexts/cartcontext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { getAllProducts } from '../../../src/api/api';
import { useRouter } from 'expo-router';
import SafeScreen from '../../../src/components/SafeScreen';
import AppHeader from '../../../src/components/AppHeader';
import LoadingComponent from '../../../src/components/LoadingComponent';
import ErrorComponent from '../../../src/components/ErrorComponent';
import { Theme } from '../../../src/constants/Theme';

const PRIMARY = Theme.colors.primary;
const PINK = Theme.colors.error;
const BG = Theme.colors.background;

// نوع المنتج من قاعدة البيانات
type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  isActive?: boolean;
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // تحميل المنتجات من الـ API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('فشل في تحميل المنتجات. تحقق من اتصال الإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // فلترة المنتجات بناءً على البحث
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // تحويل المنتجات إلى أزواج
  const productPairs = pairProducts(filteredProducts);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى السلة', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    addToCart({
      productId: product._id,
      quantity: 1,
      price: product.price,
      product: product
    });

    Alert.alert('تمت الإضافة', `تم إضافة ${product.name} إلى السلة`);
  };

  const renderProduct = (product: Product) => (
    <TouchableOpacity style={styles.productCard}>
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price} ريال</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(product)}
        >
          <Text style={styles.addButtonText}>أضف للسلة</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPair = ({ item }: { item: Product[] }) => {
    const [first, second] = item;
    return (
      <View style={styles.pairContainer}>
        {renderProduct(first)}
        {second ? renderProduct(second) : <View style={{ flex: 1 }} />}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeScreen backgroundColor={BG}>
        <AppHeader title="صيدليات الشافي" />
        <LoadingComponent message="جاري تحميل المنتجات..." />
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen backgroundColor={BG}>
        <AppHeader title="صيدليات الشافي" />
        <ErrorComponent 
          message={error}
          onRetry={loadProducts}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen backgroundColor={BG}>
      <AppHeader 
        title="صيدليات الشافي"
        rightAction={{
          icon: "cart-outline",
          onPress: () => router.push('/(tabs)/cart')
        }}
      />
      <View style={styles.container}>
        {/* شريط البحث */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="ابحث عن الأدوية..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        
        <SloganBanner />
        
        <FlatList
          data={productPairs}
          renderItem={renderPair}
          keyExtractor={(item, index) => `pair-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>
    </SafeScreen>
  );
}

// دالة مساعدة لتجميع المنتجات في أزواج
const pairProducts = (products: Product[]): Product[][] => {
  const pairs: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    pairs.push([products[i], products[i + 1]].filter(Boolean));
  }
  return pairs;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.small,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.gray[700],
  },
  productsList: {
    flexGrow: 1,
  },
  pairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  productCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    width: '48%',
    ...Theme.shadows.medium,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Theme.spacing.sm,
  },
  productName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.gray[700],
    marginBottom: Theme.spacing.xs,
  },
  productPrice: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: PRIMARY,
    marginBottom: Theme.spacing.sm,
  },
  addButton: {
    backgroundColor: PRIMARY,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  addButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
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
    backgroundColor: Theme.colors.gray[100],
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
  },
  text: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.gray[800],
  },
});
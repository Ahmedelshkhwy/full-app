import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../src/contexts/cartcontext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const { addToCartAndSync } = useCart();
  const { token } = useAuth();
  const router = useRouter();

  // بيانات المنتج (يمكن جلبها من البارامترات)
  const product = {
    _id: '1',
    name: 'باراسيتامول 500 ملجم',
    brand: 'شركة الأدوية المتحدة',
    price: 15.50,
    originalPrice: 20.00,
    image: 'https://placehold.co/300x300?text=Product',
    description: 'مسكن للألم وخافض للحرارة. يستخدم لتخفيف الصداع وآلام الجسم والحمى.',
    stock: 50
  };

  const handleAddToCart = async () => {
    if (!token) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول لإضافة منتجات للسلة',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'تسجيل دخول', onPress: () => router.push('/(auth)/login/login') }
        ]
      );
      return;
    }

    try {
      await addToCartAndSync({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        stock: product.stock
      });
      Alert.alert('تمت الإضافة', `تمت إضافة "${product.name}" إلى السلة.`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('خطأ', error.message || 'فشل في إضافة المنتج للسلة');
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    if (increment && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل المنتج</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price.toFixed(2)} ر.س</Text>
            <Text style={styles.originalPrice}>{product.originalPrice.toFixed(2)} ر.س</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>خصم 23%</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star-outline" size={16} color="#FFD700" />
            </View>
            <Text style={styles.ratingText}>4.2 (120 تقييم)</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>تفاصيل المنتج</Text>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>الفئة:</Text>
              <Text style={styles.detailValue}>مسكنات الألم</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>الحجم:</Text>
              <Text style={styles.detailValue}>20 قرص</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>تاريخ الانتهاء:</Text>
              <Text style={styles.detailValue}>2025-12-31</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>الشركة المصنعة:</Text>
              <Text style={styles.detailValue}>شركة الأدوية المتحدة</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(false)}
            disabled={quantity <= 1}
          >
            <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#23B6C7"} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(true)}
            disabled={quantity >= product.stock}
          >
            <Ionicons name="add" size={20} color={quantity >= product.stock ? "#ccc" : "#23B6C7"} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.addToCartText}>إضافة للسلة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  productImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#23B6C7',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#23B6C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
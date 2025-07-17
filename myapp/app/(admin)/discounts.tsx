import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
// استخدام متغيرات البيئة للـ API
const API_BASE = process.env.EXPO_PUBLIC_API_ADMIN_URL || 'http://172.19.112.1:5000/api/admin';

// نوع الخصم من الباك إند
type Discount = {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  originalPrice: number;
  discountPrice: number;
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  validUntil: string | undefined; // تحديث النوع ليتطابق مع الواقع
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export default function AdminDiscountsScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    productId: '',
    validUntil: '' as string,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.back();
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // تحميل الخصومات
      const discountsResponse = await fetch(`${API_BASE}/discounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // تحميل المنتجات
      const productsResponse = await fetch(`${API_BASE}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (discountsResponse.ok && productsResponse.ok) {
        const discountsData = await discountsResponse.json();
        const productsData = await productsResponse.json();
        setDiscounts(discountsData.discounts || []);
        setProducts(productsData.products || []);
      } else {
        console.error('فشل في تحميل البيانات:', discountsResponse.status, productsResponse.status);
        Alert.alert('خطأ', 'فشل في تحميل البيانات من الخادم');
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setFormData({
      title: '',
      description: '',
      discountPercentage: '',
      productId: '',
      validUntil: '',
    });
    setShowAddModal(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      title: discount.title,
      description: discount.description,
      discountPercentage: discount.discountPercentage.toString(),
      productId: discount.productId,
      validUntil: (discount.validUntil ? discount.validUntil.split('T')[0] : '') as string, // تحويل التاريخ إلى YYYY-MM-DD
    });
    setShowAddModal(true);
  };

  const handleDeleteDiscount = async (discount: Discount) => {
    Alert.alert(
      'حذف الخصم',
      `هل أنت متأكد من حذف "${discount.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/discounts/${discount._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('تم الحذف', 'تم حذف الخصم بنجاح');
                loadData();
              } else {
                Alert.alert('خطأ', 'فشل في حذف الخصم');
              }
            } catch (error) {
              console.error('خطأ في حذف الخصم:', error);
              Alert.alert('خطأ', 'فشل في حذف الخصم');
            }
          },
        },
      ]
    );
  };

  const handleSaveDiscount = async () => {
    if (!formData.title || !formData.description || !formData.discountPercentage || !formData.productId || !formData.validUntil) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const selectedProduct = products.find(p => p._id === formData.productId);
    if (!selectedProduct) {
      Alert.alert('خطأ', 'المنتج المحدد غير موجود');
      return;
    }

    const discountPercentage = parseFloat(formData.discountPercentage);
    if (discountPercentage <= 0 || discountPercentage >= 100) {
      Alert.alert('خطأ', 'نسبة الخصم يجب أن تكون بين 1 و 99');
      return;
    }

    try {
      const discountData = {
        title: formData.title,
        description: formData.description,
        discountPercentage,
        productId: formData.productId,
        validUntil: formData.validUntil,
      };

      const url = editingDiscount 
        ? `${API_BASE}/discounts/${editingDiscount._id}`
        : `${API_BASE}/discounts`;
      
      const method = editingDiscount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });

      if (response.ok) {
        Alert.alert(
          'تم الحفظ',
          editingDiscount ? 'تم تحديث الخصم بنجاح' : 'تم إضافة الخصم بنجاح'
        );
        setShowAddModal(false);
        loadData();
      } else {
        Alert.alert('خطأ', 'فشل في حفظ الخصم');
      }
    } catch (error) {
      console.error('خطأ في حفظ الخصم:', error);
      Alert.alert('خطأ', 'فشل في حفظ الخصم');
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = (discount.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (discount.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (discount.product?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderDiscount = ({ item }: { item: Discount }) => (
    <View style={styles.discountCard}>
      <View style={styles.discountHeader}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountPercentage}>{item.discountPercentage}%</Text>
          <Text style={styles.discountLabel}>خصم</Text>
        </View>
        <View style={styles.discountActions}>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => handleEditDiscount(item)}
          >
            <Ionicons name="create-outline" size={20} color={PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDeleteDiscount(item)}
          >
            <Ionicons name="trash-outline" size={20} color={PINK} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Image 
          source={{ uri: item.product?.image || 'https://placehold.co/300x200?text=Product' }} 
          style={styles.productImage}
        />
        <View style={styles.productDetails}>
          <Text style={styles.discountTitle}>{item.title || '---'}</Text>
          <Text style={styles.productName}>{item.product?.name || '---'}</Text>
          <Text style={styles.discountDescription}>{item.description || '---'}</Text>
        </View>
      </View>

      <View style={styles.priceInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>السعر الأصلي:</Text>
          <Text style={styles.originalPrice}>{(item.originalPrice || 0).toFixed(2)} ريال</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>السعر بعد الخصم:</Text>
          <Text style={styles.discountPrice}>{(item.discountPrice || 0).toFixed(2)} ريال</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>صالح حتى:</Text>
          <Text style={styles.validUntil}>
            {item.validUntil ? new Date(item.validUntil).toLocaleDateString('ar-SA') : '---'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productOption,
        formData.productId === item._id && styles.productOptionSelected
      ]}
      onPress={() => setFormData({ ...formData, productId: item._id })}
    >
      <Image 
        source={{ uri: item.image || 'https://placehold.co/300x200?text=Product' }} 
        style={styles.productOptionImage}
      />
      <View style={styles.productOptionInfo}>
        <Text style={[
          styles.productOptionName,
          formData.productId === item._id && styles.productOptionNameSelected
        ]}>
          {item.name || '---'}
        </Text>
        <Text style={[
          styles.productOptionPrice,
          formData.productId === item._id && styles.productOptionPriceSelected
        ]}>
          {(item.price || 0).toFixed(2)} ريال
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إدارة الخصومات</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ marginTop: 16, color: PRIMARY, fontSize: 16 }}>جاري تحميل الخصومات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة الخصومات</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddDiscount}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في الخصومات..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
      </View>

      {/* قائمة الخصومات */}
      <FlatList
        data={filteredDiscounts}
        renderItem={renderDiscount}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.discountsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'لا توجد خصومات تطابق البحث' : 'لا توجد خصومات'}
            </Text>
          </View>
        }
      />

      {/* نافذة إضافة/تعديل الخصم */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.formInput}
              placeholder="عنوان الخصم"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="وصف الخصم"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="نسبة الخصم (%)"
              value={formData.discountPercentage}
              onChangeText={(text) => setFormData({ ...formData, discountPercentage: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="تاريخ انتهاء الصلاحية (YYYY-MM-DD)"
              value={formData.validUntil}
              onChangeText={(text) => setFormData({ ...formData, validUntil: text })}
            />

            <View style={styles.productSelector}>
              <Text style={styles.productSelectorLabel}>اختر المنتج:</Text>
              <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                style={styles.productsList}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveDiscount}
            >
              <Text style={styles.saveButtonText}>
                {editingDiscount ? 'تحديث الخصم' : 'إضافة الخصم'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingTop: Platform.OS === 'ios' ? 60 : (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50),
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSpacer: {
    width: 40,
  },
  addButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  searchIcon: {
    marginLeft: 8,
  },
  discountsList: {
    padding: 16,
  },
  discountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: PINK,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  discountPercentage: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountLabel: {
    color: 'white',
    fontSize: 10,
  },
  discountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: PRIMARY,
    marginBottom: 4,
  },
  discountDescription: {
    fontSize: 12,
    color: '#666',
  },
  priceInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PINK,
  },
  validUntil: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  modalHeader: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 20,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'right',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  productSelector: {
    marginBottom: 20,
  },
  productSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productsList: {
    maxHeight: 200,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productOptionSelected: {
    backgroundColor: PRIMARY,
  },
  productOptionImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  productOptionInfo: {
    flex: 1,
  },
  productOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productOptionNameSelected: {
    color: 'white',
  },
  productOptionPrice: {
    fontSize: 12,
    color: '#666',
  },
  productOptionPriceSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
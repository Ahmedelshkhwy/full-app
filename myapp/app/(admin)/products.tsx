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
  TextInput,
  Modal,
  RefreshControl,
  Image,
  Switch,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import LoadingComponent from '../../src/components/LoadingComponent';
import ErrorComponent from '../../src/components/ErrorComponent';
import EmptyState from '../../src/components/EmptyState';

// استيراد آمن لـ expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.log('expo-image-picker غير متوفر:', error);
}

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
const API_BASE = 'http://192.168.8.87:5000/api/admin';

// نوع المنتج من الباك إند
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  _id: string;
  name: string;
  description: string;
};

export default function AdminProductsScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.back();
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // تحميل المنتجات
      const productsResponse = await fetch(`${API_BASE}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // تحميل الفئات
      const categoriesResponse = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (productsResponse.ok && categoriesResponse.ok) {
        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        // التأكد من أن البيانات هي arrays
        const safeProductsData = Array.isArray(productsData) ? productsData : 
                                Array.isArray(productsData?.products) ? productsData.products : [];
        const safeCategoriesData = Array.isArray(categoriesData) ? categoriesData : 
                                  Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
        
        console.log('Products loaded:', safeProductsData.length);
        console.log('Categories loaded:', safeCategoriesData.length);
        
        setProducts(safeProductsData);
        setCategories(safeCategoriesData);
      } else {
        console.error('فشل في تحميل البيانات:', productsResponse.status, categoriesResponse.status);
        Alert.alert('خطأ', 'فشل في تحميل البيانات من الخادم');
        setProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    // التأكد من أن products هو array وليس undefined
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products]; // إنشاء نسخة من المصفوفة

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product && product.name && product.description &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product && product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
    });
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image,
    });
    setShowAddModal(true);
  };

  // دالة اختيار الصورة
  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert('خطأ', 'ميزة اختيار الصور غير متوفرة في هذا الإصدار');
      return;
    }

    try {
      // طلب إذن الوصول للصور
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول للمعرض لاختيار الصورة');
        return;
      }

      // فتح معرض الصور
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('خطأ في اختيار الصورة:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  // دالة التقاط صورة بالكاميرا
  const takePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert('خطأ', 'ميزة التقاط الصور غير متوفرة في هذا الإصدار');
      return;
    }

    try {
      // طلب إذن الوصول للكاميرا
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول للكاميرا لالتقاط الصورة');
        return;
      }

      // فتح الكاميرا
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('خطأ في التقاط الصورة:', error);
      Alert.alert('خطأ', 'فشل في التقاط الصورة');
    }
  };

  // دالة عرض خيارات الصورة
  const showImageOptions = () => {
    if (!ImagePicker) {
      Alert.alert('خطأ', 'ميزة اختيار الصور غير متوفرة في هذا الإصدار');
      return;
    }

    Alert.alert(
      'اختيار الصورة',
      'كيف تريد اختيار الصورة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'من المعرض', onPress: pickImage },
        { text: 'التقاط صورة', onPress: takePhoto },
      ]
    );
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف "${product.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/products/${product._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('تم الحذف', 'تم حذف المنتج بنجاح');
                loadData();
              } else {
                Alert.alert('خطأ', 'فشل في حذف المنتج');
              }
            } catch (error) {
              console.error('خطأ في حذف المنتج:', error);
              Alert.alert('خطأ', 'فشل في حذف المنتج');
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      let imageUrl = formData.image;
      
      // إذا كانت الصورة محلية (تبدأ بـ file:// أو content://)، نحولها إلى base64
      if (formData.image && (formData.image.startsWith('file://') || formData.image.startsWith('content://'))) {
        try {
          // تحويل الصورة إلى base64
          const response = await fetch(formData.image);
          const blob = await response.blob();
          const reader = new FileReader();
          
          imageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('خطأ في تحويل الصورة:', error);
          Alert.alert('خطأ', 'فشل في معالجة الصورة');
          return;
        }
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: imageUrl || 'https://placehold.co/300x200?text=Product',
        isActive: true
      };

      console.log('Saving product with data:', productData);

      const url = editingProduct 
        ? `${API_BASE}/admin/products/${editingProduct._id}`
        : `${API_BASE}/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      console.log(`Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        Alert.alert(
          'تم الحفظ',
          editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح'
        );
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image: '',
        });
        await loadData();
      } else {
        const errorMessage = responseData?.message || responseData?.error || 'فشل في حفظ المنتج';
        console.error('Server error:', errorMessage);
        Alert.alert('خطأ', `فشل في حفظ المنتج: ${errorMessage}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع';
      Alert.alert('خطأ', `فشل في حفظ المنتج: ${errorMessage}`);
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) {return '#f44336';}
    if (stock < 10) {return '#ff9800';}
    return '#4caf50';
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}

      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>{item.price.toFixed(2)} ريال</Text>
        <Text style={styles.productStock}>المخزون: {item.stock}</Text>
        <Text style={styles.productCategory}>الفئة: {item.category}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="create-outline" size={20} color={PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash-outline" size={20} color={PINK} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryBtn,
        selectedCategory === item._id && styles.categoryBtnActive
      ]}
      onPress={() => setSelectedCategory(item._id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item._id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة المنتجات</Text>
        </View>
        <LoadingComponent 
          message="جاري تحميل المنتجات..."
          iconName="cube-outline"
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة المنتجات</Text>
        </View>
        <ErrorComponent 
          message={error}
          onRetry={loadData}
          iconName="alert-circle-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
      
      {/* الهيدر */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المنتجات</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddProduct}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في المنتجات..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
      </View>

      {/* فئات المنتجات */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={[{ _id: 'all', name: 'جميع المنتجات', description: '' }, ...categories]}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* قائمة المنتجات */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productsList}
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
          <EmptyState 
            iconName="cube-outline"
            title={searchQuery || selectedCategory !== 'all' ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات'}
            subtitle="يمكنك إضافة منتجات جديدة باستخدام زر الإضافة"
            onAction={() => setShowAddModal(true)}
            actionText="إضافة منتج"
          />
        }
      />

      {/* نافذة إضافة/تعديل المنتج */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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
              placeholder="اسم المنتج"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="وصف المنتج"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="السعر"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="المخزون"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
            />
            
            {/* قسم الصورة */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>صورة المنتج:</Text>
              
              {formData.image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: formData.image }} 
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.changeImageBtn}
                    onPress={showImageOptions}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.changeImageText}>تغيير الصورة</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity 
                    style={styles.uploadImageBtn}
                    onPress={showImageOptions}
                  >
                    <Ionicons name="camera-outline" size={32} color={PRIMARY} />
                    <Text style={styles.uploadImageText}>اختر صورة للمنتج</Text>
                    <Text style={styles.uploadImageSubtext}>من المعرض أو الكاميرا</Text>
                  </TouchableOpacity>
                  
                  {!ImagePicker && (
                    <View style={styles.fallbackContainer}>
                      <Text style={styles.fallbackText}>أو أدخل رابط الصورة:</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="رابط الصورة (اختياري)"
                        value={formData.image}
                        onChangeText={(text) => setFormData({ ...formData, image: text })}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>الفئة:</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      formData.category === item._id && styles.categoryOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, category: item._id })}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      formData.category === item._id && styles.categoryOptionTextSelected
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item._id}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProduct}
            >
              <Text style={styles.saveButtonText}>
                {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryBtnActive: {
    backgroundColor: PRIMARY,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  // أنماط الصور
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  uploadImageBtn: {
    borderWidth: 2,
    borderColor: PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  uploadImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginTop: 8,
  },
  uploadImageSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  fallbackContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
  },
  productActions: {
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  editBtn: {
    padding: 8,
    marginBottom: 8,
  },
  deleteBtn: {
    padding: 8,
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
  categorySelector: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryOptionSelected: {
    backgroundColor: PRIMARY,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryOptionTextSelected: {
    color: 'white',
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

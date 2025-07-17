import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import LoadingComponent from '../../src/components/LoadingComponent';
import ErrorComponent from '../../src/components/ErrorComponent';
import EmptyState from '../../src/components/EmptyState';
import { 
  useAdminService, 
  AdminServiceError, 
  formatPrice, 
  getStockStatus, 
  getCategoryName,
  formatDateShort 
} from '../../src/services/admin.service';
import type { Product, Category } from '../../src/services/admin.service';

// Safe import for expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.log('expo-image-picker not available:', error);
}

const { width } = Dimensions.get('window');
const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
const SUCCESS = '#4CAF50';
const WARNING = '#FF9800';
const ERROR = '#F44336';

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image: string;
  isActive: boolean;
};

export default function AdminProductsScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  // Initialize admin service
  const adminService = React.useMemo(() => {
    if (!token) return null;
    try {
      return useAdminService(token);
    } catch (error) {
      console.error('Failed to initialize admin service:', error);
      return null;
    }
  }, [token]);

  // State management
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Effects
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

  // Data loading
  const loadData = useCallback(async () => {
    if (!adminService) {
      setError('لا يمكن الوصول إلى الخدمة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);

      console.log('Products loaded:', productsData.length);
      console.log('Categories loaded:', categoriesData.length);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      let errorMessage = 'فشل في تحميل البيانات';
      
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [adminService]);

  // Filter products
  const filterProducts = useCallback(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(query) ||
        product?.description?.toLowerCase().includes(query) ||
        getCategoryName(product.category).toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const categoryId = typeof product.category === 'string' 
          ? product.category 
          : product.category?._id;
        return categoryId === selectedCategory;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.name.trim()) errors.name = 'اسم المنتج مطلوب';
    if (!formData.description.trim()) errors.description = 'وصف المنتج مطلوب';
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'السعر يجب أن يكون رقم صحيح أكبر من صفر';
    }
    if (!formData.category) errors.category = 'يرجى اختيار فئة للمنتج';
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      errors.stock = 'المخزون يجب أن يكون رقم صحيح أكبر من أو يساوي صفر';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      isActive: true,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    const categoryId = typeof product.category === 'string' 
      ? product.category 
      : product.category._id;
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: categoryId,
      stock: product.stock.toString(),
      image: product.image,
      isActive: product.isActive,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormErrors({});
  };

  // Image handling
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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول للمعرض لاختيار الصورة');
        return;
      }

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
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول للكاميرا لالتقاط الصورة');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('خطأ', 'فشل في التقاط الصورة');
    }
  };

  // CRUD operations
  const handleDeleteProduct = async (product: Product) => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف "${product.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteProduct(product._id);
              Alert.alert('تم الحذف', 'تم حذف المنتج بنجاح');
              await loadData();
            } catch (error) {
              let errorMessage = 'فشل في حذف المنتج';
              if (error instanceof AdminServiceError) {
                errorMessage = error.message;
              } else if (error instanceof Error) {
                errorMessage = error.message;
              }
              Alert.alert('خطأ', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    if (!validateForm()) {
      Alert.alert('خطأ في البيانات', 'يرجى تصحيح الأخطاء المحددة');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      
      // Handle local image conversion using admin service
      if (formData.image && (formData.image.startsWith('file://') || formData.image.startsWith('content://'))) {
        try {
          imageUrl = await adminService.uploadImage(formData.image);
        } catch (error) {
          console.error('Error converting image:', error);
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
        isActive: formData.isActive
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, productData);
        Alert.alert('تم التحديث', 'تم تحديث المنتج بنجاح');
      } else {
        await adminService.createProduct(productData);
        Alert.alert('تم الإنشاء', 'تم إضافة المنتج بنجاح');
      }

      closeModal();
      await loadData();
    } catch (error) {
      let errorMessage = 'فشل في حفظ المنتج';
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    try {
      await adminService.updateProduct(product._id, { isActive: !product.isActive });
      await loadData();
    } catch (error) {
      let errorMessage = 'فشل في تحديث حالة المنتج';
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('خطأ', errorMessage);
    }
  };

  // Render components
  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stock);
    const categoryName = getCategoryName(item.category);

    return (
      <View style={[styles.productCard, !item.isActive && styles.inactiveCard]}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image || 'https://placehold.co/300x200?text=Product' }} 
            style={styles.productImage}
            defaultSource={{ uri: 'https://placehold.co/300x200?text=Product' }}
          />
          {!item.isActive && (
            <View style={styles.inactiveOverlay}>
              <Ionicons name="ban" size={24} color="white" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, !item.isActive && styles.inactiveText]} numberOfLines={1}>
              {item.name}
            </Text>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleProductStatus(item)}
              trackColor={{ false: '#767577', true: PRIMARY }}
              thumbColor={item.isActive ? 'white' : '#f4f3f4'}
            />
          </View>

          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.productDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
                <Ionicons name={stockStatus.icon} size={12} color="white" />
                <Text style={styles.statusText}>{stockStatus.text}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="cube-outline" size={14} color="#666" />
                <Text style={styles.metaText}>المخزون: {item.stock}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="folder-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{categoryName}</Text>
              </View>
            </View>

            <View style={styles.timestampRow}>
              <Text style={styles.timestampText}>
                آخر تحديث: {formatDateShort(item.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={20} color={PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteProduct(item)}
          >
            <Ionicons name="trash-outline" size={20} color={PINK} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

  const renderFormInput = (
    key: keyof FormData,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric';
      numberOfLines?: number;
    } = {}
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.formInput,
          options.multiline && styles.textArea,
          formErrors[key] && styles.inputError
        ]}
        placeholder={placeholder}
        value={formData[key] as string}
        onChangeText={(text) => {
          setFormData({ ...formData, [key]: text });
          if (formErrors[key]) {
            setFormErrors({ ...formErrors, [key]: undefined });
          }
        }}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
        keyboardType={options.keyboardType}
        placeholderTextColor="#999"
      />
      {formErrors[key] && (
        <Text style={styles.errorText}>{formErrors[key]}</Text>
      )}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
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

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
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
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المنتجات</Text>
        <View style={styles.headerActions}>
          <Text style={styles.productCount}>
            {filteredProducts.length} منتج
          </Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddProduct}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المنتجات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>
      </View>

      {/* Categories Filter */}
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

      {/* Products List */}
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
            subtitle={searchQuery || selectedCategory !== 'all' 
              ? 'جرب تغيير مصطلحات البحث أو الفئة المحددة'
              : 'يمكنك إضافة منتجات جديدة باستخدام زر الإضافة'
            }
            onAction={searchQuery || selectedCategory !== 'all' 
              ? () => { setSearchQuery(''); setSelectedCategory('all'); }
              : handleAddProduct
            }
            actionText={searchQuery || selectedCategory !== 'all' ? 'مسح التصفية' : 'إضافة منتج'}
          />
        }
      />

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* Basic Info */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>معلومات أساسية</Text>
                
                {renderFormInput('name', 'اسم المنتج *')}
                {renderFormInput('description', 'وصف المنتج *', { 
                  multiline: true, 
                  numberOfLines: 3 
                })}
                {renderFormInput('price', 'السعر *', { keyboardType: 'numeric' })}
                {renderFormInput('stock', 'المخزون *', { keyboardType: 'numeric' })}
              </View>

              {/* Category Selection */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>الفئة *</Text>
                {formErrors.category && (
                  <Text style={styles.errorText}>{formErrors.category}</Text>
                )}
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
                      onPress={() => {
                        setFormData({ ...formData, category: item._id });
                        if (formErrors.category) {
                          setFormErrors({ ...formErrors, category: undefined });
                        }
                      }}
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
                  contentContainerStyle={styles.categoryOptionsContainer}
                />
              </View>

              {/* Product Status */}
              <View style={styles.formSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.sectionTitle}>المنتج نشط</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                    trackColor={{ false: '#767577', true: PRIMARY }}
                    thumbColor={formData.isActive ? 'white' : '#f4f3f4'}
                  />
                </View>
                <Text style={styles.helpText}>
                  المنتجات غير النشطة لن تظهر للعملاء
                </Text>
              </View>

              {/* Image Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>صورة المنتج</Text>
                
                {formData.image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: formData.image }} 
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageActions}>
                      <TouchableOpacity 
                        style={styles.changeImageBtn}
                        onPress={showImageOptions}
                      >
                        <Ionicons name="camera" size={16} color="white" />
                        <Text style={styles.changeImageText}>تغيير الصورة</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeImageBtn}
                        onPress={() => setFormData({ ...formData, image: '' })}
                      >
                        <Ionicons name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
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
                          placeholderTextColor="#999"
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSaveProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.saveButtonText}>جاري الحفظ...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </Text>
              )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  inactiveCard: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  inactiveText: {
    color: '#999',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  timestampRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  timestampText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  productActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  deleteBtn: {},
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
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'right',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: ERROR,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: ERROR,
    marginTop: 4,
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  categoryOptionsContainer: {
    paddingVertical: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryOptionTextSelected: {
    color: 'white',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removeImageBtn: {
    backgroundColor: ERROR,
    padding: 8,
    borderRadius: 16,
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
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

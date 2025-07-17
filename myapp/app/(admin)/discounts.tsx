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
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Switch,
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
  formatDate,
  formatDateShort,
  getDiscountStatusColor,
  getDiscountStatusText,
  calculateDiscountAmount,
  getProductName,
  getCategoryName
} from '../../src/services/admin.service';
import type { Discount, Product, Category } from '../../src/services/admin.service';

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
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minAmount: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
};

type FilterOptions = {
  status: 'all' | 'active' | 'inactive' | 'expired' | 'upcoming';
  type: 'all' | 'percentage' | 'fixed';
};

export default function AdminDiscountsScreen() {
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
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
  });
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
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
    filterDiscounts();
  }, [searchQuery, filters, discounts]);

  // Data loading
  const loadData = useCallback(async () => {
    if (!adminService) {
      setError('لا يمكن الوصول إلى الخدمة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [discountsData, productsData, categoriesData] = await Promise.all([
        adminService.getDiscounts(),
        adminService.getProducts(),
        adminService.getCategories(),
      ]);

      console.log('Discounts loaded:', discountsData.length);
      console.log('Products loaded:', productsData.length);
      console.log('Categories loaded:', categoriesData.length);

      setDiscounts(discountsData);
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

  // Filter discounts
  const filterDiscounts = useCallback(() => {
    if (!Array.isArray(discounts)) {
      setFilteredDiscounts([]);
      return;
    }

    let filtered = [...discounts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(discount => {
        const nameMatch = discount.name?.toLowerCase().includes(query);
        const descriptionMatch = discount.description?.toLowerCase().includes(query);
        const codeMatch = discount.code?.toLowerCase().includes(query);
        
        // Search in applicable products
        const productMatch = discount.applicableProducts?.some(product => {
          const productName = typeof product === 'string' 
            ? products.find(p => p._id === product)?.name 
            : product.name;
          return productName?.toLowerCase().includes(query);
        });

        // Search in applicable categories
        const categoryMatch = discount.applicableCategories?.some(category => {
          const categoryName = typeof category === 'string' 
            ? categories.find(c => c._id === category)?.name 
            : category.name;
          return categoryName?.toLowerCase().includes(query);
        });

        return nameMatch || descriptionMatch || codeMatch || productMatch || categoryMatch;
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(discount => {
        const status = getDiscountStatusText(discount);
        switch (filters.status) {
          case 'active':
            return status === 'نشط';
          case 'inactive':
            return status === 'غير نشط';
          case 'expired':
            return status === 'منتهي الصلاحية';
          case 'upcoming':
            return status === 'قادم';
          default:
            return true;
        }
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(discount => discount.discountType === filters.type);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredDiscounts(filtered);
  }, [discounts, searchQuery, filters, products, categories]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Form validation
  const validateForm = (): boolean => {
    if (!adminService) return false;
    
    const validation = adminService.validateDiscountData({
      name: formData.name,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      startDate: formData.startDate,
      endDate: formData.endDate,
      minAmount: formData.minAmount || '0',
      maxDiscount: formData.maxDiscount || '0',
    });

    if (!validation.isValid) {
      const errors: Partial<FormData> = {};
      validation.errors.forEach(error => {
        if (error.includes('اسم الخصم')) errors.name = error;
        if (error.includes('نوع الخصم')) errors.discountType = error;
        if (error.includes('قيمة الخصم')) errors.discountValue = error;
        if (error.includes('تاريخ البداية')) errors.startDate = error;
        if (error.includes('تاريخ النهاية')) errors.endDate = error;
        if (error.includes('الحد الأدنى')) errors.minAmount = error;
        if (error.includes('الحد الأقصى')) errors.maxDiscount = error;
      });
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  // Modal handlers
  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minAmount: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      minAmount: discount.minAmount?.toString() || '',
      maxDiscount: discount.maxDiscount?.toString() || '',
      startDate: discount.startDate.split('T')[0],
      endDate: discount.endDate.split('T')[0],
      isActive: discount.isActive,
      applicableProducts: Array.isArray(discount.applicableProducts) 
        ? discount.applicableProducts.map(p => typeof p === 'string' ? p : p._id)
        : [],
      applicableCategories: Array.isArray(discount.applicableCategories)
        ? discount.applicableCategories.map(c => typeof c === 'string' ? c : c._id)
        : [],
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleViewDetails = (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDiscount(null);
    setFormErrors({});
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDiscount(null);
  };

  // CRUD operations
  const handleDeleteDiscount = async (discount: Discount) => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    Alert.alert(
      'حذف الخصم',
      `هل أنت متأكد من حذف "${discount.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteDiscount(discount._id);
              Alert.alert('تم الحذف', 'تم حذف الخصم بنجاح');
              await loadData();
            } catch (error) {
              let errorMessage = 'فشل في حذف الخصم';
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

  const handleSaveDiscount = async () => {
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
      const discountData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        applicableProducts: formData.applicableProducts.length > 0 ? formData.applicableProducts : undefined,
        applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined,
      };

      if (editingDiscount) {
        await adminService.updateDiscount(editingDiscount._id, discountData);
        Alert.alert('تم التحديث', 'تم تحديث الخصم بنجاح');
      } else {
        await adminService.createDiscount(discountData);
        Alert.alert('تم الإنشاء', 'تم إضافة الخصم بنجاح');
      }

      closeModal();
      await loadData();
    } catch (error) {
      let errorMessage = 'فشل في حفظ الخصم';
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

  const toggleDiscountStatus = async (discount: Discount) => {
    if (!adminService) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الخدمة');
      return;
    }

    try {
      await adminService.toggleDiscountStatus(discount._id, !discount.isActive);
      await loadData();
    } catch (error) {
      let errorMessage = 'فشل في تحديث حالة الخصم';
      if (error instanceof AdminServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('خطأ', errorMessage);
    }
  };

  // Helper functions
  const getApplicableProductsText = (discount: Discount): string => {
    if (!discount.applicableProducts || discount.applicableProducts.length === 0) {
      return 'جميع المنتجات';
    }
    
    const productNames = discount.applicableProducts.map(product => {
      if (typeof product === 'string') {
        const foundProduct = products.find(p => p._id === product);
        return foundProduct?.name || 'منتج محذوف';
      }
      return product.name;
    });

    if (productNames.length <= 2) {
      return productNames.join('، ');
    }
    return `${productNames.slice(0, 2).join('، ')} +${productNames.length - 2} أخرى`;
  };

  const getApplicableCategoriesText = (discount: Discount): string => {
    if (!discount.applicableCategories || discount.applicableCategories.length === 0) {
      return 'جميع الفئات';
    }
    
    const categoryNames = discount.applicableCategories.map(category => {
      if (typeof category === 'string') {
        const foundCategory = categories.find(c => c._id === category);
        return foundCategory?.name || 'فئة محذوفة';
      }
      return category.name;
    });

    if (categoryNames.length <= 2) {
      return categoryNames.join('، ');
    }
    return `${categoryNames.slice(0, 2).join('، ')} +${categoryNames.length - 2} أخرى`;
  };

  // Get statistics
  const getDiscountStats = () => {
    const total = filteredDiscounts.length;
    const active = filteredDiscounts.filter(d => getDiscountStatusText(d) === 'نشط').length;
    const expired = filteredDiscounts.filter(d => getDiscountStatusText(d) === 'منتهي الصلاحية').length;
    const upcoming = filteredDiscounts.filter(d => getDiscountStatusText(d) === 'قادم').length;
    const percentage = filteredDiscounts.filter(d => d.discountType === 'percentage').length;
    const fixed = filteredDiscounts.filter(d => d.discountType === 'fixed').length;

    return { total, active, expired, upcoming, percentage, fixed };
  };

  // Render components
  const renderDiscountCard = ({ item }: { item: Discount }) => {
    const statusColor = getDiscountStatusColor(item);
    const statusText = getDiscountStatusText(item);

    return (
      <View style={[styles.discountCard, !item.isActive && styles.inactiveCard]}>
        {/* Discount Header */}
        <View style={styles.discountHeader}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountValue}>
              {item.discountType === 'percentage' ? `${item.discountValue}%` : formatPrice(item.discountValue)}
            </Text>
            <Text style={styles.discountType}>
              {item.discountType === 'percentage' ? 'خصم نسبي' : 'خصم ثابت'}
            </Text>
          </View>
          <View style={styles.discountActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleDiscountStatus(item)}
              trackColor={{ false: '#767577', true: PRIMARY }}
              thumbColor={item.isActive ? 'white' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Discount Info */}
        <View style={styles.discountInfo}>
          <Text style={[styles.discountName, !item.isActive && styles.inactiveText]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.discountDescription} numberOfLines={2}>
            {item.description || 'لا يوجد وصف'}
          </Text>
          {item.code && (
            <View style={styles.codeContainer}>
              <Ionicons name="pricetag" size={14} color={PRIMARY} />
              <Text style={styles.discountCode}>{item.code}</Text>
            </View>
          )}
        </View>

        {/* Status and Validity */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              من {formatDateShort(item.startDate)} إلى {formatDateShort(item.endDate)}
            </Text>
          </View>
        </View>

        {/* Applicable Products and Categories */}
        <View style={styles.applicabilitySection}>
          <View style={styles.applicabilityRow}>
            <Ionicons name="cube-outline" size={14} color="#666" />
            <Text style={styles.applicabilityLabel}>المنتجات:</Text>
            <Text style={styles.applicabilityValue} numberOfLines={1}>
              {getApplicableProductsText(item)}
            </Text>
          </View>
          <View style={styles.applicabilityRow}>
            <Ionicons name="folder-outline" size={14} color="#666" />
            <Text style={styles.applicabilityLabel}>الفئات:</Text>
            <Text style={styles.applicabilityValue} numberOfLines={1}>
              {getApplicableCategoriesText(item)}
            </Text>
          </View>
        </View>

        {/* Discount Details */}
        {(item.minAmount || item.maxDiscount) && (
          <View style={styles.constraintsSection}>
            {item.minAmount && (
              <Text style={styles.constraintText}>
                الحد الأدنى: {formatPrice(item.minAmount)}
              </Text>
            )}
            {item.maxDiscount && (
              <Text style={styles.constraintText}>
                أقصى خصم: {formatPrice(item.maxDiscount)}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.detailsBtn]}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text style={styles.actionText}>التفاصيل</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEditDiscount(item)}
          >
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={styles.actionText}>تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteDiscount(item)}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    const stats = getDiscountStats();
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>إحصائيات الخصومات</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>إجمالي الخصومات</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: SUCCESS }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>نشط</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: WARNING }]}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>قادم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: ERROR }]}>{stats.expired}</Text>
            <Text style={styles.statLabel}>منتهي</Text>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة الخصومات</Text>
        </View>
        <LoadingComponent 
          message="جاري تحميل الخصومات..."
          iconName="pricetag-outline"
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
          <Text style={styles.headerTitle}>إدارة الخصومات</Text>
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
        <Text style={styles.headerTitle}>إدارة الخصومات</Text>
        <View style={styles.headerActions}>
          <Text style={styles.discountCount}>
            {filteredDiscounts.length} خصم
          </Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddDiscount}
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
            placeholder="البحث في الخصومات (الاسم، الوصف، الكود، المنتجات، الفئات)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>
      </View>

      {/* Statistics */}
      {filteredDiscounts.length > 0 && renderStatsCard()}

      {/* Discounts List */}
      <FlatList
        data={filteredDiscounts}
        renderItem={renderDiscountCard}
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
          <EmptyState 
            iconName="pricetag-outline"
            title={searchQuery || filters.status !== 'all' || filters.type !== 'all' 
              ? 'لا توجد خصومات تطابق البحث' 
              : 'لا توجد خصومات'
            }
            subtitle={searchQuery || filters.status !== 'all' || filters.type !== 'all'
              ? 'جرب تغيير مصطلحات البحث أو المرشحات'
              : 'يمكنك إضافة خصومات جديدة باستخدام زر الإضافة'
            }
            onAction={searchQuery || filters.status !== 'all' || filters.type !== 'all'
              ? () => {
                  setSearchQuery('');
                  setFilters({ status: 'all', type: 'all' });
                }
              : handleAddDiscount
            }
            actionText={searchQuery || filters.status !== 'all' || filters.type !== 'all' ? 'مسح المرشحات' : 'إضافة خصم'}
          />
        }
      />

      {/* Add/Edit Discount Modal - Due to space constraints, I'll create a simplified version */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
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
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.formInput, formErrors.name && styles.inputError]}
                    placeholder="اسم الخصم *"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: undefined });
                      }
                    }}
                    placeholderTextColor="#999"
                  />
                  {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                </View>

                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="وصف الخصم"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Discount Type and Value */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>نوع الخصم وقيمته</Text>
                
                <View style={styles.discountTypeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.discountType === 'percentage' && styles.typeOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, discountType: 'percentage' })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.discountType === 'percentage' && styles.typeOptionTextSelected
                    ]}>
                      نسبة مئوية (%)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.discountType === 'fixed' && styles.typeOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.discountType === 'fixed' && styles.typeOptionTextSelected
                    ]}>
                      مبلغ ثابت (ريال)
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.formInput, formErrors.discountValue && styles.inputError]}
                    placeholder={formData.discountType === 'percentage' ? 'النسبة المئوية (1-100) *' : 'المبلغ الثابت *'}
                    value={formData.discountValue}
                    onChangeText={(text) => {
                      setFormData({ ...formData, discountValue: text });
                      if (formErrors.discountValue) {
                        setFormErrors({ ...formErrors, discountValue: undefined });
                      }
                    }}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  {formErrors.discountValue && <Text style={styles.errorText}>{formErrors.discountValue}</Text>}
                </View>
              </View>

              {/* Constraints */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>قيود الخصم</Text>
                
                <TextInput
                  style={styles.formInput}
                  placeholder="الحد الأدنى للمبلغ (اختياري)"
                  value={formData.minAmount}
                  onChangeText={(text) => setFormData({ ...formData, minAmount: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                
                {formData.discountType === 'percentage' && (
                  <TextInput
                    style={styles.formInput}
                    placeholder="أقصى مبلغ خصم (اختياري)"
                    value={formData.maxDiscount}
                    onChangeText={(text) => setFormData({ ...formData, maxDiscount: text })}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                )}
              </View>

              {/* Validity Period */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>فترة الصلاحية</Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.formInput, formErrors.startDate && styles.inputError]}
                    placeholder="تاريخ البداية (YYYY-MM-DD) *"
                    value={formData.startDate}
                    onChangeText={(text) => {
                      setFormData({ ...formData, startDate: text });
                      if (formErrors.startDate) {
                        setFormErrors({ ...formErrors, startDate: undefined });
                      }
                    }}
                    placeholderTextColor="#999"
                  />
                  {formErrors.startDate && <Text style={styles.errorText}>{formErrors.startDate}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.formInput, formErrors.endDate && styles.inputError]}
                    placeholder="تاريخ النهاية (YYYY-MM-DD) *"
                    value={formData.endDate}
                    onChangeText={(text) => {
                      setFormData({ ...formData, endDate: text });
                      if (formErrors.endDate) {
                        setFormErrors({ ...formErrors, endDate: undefined });
                      }
                    }}
                    placeholderTextColor="#999"
                  />
                  {formErrors.endDate && <Text style={styles.errorText}>{formErrors.endDate}</Text>}
                </View>
              </View>

              {/* Status */}
              <View style={styles.formSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.sectionTitle}>الخصم نشط</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                    trackColor={{ false: '#767577', true: PRIMARY }}
                    thumbColor={formData.isActive ? 'white' : '#f4f3f4'}
                  />
                </View>
                <Text style={styles.helpText}>
                  الخصومات غير النشطة لن تظهر للعملاء
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSaveDiscount}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.saveButtonText}>جاري الحفظ...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingDiscount ? 'تحديث الخصم' : 'إضافة الخصم'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetailsModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              تفاصيل الخصم
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeDetailsModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedDiscount && (
            <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
              {/* Basic Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>معلومات أساسية</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>اسم الخصم:</Text>
                  <Text style={styles.detailValue}>{selectedDiscount.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الوصف:</Text>
                  <Text style={styles.detailValue}>{selectedDiscount.description || 'لا يوجد وصف'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الكود:</Text>
                  <Text style={styles.detailValue}>{selectedDiscount.code || 'لا يوجد كود'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الحالة:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getDiscountStatusColor(selectedDiscount) }]}>
                    <Text style={styles.statusText}>{getDiscountStatusText(selectedDiscount)}</Text>
                  </View>
                </View>
              </View>

              {/* Discount Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>تفاصيل الخصم</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>نوع الخصم:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDiscount.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>قيمة الخصم:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDiscount.discountType === 'percentage' 
                      ? `${selectedDiscount.discountValue}%` 
                      : formatPrice(selectedDiscount.discountValue)
                    }
                  </Text>
                </View>
                {selectedDiscount.minAmount && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>الحد الأدنى:</Text>
                    <Text style={styles.detailValue}>{formatPrice(selectedDiscount.minAmount)}</Text>
                  </View>
                )}
                {selectedDiscount.maxDiscount && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>أقصى خصم:</Text>
                    <Text style={styles.detailValue}>{formatPrice(selectedDiscount.maxDiscount)}</Text>
                  </View>
                )}
              </View>

              {/* Validity Period */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>فترة الصلاحية</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ البداية:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedDiscount.startDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ النهاية:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedDiscount.endDate)}</Text>
                </View>
              </View>

              {/* Applicable Products */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  المنتجات المشمولة ({selectedDiscount.applicableProducts?.length || 'جميع المنتجات'})
                </Text>
                {selectedDiscount.applicableProducts && selectedDiscount.applicableProducts.length > 0 ? (
                  selectedDiscount.applicableProducts.map((product, index) => {
                    const productName = typeof product === 'string' 
                      ? products.find(p => p._id === product)?.name || 'منتج محذوف'
                      : product.name;
                    return (
                      <Text key={index} style={styles.listItem}>• {productName}</Text>
                    );
                  })
                ) : (
                  <Text style={styles.listItem}>• جميع المنتجات</Text>
                )}
              </View>

              {/* Applicable Categories */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  الفئات المشمولة ({selectedDiscount.applicableCategories?.length || 'جميع الفئات'})
                </Text>
                {selectedDiscount.applicableCategories && selectedDiscount.applicableCategories.length > 0 ? (
                  selectedDiscount.applicableCategories.map((category, index) => {
                    const categoryName = typeof category === 'string' 
                      ? categories.find(c => c._id === category)?.name || 'فئة محذوفة'
                      : category.name;
                    return (
                      <Text key={index} style={styles.listItem}>• {categoryName}</Text>
                    );
                  })
                ) : (
                  <Text style={styles.listItem}>• جميع الفئات</Text>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>مرشحات البحث</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFiltersModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Status Filter */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>حالة الخصم</Text>
              {[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' },
                { value: 'expired', label: 'منتهي الصلاحية' },
                { value: 'upcoming', label: 'قادم' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.status === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({ ...filters, status: option.value as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.status === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type Filter */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>نوع الخصم</Text>
              {[
                { value: 'all', label: 'جميع الأنواع' },
                { value: 'percentage', label: 'نسبة مئوية' },
                { value: 'fixed', label: 'مبلغ ثابت' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.type === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({ ...filters, type: option.value as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.type === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({ status: 'all', type: 'all' });
                  setShowFiltersModal(false);
                }}
              >
                <Text style={styles.clearFiltersText}>مسح المرشحات</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.applyFiltersText}>تطبيق المرشحات</Text>
              </TouchableOpacity>
            </View>
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
  discountCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
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
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  discountsList: {
    padding: 16,
    paddingTop: 0,
  },
  discountCard: {
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
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  discountBadge: {
    backgroundColor: PINK,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  discountValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountType: {
    color: 'white',
    fontSize: 10,
  },
  discountActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInfo: {
    padding: 16,
    paddingTop: 12,
  },
  discountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  inactiveText: {
    color: '#999',
  },
  discountDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountCode: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: '#666',
  },
  applicabilitySection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applicabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  applicabilityLabel: {
    fontSize: 12,
    color: '#666',
    minWidth: 50,
  },
  applicabilityValue: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  constraintsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  constraintText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  detailsBtn: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
  },
  editBtn: {
    backgroundColor: WARNING,
  },
  deleteBtn: {
    backgroundColor: ERROR,
    borderBottomRightRadius: 16,
    flex: 0.7,
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
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
    marginBottom: 16,
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
    marginTop: -12,
    marginBottom: 8,
    textAlign: 'right',
  },
  discountTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: PRIMARY,
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  typeOptionTextSelected: {
    color: 'white',
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
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterOptionSelected: {
    backgroundColor: PRIMARY,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
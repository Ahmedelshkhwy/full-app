import axios from 'axios';
import { API_BASE } from '../config/api';

const API = `${API_BASE}/products`;
const DISCOUNT_API = `${API_BASE}/discounts`;

export const getAllProducts = () => axios.get(API);

export const getProductById = (id: string) =>
  axios.get(`${API}/${id}`);

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithDiscount extends Product {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  activeDiscount?: {
    _id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
}

export interface ProductCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export interface Discount {
  _id: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// البحث في المنتجات
export const searchProducts = async (query: string) => {
  const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// جلب منتجات فئة معينة
export const getProductsByCategory = async (categoryId: string) => {
  const response = await axios.get(`${API}/category/${categoryId}`);
  return response.data;
};

// جلب جميع الفئات
export const getAllCategories = async () => {
  const response = await axios.get(`${API}/categories`);
  return response.data;
};

// جلب فئة واحدة
export const getCategoryById = async (id: string) => {
  const response = await axios.get(`${API}/categories/${id}`);
  return response.data;
};

// جلب الخصومات النشطة
export const getActiveDiscounts = async (token?: string): Promise<Discount[]> => {
  try {
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE}/discount`, { headers });
    const discounts = response.data.discounts || response.data;
    
    // تصفية الخصومات النشطة والصالحة
    const now = new Date();
    return discounts.filter((discount: Discount) => 
      discount.isActive && 
      new Date(discount.startDate) <= now && 
      new Date(discount.endDate) >= now
    );
  } catch (error) {
    console.error('Error getting active discounts:', error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};

// حساب الخصم المطبق على منتج معين
export const calculateProductDiscount = (product: Product, discounts: Discount[]): ProductWithDiscount => {
  const productWithDiscount: ProductWithDiscount = {
    ...product,
    originalPrice: product.price,
    discountedPrice: product.price,
    discountPercentage: 0,
    discountAmount: 0,
  };

  // العثور على أفضل خصم للمنتج
  let bestDiscount: Discount | null = null;
  let maxDiscountAmount = 0;

  for (const discount of discounts) {
    let isApplicable = false;

    // التحقق من انطباق الخصم على المنتج
    if (discount.applicableProducts && discount.applicableProducts.length > 0) {
      // خصم مطبق على منتجات محددة
      isApplicable = discount.applicableProducts.includes(product._id);
    } else if (discount.applicableCategories && discount.applicableCategories.length > 0) {
      // خصم مطبق على فئات محددة
      const categoryId = typeof product.category === 'string' ? product.category : product.category._id;
      isApplicable = discount.applicableCategories.includes(categoryId);
    } else {
      // خصم عام على جميع المنتجات
      isApplicable = true;
    }

    if (isApplicable) {
      let discountAmount = 0;

      if (discount.discountType === 'percentage') {
        discountAmount = (product.price * discount.discountValue) / 100;
        // تطبيق حد أقصى للخصم إذا كان محدد
        if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
          discountAmount = discount.maxDiscount;
        }
      } else if (discount.discountType === 'fixed') {
        discountAmount = Math.min(discount.discountValue, product.price);
      }        // التحقق من الحد الأدنى للمبلغ
        if (discount.minAmount && product.price < discount.minAmount) {
          continue;
        }

      // اختيار أفضل خصم (الأكبر في المبلغ)
      if (discountAmount > maxDiscountAmount) {
        maxDiscountAmount = discountAmount;
        bestDiscount = discount;
      }
    }
  }

  // تطبيق أفضل خصم
  if (bestDiscount && maxDiscountAmount > 0) {
    productWithDiscount.discountedPrice = product.price - maxDiscountAmount;
    productWithDiscount.discountAmount = maxDiscountAmount;
    productWithDiscount.discountPercentage = Math.round((maxDiscountAmount / product.price) * 100);
    productWithDiscount.activeDiscount = {
      _id: bestDiscount._id,
      name: bestDiscount.name,
      discountType: bestDiscount.discountType,
      discountValue: bestDiscount.discountValue,
    };
  }

  return productWithDiscount;
};

// جلب المنتجات مع حساب الخصومات
export const getProductsWithDiscounts = async (token?: string): Promise<ProductWithDiscount[]> => {
  try {
    const [productsResponse, discounts] = await Promise.all([
      getAllProducts(),
      getActiveDiscounts(token),
    ]);

    const products = productsResponse.data.products || productsResponse.data;
    return products.map((product: Product) => calculateProductDiscount(product, discounts));
  } catch (error) {
    console.error('Error getting products with discounts:', error);
    // في حالة الخطأ، إرجاع المنتجات بدون خصومات
    try {
      const productsResponse = await getAllProducts();
      const products = productsResponse.data.products || productsResponse.data;
      return products.map((product: Product) => ({
        ...product,
        originalPrice: product.price,
        discountedPrice: product.price,
        discountPercentage: 0,
        discountAmount: 0,
      }));
    } catch {
      return [];
    }
  }
};

// جلب المنتجات التي عليها خصومات فقط
export const getDiscountedProducts = async (token?: string): Promise<ProductWithDiscount[]> => {
  const productsWithDiscounts = await getProductsWithDiscounts(token);
  return productsWithDiscounts.filter(product => 
    product.discountAmount && product.discountAmount > 0
  );
};
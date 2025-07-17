import axios, { AxiosError } from 'axios';
import { getAPIUrl } from '../config/api.config';

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    _id: string;
    name: string;
    description?: string;
  } | string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: Array<{
    productId: Product | string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error handling
export class AdminServiceError extends Error {
  public statusCode: number;
  public originalError?: Error;

  constructor(message: string, statusCode: number = 500, originalError?: Error) {
    super(message);
    this.name = 'AdminServiceError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const statusCode = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 
                   axiosError.response?.data?.error || 
                   axiosError.message || 
                   'حدث خطأ في الشبكة';
    throw new AdminServiceError(message, statusCode, axiosError);
  }
  
  if (error instanceof Error) {
    throw new AdminServiceError(error.message, 500, error);
  }
  
  throw new AdminServiceError('حدث خطأ غير متوقع', 500);
};

// Create axios instance with default config
const createApiClient = (token: string) => {
  return axios.create({
    baseURL: getAPIUrl('/admin'),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
  });
};

// Admin Service
export class AdminService {
  private api: ReturnType<typeof createApiClient>;

  constructor(token: string) {
    if (!token) {
      throw new AdminServiceError('لا يوجد رمز مصادقة', 401);
    }
    this.api = createApiClient(token);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get<{ stats: DashboardStats }>('/dashboard/stats');
      return response.data.stats;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.api.get<Product[]>('/products');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleApiError(error);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await this.api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await this.api.post<Product>('/products', productData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateProduct(id: string, productData: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    try {
      const response = await this.api.put<Product>(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete<{ message: string }>(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    try {
      const response = await this.api.patch<Product>(`/products/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.api.get<{ categories: Category[] }>('/categories');
      return Array.isArray(response.data.categories) ? response.data.categories : [];
    } catch (error) {
      handleApiError(error);
    }
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const response = await this.api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const response = await this.api.post<{ category: Category }>('/categories', categoryData);
      return response.data.category;
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateCategory(id: string, categoryData: Partial<Omit<Category, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    try {
      const response = await this.api.put<{ category: Category }>(`/categories/${id}`, categoryData);
      return response.data.category;
    } catch (error) {
      handleApiError(error);
    }
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete<{ message: string }>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<User[]>('/users');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleApiError(error);
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = await this.api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateUser(id: string, userData: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
      const response = await this.api.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete<{ message: string }>(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    try {
      const response = await this.api.patch<User>(`/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get<Order[]>('/orders');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleApiError(error);
    }
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const response = await this.api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateOrderStatus(id: string, orderStatus: Order['orderStatus']): Promise<Order> {
    try {
      const response = await this.api.patch<{ order: Order }>(`/orders/${id}/status`, { orderStatus });
      return response.data.order;
    } catch (error) {
      handleApiError(error);
    }
  }

  async updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<Order> {
    try {
      const response = await this.api.patch<{ order: Order }>(`/orders/${id}/payment`, { paymentStatus });
      return response.data.order;
    } catch (error) {
      handleApiError(error);
    }
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete<{ message: string }>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Image upload utility
  async uploadImage(imageUri: string): Promise<string> {
    try {
      // Convert local image to base64 if needed
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      return imageUri;
    } catch (error) {
      throw new AdminServiceError('فشل في معالجة الصورة', 400, error as Error);
    }
  }

  // Validation helpers
  validateProductData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('اسم المنتج مطلوب');
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('وصف المنتج مطلوب');
    }

    if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
      errors.push('السعر يجب أن يكون رقم صحيح أكبر من صفر');
    }

    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
      errors.push('يرجى اختيار فئة للمنتج');
    }

    if (data.stock === undefined || data.stock === null || isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
      errors.push('المخزون يجب أن يكون رقم صحيح أكبر من أو يساوي صفر');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCategoryData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('اسم الفئة مطلوب');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Utility functions
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  });
};

export const getStockStatus = (stock: number) => {
  if (stock === 0) return { color: '#F44336', text: 'نفذ المخزون', icon: 'alert-circle' as const };
  if (stock < 10) return { color: '#FF9800', text: 'مخزون منخفض', icon: 'warning' as const };
  return { color: '#4CAF50', text: 'متوفر', icon: 'checkmark-circle' as const };
};

export const getCategoryName = (category: Product['category']): string => {
  if (typeof category === 'string') return category;
  return category?.name || 'غير محدد';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-SA');
};

// React hook for admin service
export const useAdminService = (token: string | null) => {
  if (!token) {
    throw new AdminServiceError('لا يوجد رمز مصادقة', 401);
  }
  return new AdminService(token);
};

export default AdminService;
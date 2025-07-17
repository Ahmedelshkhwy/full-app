import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../config/axios';

export class DiscountService {
  
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // إنشاء خصم جديد
  async createDiscount(discountData: any) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('لا يوجد توكن مصادقة');
      }

      console.log('Creating discount with data:', discountData);

      const formattedData = {
        ...discountData,
        applicableProducts: Array.isArray(discountData.applicableProducts) 
          ? discountData.applicableProducts.filter((id: string) => id && id !== 'Ex' && id.length === 24)
          : [],
        applicableCategories: Array.isArray(discountData.applicableCategories) 
          ? discountData.applicableCategories.filter((id: string) => id && id !== 'Ex' && id.length === 24)
          : []
      };

      const response = await apiClient.post('/admin/discounts', formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  // جلب جميع الخصومات
  async getDiscounts() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('لا يوجد توكن مصادقة');
      }

      const response = await apiClient.get('/admin/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  }

  // إضافة دالة جلب المنتجات
  async getProducts() {
    try {
      console.log('Fetching products from service...');
      
      const response = await apiClient.get('/products');
      
      console.log('Products response status:', response.status);
      console.log('Products service result:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching products in service:', error);
      throw error;
    }
  }

  // إضافة دالة جلب الفئات
  async getCategories() {
    try {
      const token = await this.getToken();
      
      console.log('Fetching categories from service...');
      
      const response = await apiClient.get('/categories', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      console.log('Categories response status:', response.status);
      console.log('Categories service result:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching categories in service:', error);
      throw error;
    }
  }

  // تحديث خصم
  async updateDiscount(discountId: string, discountData: any) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('لا يوجد توكن مصادقة');
      }

      const formattedData = {
        ...discountData,
        applicableProducts: Array.isArray(discountData.applicableProducts) 
          ? discountData.applicableProducts.filter((id: string) => id && id !== 'Ex' && id.length === 24)
          : [],
        applicableCategories: Array.isArray(discountData.applicableCategories) 
          ? discountData.applicableCategories.filter((id: string) => id && id !== 'Ex' && id.length === 24)
          : []
      };

      const response = await apiClient.put(`/admin/discounts/${discountId}`, formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  }

  // باقي الدوال...
  async applyDiscount(code: string, orderAmount: number) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('لا يوجد توكن مصادقة');
      }

      const response = await apiClient.post('/discount/apply', 
        { code, orderAmount },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }
}

export const discountService = new DiscountService();
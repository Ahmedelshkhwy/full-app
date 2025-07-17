// Updated types to match OpenAPI specification

export interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  addresses?: Address[];
  role: 'user' | 'admin' | 'pharmacist' | 'delivery' | 'accountant';
  isVerified: boolean;
  profileImage?: string;
  favorites?: string[];
  cart?: CartItem[];
  orderHistory?: string[];
  notificationToken?: string;
  deviceInfo?: object;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  label: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  details?: string;
}

export interface Product {
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
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price?: number;
  product?: Product;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash' | 'card' | 'stcpay';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  discountCode?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  zipCode: string;
  phone: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'stcpay' | 'creditcard';
  paymentIntentId?: string;
  paymentMethodId?: string;
  transactionId?: string;
  gatewayResponse?: object;
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: object;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  _id: string;
  name: string;
  description?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  savings: number;
  type: 'product' | 'category' | 'general';
  product?: Product;
  category?: Category;
  discount?: {
    _id: string;
    code: string;
    type: string;
    value: number;
    startDate: string;
    endDate: string;
  };
}

export interface OTP {
  _id: string;
  email: string;
  phone?: string;
  code: string;
  type: 'register' | 'reset-password';
  expiresAt: string;
  isUsed: boolean;
  userData?: object;
  createdAt: string;
}

// Authentication Types
export interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<{ otpId: string }>;
  verifyOTP: (otpId: string, code: string) => Promise<void>;
  sendOTP: (email: string, type: 'register' | 'reset-password') => Promise<{ otpId: string }>;
  resetPassword: (otpId: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  role?: 'user' | 'admin' | 'pharmacist' | 'delivery' | 'accountant';
}

export interface LoginData {
  email: string;
  password: string;
}

// API Response Types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface OTPResponse {
  message: string;
  otpId: string;
}

export interface OTPVerificationRequest {
  otpId: string;
  code: string;
}

export interface OTPVerificationResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface OTPSendRequest {
  email: string;
  phone?: string;
  userData?: UserRegistrationData;
}

export interface ResetPasswordRequest {
  otpId: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Product Types
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  stock?: number;
  isActive?: boolean;
}

export interface CategoryInput {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

// Cart Types
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

// Order Types
export interface OrderInput {
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'stcpay';
  shippingAddress: ShippingAddress;
  discountCode?: string;
}

export interface PlaceOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash' | 'card' | 'stcpay';
  discountCode?: string;
}

// Payment Types
export interface PaymentInput {
  orderId: string;
  amount: number;
  currency?: 'SAR' | 'USD' | 'EUR';
  paymentMethod: 'cash' | 'card' | 'stcpay' | 'creditcard';
  metadata?: object;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
}

// Discount Types
export interface DiscountInput {
  name: string;
  description?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface ApplyDiscountRequest {
  code: string;
  orderAmount: number;
}

export interface ApplyDiscountResponse {
  success: boolean;
  discount: {
    code: string;
    name: string;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
  };
}

// Admin Types
export interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
}

// Accounting Types
export interface AccountingDashboard {
  success: boolean;
  dashboard: {
    monthlyStats: {
      totalRevenue: number;
      totalOrders: number;
      totalDiscounts: number;
      avgOrderValue: number;
    };
    recentOrders: Order[];
    topProducts: {
      productName: string;
      totalSold: number;
      totalRevenue: number;
    }[];
  };
}

export interface SalesStats {
  success: boolean;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  salesByPeriod: {
    _id: string;
    totalSales: number;
    totalOrders: number;
    totalDiscount: number;
    avgOrderValue: number;
  }[];
  totalStats: {
    totalRevenue: number;
    totalOrders: number;
    totalDiscounts: number;
    avgOrderValue: number;
  };
}

export interface ProductSales {
  success: boolean;
  productSales: {
    productName: string;
    category: string;
    totalQuantitySold: number;
    totalRevenue: number;
    totalOrders: number;
    avgPrice: number;
  }[];
}

export interface CategorySales {
  success: boolean;
  categorySales: {
    categoryName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    totalOrders: number;
    avgPrice: number;
  }[];
}

export interface DiscountUsage {
  success: boolean;
  discountUsage: {
    discountCode: string;
    usageCount: number;
    totalDiscountAmount: number;
    totalOrderValue: number;
    avgDiscountAmount: number;
    discountName: string;
    discountType: string;
  }[];
  stats: {
    totalOrdersWithDiscount: number;
    totalOrdersWithoutDiscount: number;
    totalDiscountAmount: number;
    totalRevenue: number;
  };
}

export interface CustomerReport {
  success: boolean;
  customers: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    totalDiscountUsed: number;
    firstOrder: string;
    lastOrder: string;
    customerValue: 'VIP' | 'Gold' | 'Silver' | 'Bronze';
  }[];
  generalStats: {
    totalCustomers: number;
    totalAdmins: number;
    totalAccountants: number;
    totalRegularUsers: number;
  };
}

export interface ProfitLossReport {
  success: boolean;
  report: {
    totalRevenue: number;
    estimatedCost: number;
    grossProfit: number;
    totalDiscounts: number;
    netProfit: number;
    profitMargin: number;
    totalOrders: number;
  };
  note: string;
}

// Error Types
export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: object;
}

// Health Check
export interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  environment: string;
}
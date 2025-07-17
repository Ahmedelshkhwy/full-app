import mongoose from 'mongoose';
export interface Address {
    label: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    details?: string;
}
export interface IUser {
    username: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    addresses?: Address[];
    role: 'user' | 'admin' | 'pharmacist' | 'delivery';
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IProduct {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId;
    image?: string;
    stock: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICartItem {
    productId: mongoose.Types.ObjectId | IProduct;
    quantity: number;
    price?: number;
    totalPrice?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICart {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    totalItems?: number;
    totalPrice?: number;
    totalQuantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IOrderItem {
    productId: mongoose.Types.ObjectId | IProduct;
    quantity: number;
    price: number;
}
export interface IOrder {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'stcpay';
    paymentStatus: 'pending' | 'paid' | 'failed';
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
    };
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    discountCode?: string;
    discountAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICategory {
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IPaymentRequest {
    amount: number;
    currency: string;
    paymentMethod: 'cash' | 'visa';
    description?: string;
    metadata?: Record<string, any>;
    successUrl?: string;
    total: number;
}
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IRegisterRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
}
export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

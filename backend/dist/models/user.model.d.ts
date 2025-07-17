import mongoose, { Document } from 'mongoose';
interface Address {
    label: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    details?: string;
}
interface CartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}
export interface IUser extends Document {
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
    role: 'user' | 'admin' | 'pharmacist' | 'delivery' | 'accountant';
    isVerified: boolean;
    profileImage?: string;
    favorites: mongoose.Types.ObjectId[];
    cart: CartItem[];
    orderHistory: mongoose.Types.ObjectId[];
    notificationToken?: string;
    deviceInfo?: object;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

import mongoose, { Document, Schema } from 'mongoose';

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
  location?: { lat: number; lng: number };
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

const addressSchema = new Schema<Address>(
  {
    label: String,
    address: String,
    location: {
      lat: Number,
      lng: Number,
    },
    details: String,
  },
  { _id: false }
);

const cartItemSchema = new Schema<CartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    phone:    { type: String, required: true },
    password: { type: String, required: true },
    address:  { type: String },
    location: { lat: Number, lng: Number },
    addresses: [addressSchema],
    role: { type: String, enum: ['user', 'admin', 'pharmacist', 'delivery', 'accountant'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
    orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    notificationToken: { type: String },
    deviceInfo: { type: Object },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);

import mongoose, { Document, } from 'mongoose';
export interface IOrderItem {
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
  price: number;
}
export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: string;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}


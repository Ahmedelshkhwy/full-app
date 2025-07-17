import mongoose, { Document, } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
}
export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}


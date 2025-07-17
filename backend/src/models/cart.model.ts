// backend/models/cart.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ICartItem } from '../types/models';



export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number },
});

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICart>('Cart', CartSchema);


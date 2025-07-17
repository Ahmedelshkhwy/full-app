import mongoose, { Document } from 'mongoose';
import { ICartItem } from '../types/models';
export interface ICart extends Document {
    user: mongoose.Schema.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart> & ICart & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

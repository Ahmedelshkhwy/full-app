import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    category: mongoose.Schema.Types.ObjectId;
    image?: string;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct> & IProduct & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

import mongoose, { Document } from 'mongoose';
export interface IDiscount extends Document {
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minAmount?: number;
    maxDiscount?: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    code?: string;
    applicableProducts?: mongoose.Schema.Types.ObjectId[];
    applicableCategories?: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDiscount, {}, {}, {}, mongoose.Document<unknown, {}, IDiscount> & IDiscount & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

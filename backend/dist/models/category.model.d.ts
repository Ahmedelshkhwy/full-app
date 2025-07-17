import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory> & ICategory & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

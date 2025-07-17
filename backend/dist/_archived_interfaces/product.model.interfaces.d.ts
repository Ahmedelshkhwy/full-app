import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    category: mongoose.Schema.Types.ObjectId;
    image?: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

import mongoose, { Document } from 'mongoose';
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
    paymentMethod: 'cash' | 'card' | 'stcpay';
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
    };
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    discountCode?: string;
    discountAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder> & IOrder & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

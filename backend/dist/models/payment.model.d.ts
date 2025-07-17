import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    orderId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    paymentMethod: 'cash' | 'card' | 'stcpay' | 'creditcard';
    paymentIntentId?: string;
    paymentMethodId?: string;
    transactionId?: string;
    gatewayResponse?: any;
    failureReason?: string;
    refundAmount?: number;
    refundReason?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment> & IPayment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;

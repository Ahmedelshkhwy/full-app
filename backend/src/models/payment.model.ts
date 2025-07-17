import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'stcpay' | 'creditcard';
  paymentIntentId?: string; // معرف نية الدفع من gateway
  paymentMethodId?: string; // معرف طريقة الدفع
  transactionId?: string; // معرف المعاملة من payment gateway
  gatewayResponse?: any; // استجابة كاملة من payment gateway
  failureReason?: string; // سبب فشل الدفع
  refundAmount?: number; // مبلغ الاسترداد
  refundReason?: string; // سبب الاسترداد
  metadata?: Record<string, any>; // بيانات إضافية
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      enum: ['SAR', 'USD', 'EUR'],
      default: 'SAR'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'stcpay', 'creditcard'],
      required: true
    },
    paymentIntentId: {
      type: String,
      sparse: true, // يسمح بقيم null متعددة
      index: true
    },
    paymentMethodId: {
      type: String,
      sparse: true
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true
    },
    gatewayResponse: {
      type: Schema.Types.Mixed
    },
    failureReason: {
      type: String
    },
    refundAmount: {
      type: Number,
      min: 0
    },
    refundReason: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Index مركب للبحث السريع
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ transactionId: 1, status: 1 });

// Middleware لتحديث حالة الطلب عند تغير حالة الدفع
PaymentSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    try {
      const Order = mongoose.model('Order');
      const paymentStatus = 
        this['status'] === 'completed' ? 'paid' :
        this['status'] === 'failed' || this['status'] === 'cancelled' ? 'failed' :
        'pending';
      
      await Order.findByIdAndUpdate(this['orderId'], {
        paymentStatus: paymentStatus
      });
    } catch (error) {
      console.error('Error updating order payment status:', error);
    }
  }
  next();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);

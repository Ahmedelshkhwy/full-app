import mongoose, { Schema, Document } from 'mongoose';

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

const DiscountSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    code: { type: String, unique: true, sparse: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  {
    timestamps: true,
  }
);

// التحقق من أن تاريخ النهاية أكبر من تاريخ البداية
DiscountSchema.pre('save', function(next) {
  if (this['startDate'] >= this['endDate']) {
    return next(new Error('تاريخ النهاية يجب أن يكون أكبر من تاريخ البداية'));
  }
  next();
});

// التحقق من أن قيمة الخصم المئوية لا تتجاوز 100%
DiscountSchema.pre('save', function(next) {
  if (this['discountType'] === 'percentage' && this['discountValue'] > 100) {
    return next(new Error('نسبة الخصم لا يمكن أن تتجاوز 100%'));
  }
  next();
});

// إنشاء كود تلقائي إذا لم يكن موجوداً
DiscountSchema.pre('save', function(next) {
  if (!this['code']) {
    this['code'] = this['name'].replace(/\s+/g, '').toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

export default mongoose.model<IDiscount>('Discount', DiscountSchema); 
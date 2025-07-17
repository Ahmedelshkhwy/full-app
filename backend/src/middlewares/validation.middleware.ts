import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * التحقق من صحة معرف MongoDB
 */
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * التحقق من صحة الرقم الموجب
 */
const isPositiveNumber = (value: any): boolean => {
  return typeof value === 'number' && value > 0;
};

/**
 * التحقق من صحة العملة
 */
const isValidCurrency = (currency: string): boolean => {
  const validCurrencies = ['SAR', 'USD', 'EUR'];
  return validCurrencies.includes(currency);
};

/**
 * التحقق من بيانات طلب الدفع
 */
export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { orderId, amount, currency } = req.body;
  const errors: string[] = [];

  // التحقق من معرف الطلب
  if (!orderId || !isValidObjectId(orderId)) {
    errors.push('معرف الطلب غير صحيح');
  }

  // التحقق من المبلغ
  if (!amount || !isPositiveNumber(amount)) {
    errors.push('المبلغ يجب أن يكون رقماً موجباً');
  }

  // التحقق من العملة
  if (!currency || !isValidCurrency(currency)) {
    errors.push('العملة غير مدعومة');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors
    });
    return;
  }

  next();
};

/**
 * التحقق من بيانات تأكيد الدفع
 */
export const validatePaymentConfirmation = (req: Request, res: Response, next: NextFunction): void => {
  const { paymentIntentId, paymentMethodId } = req.body;
  const errors: string[] = [];

  if (!paymentIntentId || typeof paymentIntentId !== 'string' || paymentIntentId.trim() === '') {
    errors.push('معرف نية الدفع مطلوب');
  }

  if (!paymentMethodId || typeof paymentMethodId !== 'string' || paymentMethodId.trim() === '') {
    errors.push('معرف طريقة الدفع مطلوب');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors
    });
    return;
  }

  next();
};

/**
 * التحقق من معرف الدفع في المسار
 */
export const validatePaymentId = (req: Request, res: Response, next: NextFunction): void => {
  const { paymentId } = req.params;

  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'معرف الدفع مطلوب'
    });
    return;
  }

  next();
};

/**
 * التحقق من بيانات الاسترداد
 */
export const validateRefundRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { paymentId, amount, reason } = req.body;
  const errors: string[] = [];

  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    errors.push('معرف الدفع مطلوب');
  }

  if (amount !== undefined && !isPositiveNumber(amount)) {
    errors.push('مبلغ الاسترداد يجب أن يكون رقماً موجباً');
  }

  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
    errors.push('سبب الاسترداد لا يجب أن يتجاوز 500 حرف');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors
    });
    return;
  }

  next();
};

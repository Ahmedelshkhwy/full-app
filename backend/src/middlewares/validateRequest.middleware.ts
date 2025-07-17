import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler.middleware';

// Validation helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
  return phoneRegex.test(phone);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

// Generic validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new CustomError(error.details[0].message, 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Registration validation
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, phone } = req.body;
    const errors: string[] = [];

    // Username validation
    if (!username || username.length < 3) {
      errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
    }

    // Email validation
    if (!email || !isValidEmail(email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }

    // Password validation
    if (!password || !isValidPassword(password)) {
      errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    // Phone validation
    if (!phone || !isValidPhone(phone)) {
      errors.push('رقم الجوال غير صحيح');
    }

    if (errors.length > 0) {
      throw new CustomError(errors.join(', '), 400);
    }

    // Sanitize inputs
    req.body.username = sanitizeString(username);
    req.body.email = email.toLowerCase().trim();
    req.body.phone = phone.trim();

    next();
  } catch (error) {
    next(error);
  }
};

// Login validation
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email || !isValidEmail(email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }

    if (!password) {
      errors.push('كلمة المرور مطلوبة');
    }

    if (errors.length > 0) {
      throw new CustomError(errors.join(', '), 400);
    }

    // Sanitize email
    req.body.email = email.toLowerCase().trim();

    next();
  } catch (error) {
    next(error);
  }
};

// Product validation
export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, category, stock } = req.body;
    const errors: string[] = [];

    if (!name || name.length < 2) {
      errors.push('اسم المنتج يجب أن يكون حرفين على الأقل');
    }

    if (!price || price <= 0) {
      errors.push('السعر يجب أن يكون رقماً موجباً');
    }

    if (!category) {
      errors.push('الفئة مطلوبة');
    }

    if (stock !== undefined && stock < 0) {
      errors.push('المخزون يجب أن يكون رقماً موجباً');
    }

    if (errors.length > 0) {
      throw new CustomError(errors.join(', '), 400);
    }

    // Sanitize name
    req.body.name = sanitizeString(name);

    next();
  } catch (error) {
    next(error);
  }
};

// Order validation
export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const errors: string[] = [];

    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('المنتجات مطلوبة');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      errors.push('عنوان التوصيل مطلوب');
    }

    if (!paymentMethod || !['cash', 'card', 'stcpay'].includes(paymentMethod)) {
      errors.push('طريقة الدفع غير صحيحة');
    }

    if (errors.length > 0) {
      throw new CustomError(errors.join(', '), 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

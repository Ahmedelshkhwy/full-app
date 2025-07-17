import { Request, Response, NextFunction } from 'express';

// التحقق من أن المستخدم محاسب أو مدير
export const isAccountantOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
    }

    if (user.role !== 'accountant' && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'غير مصرح لك بالوصول - صلاحيات المحاسبة مطلوبة' 
      });
    }

    return next();
  } catch (error) {
    console.error('Error in isAccountantOrAdmin middleware:', error);
    return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
  }
};

// التحقق من أن المستخدم محاسب فقط
export const isAccountant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
    }

    if (user.role !== 'accountant') {
      return res.status(403).json({ 
        message: 'غير مصرح لك بالوصول - صلاحيات المحاسبة مطلوبة' 
      });
    }

    return next();
  } catch (error) {
    console.error('Error in isAccountant middleware:', error);
    return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
  }
};

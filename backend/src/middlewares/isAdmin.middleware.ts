import { Request, Response, NextFunction } from 'express';

// التحقق من أن المستخدم مدير
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'غير مصرح لك بالوصول - صلاحيات المدير مطلوبة' 
      });
    }

    return next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
  }
};

// التحقق من أن المستخدم مدير أو محاسب
export const isAdminOrAccountant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
    }

    if (user.role !== 'admin' && user.role !== 'accountant') {
      return res.status(403).json({ 
        message: 'غير مصرح لك بالوصول - صلاحيات المدير أو المحاسب مطلوبة' 
      });
    }

    return next();
  } catch (error) {
    console.error('Error in isAdminOrAccountant middleware:', error);
    return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
  }
};

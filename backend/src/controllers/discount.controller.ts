import { Request, Response } from 'express';
import Discount from '../models/discount.model';

// جلب جميع الخصومات المتاحة
export const getAvailableDiscounts = async (_req: Request, res: Response) => {
  try {
    // جلب الخصومات المفعلة والصالحة
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    return res.json({ discounts });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب الخصومات' });
  }
};

// تطبيق خصم على طلب
export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'كود الخصم ومبلغ الطلب مطلوبان' });
    }

    // البحث عن الخصم
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!discount) {
      return res.status(404).json({ message: 'كود الخصم غير صالح أو منتهي الصلاحية' });
    }

    // التحقق من الحد الأدنى للطلب
    if (discount.minAmount && orderAmount < discount.minAmount) {
      return res.status(400).json({ 
        message: `يجب أن يكون مبلغ الطلب ${discount.minAmount} ريال على الأقل` 
      });
    }

    // يمكن إضافة فحص عدد مرات الاستخدام لاحقاً إذا تم إضافته للنموذج
    // if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    //   return res.status(400).json({ message: 'انتهت مرات استخدام هذا الكود' });
    // }

    // حساب قيمة الخصم
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (orderAmount * discount.discountValue) / 100;
      // تطبيق الحد الأقصى للخصم إذا كان موجوداً
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      // خصم ثابت
      discountAmount = Math.min(discount.discountValue, orderAmount);
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return res.json({
      success: true,
      discount: {
        code: discount.code,
        name: discount.name,
        discountAmount: Math.round(discountAmount * 100) / 100,
        originalAmount: orderAmount,
        finalAmount: Math.round(finalAmount * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تطبيق الخصم' });
  }
};

// إنشاء خصم جديد (للمدراء فقط)
export const createDiscount = async (req: Request, res: Response) => {
  try {
    // التحقق من أن المستخدم مدير
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const { 
      name, 
      code, 
      description, 
      discountType, 
      discountValue, 
      maxDiscount,
      minAmount,
      startDate,
      endDate,
      applicableProducts,
      applicableCategories
    } = req.body;

    // التحقق من وجود كود مشابه
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({ message: 'كود الخصم مستخدم بالفعل' });
    }

    const discount = await Discount.create({
      name,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicableProducts,
      applicableCategories,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الخصم بنجاح',
      discount
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الخصم' });
  }
};

// تحديث خصم (للمدراء فقط)
export const updateDiscount = async (req: Request, res: Response) => {
  try {
    // التحقق من أن المستخدم مدير
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // إذا كان يحدث الكود، تحقق من عدم وجوده
    if (updateData.code) {
      const existingDiscount = await Discount.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDiscount) {
        return res.status(400).json({ message: 'كود الخصم مستخدم بالفعل' });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    const discount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }

    return res.json({
      success: true,
      message: 'تم تحديث الخصم بنجاح',
      discount
    });
  } catch (error) {
    console.error('Error updating discount:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الخصم' });
  }
};

// حذف خصم (للمدراء فقط)
export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    // التحقق من أن المستخدم مدير
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const { id } = req.params;

    const discount = await Discount.findByIdAndDelete(id);
    
    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }

    return res.json({
      success: true,
      message: 'تم حذف الخصم بنجاح'
    });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء حذف الخصم' });
  }
};

// جلب جميع الخصومات (للمدراء فقط)
export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    // التحقق من أن المستخدم مدير
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const discounts = await Discount.find()
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      discounts
    });
  } catch (error) {
    console.error('Error fetching all discounts:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب الخصومات' });
  }
};

// تفعيل/إلغاء تفعيل خصم (للمدراء فقط)
export const toggleDiscountStatus = async (req: Request, res: Response) => {
  try {
    // التحقق من أن المستخدم مدير
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const { id } = req.params;

    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    return res.json({
      success: true,
      message: `تم ${discount.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الخصم بنجاح`,
      discount
    });
  } catch (error) {
    console.error('Error toggling discount status:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تغيير حالة الخصم' });
  }
};

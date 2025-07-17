"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDiscountStatus = exports.getAllDiscounts = exports.deleteDiscount = exports.updateDiscount = exports.createDiscount = exports.applyDiscount = exports.getAvailableDiscounts = void 0;
const discount_model_1 = __importDefault(require("../models/discount.model"));
// جلب جميع الخصومات المتاحة
const getAvailableDiscounts = async (_req, res) => {
    try {
        // جلب الخصومات المفعلة والصالحة
        const discounts = await discount_model_1.default.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).sort({ createdAt: -1 });
        return res.json({ discounts });
    }
    catch (error) {
        console.error('Error fetching discounts:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب الخصومات' });
    }
};
exports.getAvailableDiscounts = getAvailableDiscounts;
// تطبيق خصم على طلب
const applyDiscount = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code || !orderAmount) {
            return res.status(400).json({ message: 'كود الخصم ومبلغ الطلب مطلوبان' });
        }
        // البحث عن الخصم
        const discount = await discount_model_1.default.findOne({
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
        }
        else {
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
    }
    catch (error) {
        console.error('Error applying discount:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء تطبيق الخصم' });
    }
};
exports.applyDiscount = applyDiscount;
// إنشاء خصم جديد (للمدراء فقط)
const createDiscount = async (req, res) => {
    try {
        // التحقق من أن المستخدم مدير
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
        }
        const { name, code, description, discountType, discountValue, maxDiscount, minAmount, startDate, endDate, applicableProducts, applicableCategories } = req.body;
        // التحقق من وجود كود مشابه
        const existingDiscount = await discount_model_1.default.findOne({ code: code.toUpperCase() });
        if (existingDiscount) {
            return res.status(400).json({ message: 'كود الخصم مستخدم بالفعل' });
        }
        const discount = await discount_model_1.default.create({
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
    }
    catch (error) {
        console.error('Error creating discount:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الخصم' });
    }
};
exports.createDiscount = createDiscount;
// تحديث خصم (للمدراء فقط)
const updateDiscount = async (req, res) => {
    try {
        // التحقق من أن المستخدم مدير
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
        }
        const { id } = req.params;
        const updateData = req.body;
        // إذا كان يحدث الكود، تحقق من عدم وجوده
        if (updateData.code) {
            const existingDiscount = await discount_model_1.default.findOne({
                code: updateData.code.toUpperCase(),
                _id: { $ne: id }
            });
            if (existingDiscount) {
                return res.status(400).json({ message: 'كود الخصم مستخدم بالفعل' });
            }
            updateData.code = updateData.code.toUpperCase();
        }
        const discount = await discount_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!discount) {
            return res.status(404).json({ message: 'الخصم غير موجود' });
        }
        return res.json({
            success: true,
            message: 'تم تحديث الخصم بنجاح',
            discount
        });
    }
    catch (error) {
        console.error('Error updating discount:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الخصم' });
    }
};
exports.updateDiscount = updateDiscount;
// حذف خصم (للمدراء فقط)
const deleteDiscount = async (req, res) => {
    try {
        // التحقق من أن المستخدم مدير
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
        }
        const { id } = req.params;
        const discount = await discount_model_1.default.findByIdAndDelete(id);
        if (!discount) {
            return res.status(404).json({ message: 'الخصم غير موجود' });
        }
        return res.json({
            success: true,
            message: 'تم حذف الخصم بنجاح'
        });
    }
    catch (error) {
        console.error('Error deleting discount:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء حذف الخصم' });
    }
};
exports.deleteDiscount = deleteDiscount;
// جلب جميع الخصومات (للمدراء فقط)
const getAllDiscounts = async (req, res) => {
    try {
        // التحقق من أن المستخدم مدير
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
        }
        const discounts = await discount_model_1.default.find()
            .populate('applicableProducts', 'name price')
            .populate('applicableCategories', 'name')
            .sort({ createdAt: -1 });
        return res.json({
            success: true,
            discounts
        });
    }
    catch (error) {
        console.error('Error fetching all discounts:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب الخصومات' });
    }
};
exports.getAllDiscounts = getAllDiscounts;
// تفعيل/إلغاء تفعيل خصم (للمدراء فقط)
const toggleDiscountStatus = async (req, res) => {
    try {
        // التحقق من أن المستخدم مدير
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
        }
        const { id } = req.params;
        const discount = await discount_model_1.default.findById(id);
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
    }
    catch (error) {
        console.error('Error toggling discount status:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء تغيير حالة الخصم' });
    }
};
exports.toggleDiscountStatus = toggleDiscountStatus;
//# sourceMappingURL=discount.controller.js.map
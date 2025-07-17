"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAccountant = exports.isAccountantOrAdmin = void 0;
// التحقق من أن المستخدم محاسب أو مدير
const isAccountantOrAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
        }
        if (user.role !== 'accountant' && user.role !== 'admin') {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول - صلاحيات المحاسبة مطلوبة'
            });
        }
        return next();
    }
    catch (error) {
        console.error('Error in isAccountantOrAdmin middleware:', error);
        return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
    }
};
exports.isAccountantOrAdmin = isAccountantOrAdmin;
// التحقق من أن المستخدم محاسب فقط
const isAccountant = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
        }
        if (user.role !== 'accountant') {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول - صلاحيات المحاسبة مطلوبة'
            });
        }
        return next();
    }
    catch (error) {
        console.error('Error in isAccountant middleware:', error);
        return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
    }
};
exports.isAccountant = isAccountant;
//# sourceMappingURL=isAccountant.middleware.js.map
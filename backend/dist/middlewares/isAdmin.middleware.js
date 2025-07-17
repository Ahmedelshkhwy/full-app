"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrAccountant = exports.isAdmin = void 0;
// التحقق من أن المستخدم مدير
const isAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول - صلاحيات المدير مطلوبة'
            });
        }
        return next();
    }
    catch (error) {
        console.error('Error in isAdmin middleware:', error);
        return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
    }
};
exports.isAdmin = isAdmin;
// التحقق من أن المستخدم مدير أو محاسب
const isAdminOrAccountant = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'غير مصرح بالوصول - يجب تسجيل الدخول' });
        }
        if (user.role !== 'admin' && user.role !== 'accountant') {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول - صلاحيات المدير أو المحاسب مطلوبة'
            });
        }
        return next();
    }
    catch (error) {
        console.error('Error in isAdminOrAccountant middleware:', error);
        return res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' });
    }
};
exports.isAdminOrAccountant = isAdminOrAccountant;
//# sourceMappingURL=isAdmin.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const isAccountant_middleware_1 = require("../middlewares/isAccountant.middleware");
const accounting_controller_1 = require("../controllers/accounting.controller");
const router = (0, express_1.Router)();
// جميع المسارات تتطلب المصادقة وصلاحيات المحاسبة أو الإدارة
router.use(auth_middleware_1.authenticate);
router.use(isAccountant_middleware_1.isAccountantOrAdmin);
// لوحة تحكم المحاسبة - ملخص شامل
router.get('/dashboard', accounting_controller_1.getAccountingDashboard);
// تقارير المبيعات
router.get('/sales/stats', accounting_controller_1.getSalesStats);
router.get('/sales/products', accounting_controller_1.getProductSalesReport);
router.get('/sales/categories', accounting_controller_1.getCategorySalesReport);
// تقارير الخصومات
router.get('/discounts/usage', accounting_controller_1.getDiscountUsageReport);
// تقارير العملاء
router.get('/customers', accounting_controller_1.getCustomerReport);
// تقرير الأرباح والخسائر
router.get('/profit-loss', accounting_controller_1.getProfitLossReport);
exports.default = router;
//# sourceMappingURL=accounting.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const discount_controller_1 = require("../controllers/discount.controller");
const router = (0, express_1.Router)();
// المسارات العامة للمستخدمين
router.get('/', auth_middleware_1.authenticate, discount_controller_1.getAvailableDiscounts);
router.post('/apply', auth_middleware_1.authenticate, discount_controller_1.applyDiscount);
// المسارات الخاصة بالمدراء - التحقق من الصلاحية يتم داخل الكونترولر
router.get('/admin/all', auth_middleware_1.authenticate, discount_controller_1.getAllDiscounts);
router.post('/admin/create', auth_middleware_1.authenticate, discount_controller_1.createDiscount);
router.put('/admin/:id', auth_middleware_1.authenticate, discount_controller_1.updateDiscount);
router.delete('/admin/:id', auth_middleware_1.authenticate, discount_controller_1.deleteDiscount);
router.patch('/admin/:id/toggle', auth_middleware_1.authenticate, discount_controller_1.toggleDiscountStatus);
exports.default = router;
//# sourceMappingURL=discount.routes.js.map
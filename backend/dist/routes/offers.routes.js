"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const offers_controller_1 = require("../controllers/offers.controller");
const router = (0, express_1.Router)();
// جلب العروض المتاحة للمستخدمين
router.get('/', auth_middleware_1.authenticate, offers_controller_1.getAvailableOffers);
// جلب عروض منتج معين
router.get('/product/:productId', auth_middleware_1.authenticate, offers_controller_1.getProductOffers);
// جلب عروض فئة معينة
router.get('/category/:categoryId', auth_middleware_1.authenticate, offers_controller_1.getCategoryOffers);
// حساب السعر مع الخصم
router.post('/calculate-price', auth_middleware_1.authenticate, offers_controller_1.calculateDiscountedPrice);
exports.default = router;
//# sourceMappingURL=offers.routes.js.map
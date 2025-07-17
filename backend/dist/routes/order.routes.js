"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/order.routes.ts
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// إنشاء طلب جديد
router.post('/', auth_middleware_1.authenticate, order_controller_1.placeOrder);
// الحصول على جميع الطلبات الخاصة بالمستخدم
router.get('/my-orders', auth_middleware_1.authenticate, order_controller_1.getMyOrders);
// الحصول على جميع الطلبات (للمسؤول)
router.get('/', auth_middleware_1.authenticate, order_controller_1.getAllOrders);
// الحصول على تفاصيل طلب معين بواسطة ID
router.get('/:orderId', auth_middleware_1.authenticate, order_controller_1.getOrderById);
// حذف طلب
router.delete('/:orderId', auth_middleware_1.authenticate, order_controller_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// ✅ Admin routes - عرض كل السلال للمسؤول
router.get('/admin', auth_middleware_1.authenticate, (req, res) => {
    if (req.user?.role === 'admin') {
        return (0, cart_controller_1.getAllCarts)(req, res);
    }
    else {
        return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }
});
// ✅ Public/Protected routes
router.get('/', auth_middleware_1.authenticate, cart_controller_1.getCart);
router.post('/', auth_middleware_1.authenticate, cart_controller_1.addToCart);
router.delete('/:productId', auth_middleware_1.authenticate, cart_controller_1.removeFromCart);
router.put('/:productId', auth_middleware_1.authenticate, cart_controller_1.updateCartItemQuantity);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map
import express from 'express';
import {
  addToCart,
  getAllCarts,
  getCart,
  removeFromCart,
  updateCartItemQuantity
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// ✅ Admin routes - عرض كل السلال للمسؤول
router.get('/admin', authenticate, (req, res) => {
  if (req.user?.role === 'admin') {
    return getAllCarts(req, res);
  } else {
    return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
  }
});

// ✅ Public/Protected routes
router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.delete('/:productId', authenticate, removeFromCart);
router.put('/:productId', authenticate, updateCartItemQuantity);

export default router;
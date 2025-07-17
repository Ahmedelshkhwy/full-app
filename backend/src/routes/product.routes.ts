import { Router } from 'express';
import { getAllProducts, createProduct, getProductById } from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.get('/:productId', getProductById);
export default router;
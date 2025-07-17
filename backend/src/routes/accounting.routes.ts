import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { isAccountantOrAdmin } from '../middlewares/isAccountant.middleware';
import {
  getSalesStats,
  getProductSalesReport,
  getCategorySalesReport,
  getDiscountUsageReport,
  getCustomerReport,
  getProfitLossReport,
  getAccountingDashboard
} from '../controllers/accounting.controller';

const router = Router();

// جميع المسارات تتطلب المصادقة وصلاحيات المحاسبة أو الإدارة
router.use(authenticate);
router.use(isAccountantOrAdmin);

// لوحة تحكم المحاسبة - ملخص شامل
router.get('/dashboard', getAccountingDashboard);

// تقارير المبيعات
router.get('/sales/stats', getSalesStats);
router.get('/sales/products', getProductSalesReport);
router.get('/sales/categories', getCategorySalesReport);

// تقارير الخصومات
router.get('/discounts/usage', getDiscountUsageReport);

// تقارير العملاء
router.get('/customers', getCustomerReport);

// تقرير الأرباح والخسائر
router.get('/profit-loss', getProfitLossReport);

export default router;

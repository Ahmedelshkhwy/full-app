import { Request, Response } from 'express';
import Order from '../models/order.model';
import User from '../models/user.model';

// إحصائيات المبيعات العامة
export const getSalesStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    // إعداد نطاق التاريخ
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    } else {
      // آخر 30 يوم افتراضياً
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = {
        createdAt: { $gte: thirtyDaysAgo }
      };
    }

    // تجميع المبيعات
    const salesAggregation = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: period === 'daily' 
            ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            : period === 'monthly'
            ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
            : { $dateToString: { format: "%Y", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: "$discountAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // إجمالي المبيعات
    const totalStats = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalDiscounts: { $sum: "$discountAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    return res.json({
      success: true,
      period,
      dateRange: { startDate, endDate },
      salesByPeriod: salesAggregation,
      totalStats: totalStats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        totalDiscounts: 0,
        avgOrderValue: 0
      }
    });
  } catch (error) {
    console.error('Error getting sales stats:', error);
    return res.status(500).json({ message: 'خطأ في جلب إحصائيات المبيعات' });
  }
};

// تقرير المبيعات حسب المنتجات
export const getProductSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    const productSales = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalOrders: { $sum: 1 },
          avgPrice: { $avg: "$items.price" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          category: "$product.category",
          totalQuantitySold: 1,
          totalRevenue: 1,
          totalOrders: 1,
          avgPrice: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    return res.json({
      success: true,
      productSales
    });
  } catch (error) {
    console.error('Error getting product sales report:', error);
    return res.status(500).json({ message: 'خطأ في جلب تقرير مبيعات المنتجات' });
  }
};

// تقرير الإيرادات حسب الفئات
export const getCategorySalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    const categorySales = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return res.json({
      success: true,
      categorySales
    });
  } catch (error) {
    console.error('Error getting category sales report:', error);
    return res.status(500).json({ message: 'خطأ في جلب تقرير مبيعات الفئات' });
  }
};

// تقرير استخدام الخصومات
export const getDiscountUsageReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    const discountUsage = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          discountAmount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$discountCode",
          totalUsage: { $sum: 1 },
          totalDiscountAmount: { $sum: "$discountAmount" },
          avgDiscountAmount: { $avg: "$discountAmount" },
          totalOrderValue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalDiscountAmount: -1 } }
    ]);

    return res.json({
      success: true,
      discountUsage
    });
  } catch (error) {
    console.error('Error getting discount usage report:', error);
    return res.status(500).json({ message: 'خطأ في جلب تقرير استخدام الخصومات' });
  }
};

// تقرير العملاء
export const getCustomerReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // إحصائيات العملاء
    const customerStats = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          customerName: "$user.username",
          customerEmail: "$user.email",
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          firstOrder: 1,
          lastOrder: 1
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // إحصائيات عامة للمستخدمين
    const generalStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalAdmins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          totalAccountants: { $sum: { $cond: [{ $eq: ["$role", "accountant"] }, 1, 0] } },
          totalRegularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
        }
      }
    ]);

    return res.json({
      success: true,
      customers: customerStats,
      generalStats: generalStats[0] || {
        totalCustomers: 0,
        totalAdmins: 0,
        totalAccountants: 0,
        totalRegularUsers: 0
      }
    });
  } catch (error) {
    console.error('Error getting customer report:', error);
    return res.status(500).json({ message: 'خطأ في جلب تقرير العملاء' });
  }
};

// تقرير الأرباح والخسائر (مبسط)
export const getProfitLossReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // حساب الإيرادات
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDiscounts: { $sum: "$discountAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // حساب تكلفة المنتجات المباعة (مبسط - نفترض أن التكلفة 60% من سعر البيع)
    const costData = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'paid'
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          estimatedCost: { 
            $sum: { 
              $multiply: [
                { $multiply: ["$items.quantity", "$items.price"] },
                0.6 // نفترض أن التكلفة 60% من سعر البيع
              ] 
            } 
          }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalDiscounts: 0, totalOrders: 0 };
    const cost = costData[0] || { estimatedCost: 0 };

    const grossProfit = revenue.totalRevenue - cost.estimatedCost;
    const netProfit = grossProfit - revenue.totalDiscounts;
    const profitMargin = revenue.totalRevenue > 0 ? (netProfit / revenue.totalRevenue) * 100 : 0;

    return res.json({
      success: true,
      report: {
        totalRevenue: revenue.totalRevenue,
        estimatedCost: cost.estimatedCost,
        grossProfit,
        totalDiscounts: revenue.totalDiscounts,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalOrders: revenue.totalOrders
      },
      note: "تم حساب التكلفة بنسبة تقديرية 60% من سعر البيع. يرجى تحديث النظام لإدخال التكاليف الفعلية."
    });
  } catch (error) {
    console.error('Error getting profit/loss report:', error);
    return res.status(500).json({ message: 'خطأ في جلب تقرير الأرباح والخسائر' });
  }
};

// لوحة تحكم المحاسبة - ملخص شامل
export const getAccountingDashboard = async (req: Request, res: Response) => {
  try {
    const { period: _period = 'monthly' } = req.query;
    
    // آخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // هذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // إحصائيات سريعة
    const [monthlyStats, recentOrders, topProducts] = await Promise.all([
      // إحصائيات الشهر الحالي
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            totalDiscounts: { $sum: "$discountAmount" },
            avgOrderValue: { $avg: "$totalAmount" }
          }
        }
      ]),

      // آخر الطلبات
      Order.find({
        createdAt: { $gte: thirtyDaysAgo }
      })
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10),

      // أفضل المنتجات مبيعاً
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            paymentStatus: 'paid'
          }
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            productName: "$product.name",
            totalSold: 1,
            totalRevenue: 1
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ])
    ]);

    return res.json({
      success: true,
      dashboard: {
        monthlyStats: monthlyStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          totalDiscounts: 0,
          avgOrderValue: 0
        },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error getting accounting dashboard:', error);
    return res.status(500).json({ message: 'خطأ في جلب لوحة تحكم المحاسبة' });
  }
};

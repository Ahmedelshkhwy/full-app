"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.deleteOrder = exports.placeOrder = exports.getOrderById = exports.getAllOrders = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const payment_service_1 = require("../services/payment.service");
// ✅ الاسم الصحيح
const getAllOrders = async (_req, res) => {
    try {
        const orders = await order_model_1.default.find()
            .populate({
            path: 'items.productId',
            select: 'name price image stock'
        })
            .populate('user', 'username email phone')
            .sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    }
    catch (error) {
        console.error('Error in getAllOrders:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const order = await order_model_1.default.findById(req.params['orderId'])
            .populate({
            path: 'items.productId',
            select: 'name price image stock'
        })
            .populate('user', 'username email phone');
        if (!order) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }
        return res.status(200).json({ order });
    }
    catch (error) {
        console.error('Error in getOrderById:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلب' });
    }
};
exports.getOrderById = getOrderById;
const placeOrder = async (req, res) => {
    try {
        const { paymentMethod, shippingAddress, items, totalAmount } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'مستخدم غير مصرح' });
        }
        // التحقق من عنوان التوصيل
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
            return res.status(400).json({ message: 'عنوان التوصيل مطلوب مع جميع التفاصيل (الشارع، المدينة، الرمز البريدي)' });
        }
        // استخدام البيانات المرسلة من الفرونت اند أو من السلة
        let orderItems = items;
        let orderTotal = totalAmount;
        // إذا لم يتم إرسال items، استخدم السلة
        if (!items || items.length === 0) {
            const cart = await cart_model_1.default.findOne({ user: userId }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: 'السلة فارغة' });
            }
            console.log('Cart items:', cart.items); // للتشخيص
            // التحقق من المخزون قبل إنشاء الطلب
            for (const item of cart.items) {
                const product = item.productId;
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `المنتج "${product.name}" غير متوفر بالكمية المطلوبة. المخزون المتاح: ${product.stock}`
                    });
                }
            }
            orderItems = cart.items.map((item) => {
                const product = item.productId;
                return {
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: product.price || 0,
                };
            });
            orderTotal = cart.items.reduce((sum, item) => {
                const product = item.productId;
                return sum + (item.quantity * (product.price || 0));
            }, 0);
        }
        else {
            // التحقق من المخزون للعناصر المرسلة
            for (const item of orderItems) {
                const product = await product_model_1.default.findById(item.productId);
                if (!product) {
                    return res.status(400).json({ message: `المنتج غير موجود` });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `المنتج "${product.name}" غير متوفر بالكمية المطلوبة. المخزون المتاح: ${product.stock}`
                    });
                }
            }
        }
        console.log('Order total:', orderTotal); // للتشخيص
        // معالجة الدفع إذا لم يكن نقداً
        if (paymentMethod !== 'cash') {
            try {
                const paymentResponse = await (0, payment_service_1.processPayment)(orderTotal, paymentMethod);
                if (!paymentResponse || paymentResponse.status !== 'paid') {
                    return res.status(400).json({ message: 'فشل في الدفع عبر Moyasar' });
                }
            }
            catch (paymentError) {
                console.error('Payment error:', paymentError);
                return res.status(400).json({ message: 'فشل في معالجة الدفع' });
            }
        }
        const order = await order_model_1.default.create({
            user: userId,
            items: orderItems,
            totalAmount: orderTotal,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
            shippingAddress: shippingAddress,
            orderStatus: 'processing',
        });
        // تحديث المخزون بعد إنشاء الطلب
        for (const item of orderItems) {
            await product_model_1.default.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
        // مسح السلة بعد إنشاء الطلب (فقط إذا تم استخدام السلة)
        if (!items || items.length === 0) {
            await cart_model_1.default.deleteOne({ user: userId });
        }
        console.log('Order created:', order); // للتشخيص
        // إرجاع الطلب مع تفاصيل المنتجات
        const populatedOrder = await order_model_1.default.findById(order._id)
            .populate({
            path: 'items.productId',
            select: 'name price image stock'
        })
            .populate('user', 'username email phone');
        return res.status(201).json({
            message: 'تم الطلب والدفع بنجاح',
            order: populatedOrder
        });
    }
    catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({
            message: 'حدث خطأ أثناء إنشاء الطلب',
            error: error.message
        });
    }
};
exports.placeOrder = placeOrder;
const deleteOrder = async (req, res) => {
    try {
        const order = await order_model_1.default.findByIdAndDelete(req.params['orderId']);
        if (!order) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }
        return res.status(200).json({ message: 'تم حذف الطلب بنجاح' });
    }
    catch (error) {
        console.error('Error in deleteOrder:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء حذف الطلب' });
    }
};
exports.deleteOrder = deleteOrder;
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'مستخدم غير مصرح' });
        }
        console.log('🔍 Fetching orders for user:', userId);
        // Optimize the query with lean() for better performance
        const orders = await order_model_1.default.find({ user: userId })
            .populate({
            path: 'items.productId',
            select: 'name price image stock',
            options: { lean: true }
        })
            .sort({ createdAt: -1 })
            .limit(50) // Limit to last 50 orders for performance
            .lean(); // Use lean() for better performance
        console.log(`✅ Found ${orders.length} orders for user ${userId}`);
        return res.status(200).json({
            orders,
            count: orders.length,
            message: 'تم جلب الطلبات بنجاح'
        });
    }
    catch (error) {
        console.error('❌ Error in getMyOrders:', error);
        return res.status(500).json({
            message: 'حدث خطأ أثناء جلب الطلبات الخاصة بك',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMyOrders = getMyOrders;
//# sourceMappingURL=order.controller.js.map
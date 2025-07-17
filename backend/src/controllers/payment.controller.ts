import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import Payment from '../models/payment.model';
import Order from '../models/order.model';
import { processPayment, confirmPaymentGateway, getPaymentGatewayStatus } from '../services/payment.service';

/**
 * إنشاء نية دفع جديدة
 */
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, amount, currency = 'SAR' } = req.body;
    const userId = req.user!.id;

    // التحقق من وجود الطلب
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // التحقق من ملكية الطلب
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول لهذا الطلب'
      });
    }

    // التحقق من مطابقة المبلغ
    if (order.totalAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ غير مطابق لمبلغ الطلب'
      });
    }

    // إنشاء سجل دفع جديد
    const payment = new Payment({
      orderId,
      userId,
      amount,
      currency,
      paymentMethod: order.paymentMethod,
      status: 'pending'
    });

    await payment.save();

    // إنشاء نية الدفع مع payment gateway
    const paymentIntentData = await processPayment(amount, order.paymentMethod);
    
    // تحديث بيانات الدفع
    payment.paymentIntentId = paymentIntentData.id;
    payment.gatewayResponse = paymentIntentData;
    payment.status = 'processing';
    await payment.save();

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء نية الدفع بنجاح',
      data: {
        paymentId: payment._id,
        paymentIntentId: payment.paymentIntentId,
        clientSecret: paymentIntentData.client_secret,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    });

  } catch (error: any) {
    console.error('خطأ في إنشاء نية الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء نية الدفع',
      error: error.message
    });
  }
};

/**
 * تأكيد عملية الدفع
 */
export const confirmPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    const userId = req.user!.id;

    // البحث عن الدفع
    const payment = await Payment.findOne({ 
      paymentIntentId,
      userId,
      status: 'processing'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'عملية الدفع غير موجودة أو تم تأكيدها مسبقاً'
      });
    }

    // تأكيد الدفع مع payment gateway
    const confirmationResult = await confirmPaymentGateway(paymentIntentId, paymentMethodId);
    
    // تحديث حالة الدفع
    payment.paymentMethodId = paymentMethodId;
    payment.transactionId = confirmationResult.id;
    payment.gatewayResponse = confirmationResult;
    payment.status = confirmationResult.status === 'paid' ? 'completed' : 'failed';
    
    if (confirmationResult.status === 'failed') {
      payment.failureReason = confirmationResult.failure_reason || 'فشل الدفع';
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: payment.status === 'completed' ? 'تم تأكيد الدفع بنجاح' : 'فشل في تأكيد الدفع',
      data: {
        paymentId: payment._id,
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount
      }
    });

  } catch (error: any) {
    console.error('خطأ في تأكيد الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في تأكيد الدفع',
      error: error.message
    });
  }
};

/**
 * الحصول على حالة الدفع
 */
export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.id;

    const payment = await Payment.findOne({ 
      _id: paymentId,
      userId
    }).populate('orderId', 'orderStatus totalAmount');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'عملية الدفع غير موجودة'
      });
    }

    // إذا كانت الحالة processing، تحقق من gateway
    if (payment.status === 'processing' && payment.paymentIntentId) {
      try {
        const gatewayStatus = await getPaymentGatewayStatus(payment.paymentIntentId);
        
        if (gatewayStatus.status !== payment.status) {
          payment.status = gatewayStatus.status === 'paid' ? 'completed' : 'failed';
          payment.gatewayResponse = gatewayStatus;
          await payment.save();
        }
      } catch (error) {
        console.error('خطأ في الحصول على حالة الدفع من gateway:', error);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('خطأ في الحصول على حالة الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الحصول على حالة الدفع',
      error: error.message
    });
  }
};

/**
 * معالجة webhooks من payment gateway
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // TODO: التحقق من صحة signature
    // const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];
    // const isValid = verifyWebhookSignature(payload, signature);
    // if (!isValid) {
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    // معالجة الحدث حسب النوع
    switch (payload.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(payload.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.data);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(payload.data);
        break;
      default:
        console.log('Unknown webhook event type:', payload.type);
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('خطأ في معالجة webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في معالجة webhook',
      error: error.message
    });
  }
};

/**
 * معالجة حدث نجاح الدفع من webhook
 */
const handlePaymentSucceeded = async (paymentData: any) => {
  try {
    const payment = await Payment.findOne({ 
      paymentIntentId: paymentData.id 
    });

    if (payment && payment.status !== 'completed') {
      payment.status = 'completed';
      payment.transactionId = paymentData.id;
      payment.gatewayResponse = paymentData;
      await payment.save();
    }
  } catch (error) {
    console.error('خطأ في معالجة نجاح الدفع:', error);
  }
};

/**
 * معالجة حدث فشل الدفع من webhook
 */
const handlePaymentFailed = async (paymentData: any) => {
  try {
    const payment = await Payment.findOne({ 
      paymentIntentId: paymentData.id 
    });

    if (payment && payment.status !== 'failed') {
      payment.status = 'failed';
      payment.failureReason = paymentData.failure_reason || 'فشل الدفع';
      payment.gatewayResponse = paymentData;
      await payment.save();
    }
  } catch (error) {
    console.error('خطأ في معالجة فشل الدفع:', error);
  }
};

/**
 * معالجة حدث استرداد الدفع من webhook
 */
const handlePaymentRefunded = async (paymentData: any) => {
  try {
    const payment = await Payment.findOne({ 
      transactionId: paymentData.id 
    });

    if (payment) {
      payment.status = 'refunded';
      payment.refundAmount = paymentData.refund_amount;
      payment.refundReason = paymentData.refund_reason || 'استرداد من المتجر';
      payment.gatewayResponse = paymentData;
      await payment.save();
    }
  } catch (error) {
    console.error('خطأ في معالجة استرداد الدفع:', error);
  }
};

// إبقاء الدالة القديمة للتوافق مع الاستخدام الحالي
export const handlePayment = async (req: Request, res: Response) => {
  console.log('handlePayment called - هذه الدالة قديمة، يرجى استخدام createPaymentIntent');
  try {
    const { total } = req.body;
    if (!total || typeof total !== 'number') {
      return res.status(400).json({ success: false, message: 'المبلغ غير صحيح' });
    }
    const paymentMethod = req.body.paymentMethod || 'default';
    const paymentResponse = await processPayment(total, paymentMethod);
    
    return res.status(200).json({
      success: true,
      message: 'تمت معالجة الدفع بنجاح',
      data: paymentResponse,
    });
  } catch (error: any) {
    console.error('خطأ أثناء الدفع:', error?.response?.data || error);
    return res.status(500).json({ message: 'فشل الدفع عبر مويصار', error: error?.response?.data || error });
  }
};

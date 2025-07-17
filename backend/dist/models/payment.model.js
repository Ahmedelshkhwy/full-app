"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PaymentSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        enum: ['SAR', 'USD', 'EUR'],
        default: 'SAR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'stcpay', 'creditcard'],
        required: true
    },
    paymentIntentId: {
        type: String,
        sparse: true, // يسمح بقيم null متعددة
        index: true
    },
    paymentMethodId: {
        type: String,
        sparse: true
    },
    transactionId: {
        type: String,
        sparse: true,
        index: true
    },
    gatewayResponse: {
        type: mongoose_1.Schema.Types.Mixed
    },
    failureReason: {
        type: String
    },
    refundAmount: {
        type: Number,
        min: 0
    },
    refundReason: {
        type: String
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true
});
// Index مركب للبحث السريع
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ transactionId: 1, status: 1 });
// Middleware لتحديث حالة الطلب عند تغير حالة الدفع
PaymentSchema.pre('save', async function (next) {
    if (this.isModified('status')) {
        try {
            const Order = mongoose_1.default.model('Order');
            const paymentStatus = this['status'] === 'completed' ? 'paid' :
                this['status'] === 'failed' || this['status'] === 'cancelled' ? 'failed' :
                    'pending';
            await Order.findByIdAndUpdate(this['orderId'], {
                paymentStatus: paymentStatus
            });
        }
        catch (error) {
            console.error('Error updating order payment status:', error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
//# sourceMappingURL=payment.model.js.map
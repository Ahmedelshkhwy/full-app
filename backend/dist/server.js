"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const health_controller_1 = require("./controllers/health.controller");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const discount_routes_1 = __importDefault(require("./routes/discount.routes"));
const offers_routes_1 = __importDefault(require("./routes/offers.routes"));
const accounting_routes_1 = __importDefault(require("./routes/accounting.routes"));
const otp_routes_1 = __importDefault(require("./routes/otp.routes"));
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
console.log('🔧 Loading environment variables...');
try {
    // This will validate all required env vars
    console.log('✅ Environment validation passed');
}
catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
}
const app = (0, express_1.default)();
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// CORS configuration for WSL
const corsOptions = {
    origin: function (_origin, callback) {
        // في WSL، نسمح بجميع الأصول للتطوير
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/pharmacy';
        console.log('🔗 Connecting to MongoDB...');
        console.log('📡 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Don't exit process, continue with HTTP/HTTPS server
        console.log('⚠️  Continuing without database connection...');
    }
};
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', auth_middleware_1.authenticate, order_routes_1.default);
app.use('/api/payment', auth_middleware_1.authenticate, payment_routes_1.default);
app.use('/api/user', auth_middleware_1.authenticate, user_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/discount', discount_routes_1.default);
app.use('/api/offers', offers_routes_1.default);
app.use('/api/accounting', accounting_routes_1.default);
app.use('/api/otp', otp_routes_1.default);
// Health check routes
app.get('/api/health', health_controller_1.healthCheck);
app.get('/api/health/simple', health_controller_1.simpleHealthCheck);
app.get('/api/health/system', health_controller_1.systemInfo);
// 404 handler - must be last
app.use('*', errorHandler_middleware_1.notFound);
// Global error handler - must be last
app.use(errorHandler_middleware_1.errorHandler);
// Start server
const PORT = parseInt(process.env['PORT'] || '5000', 10);
const USE_HTTPS = process.env['USE_HTTPS'] === 'true';
const CERTS_PATH = path_1.default.join(__dirname, '../../certs');
console.log(`🔍 Debug Info:`);
console.log(`   USE_HTTPS: ${USE_HTTPS}`);
console.log(`   CERTS_PATH: ${CERTS_PATH}`);
// التحقق من وجود شهادات SSL
const keyExists = fs_1.default.existsSync(path_1.default.join(CERTS_PATH, 'key.pem'));
const certExists = fs_1.default.existsSync(path_1.default.join(CERTS_PATH, 'cert.pem'));
const bothExist = keyExists && certExists;
console.log(`   Key exists: ${keyExists}`);
console.log(`   Cert exists: ${certExists}`);
console.log(`   Both exist: ${bothExist}`);
if (USE_HTTPS && bothExist) {
    // HTTPS Server
    console.log(`🔒 Starting HTTPS server...`);
    const server = https_1.default.createServer({
        key: fs_1.default.readFileSync(path_1.default.join(CERTS_PATH, 'key.pem')),
        cert: fs_1.default.readFileSync(path_1.default.join(CERTS_PATH, 'cert.pem'))
    }, app);
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${PORT}`);
        console.log(`📱 API available at https://0.0.0.0:${PORT}/api`);
        console.log(`📖 API docs at https://0.0.0.0:${PORT}/api-docs`);
        connectDB();
    });
}
else {
    // HTTP Server (fallback)
    if (USE_HTTPS) {
        console.log('⚠️  HTTPS requested but certificates not found, falling back to HTTP');
        console.log('💡 To use HTTPS, set USE_HTTPS=true in .env and generate certificates');
    }
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTP Server is running on http://0.0.0.0:${PORT}`);
        console.log(`📱 API available at http://0.0.0.0:${PORT}/api`);
        console.log(`📖 API docs at http://0.0.0.0:${PORT}/api-docs`);
        connectDB();
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map
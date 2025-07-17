import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';
import { authenticate } from './middlewares/auth.middleware';
import { errorHandler, notFound } from './middlewares/errorHandler.middleware';
import { healthCheck, simpleHealthCheck, systemInfo } from './controllers/health.controller';
import authRoutes from "./routes/auth.routes";

import cartRoutes from './routes/cart.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import discountRoutes from './routes/discount.routes';
import offersRoutes from './routes/offers.routes';
import accountingRoutes from './routes/accounting.routes';
import otpRoutes from './routes/otp.routes';

// Load and validate environment variables
import { envConfig } from './config/env.validation';

console.log('🔧 Loading environment variables...');
try {
  // Environment validation is done in env.validation.ts
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// CORS configuration for WSL
const corsOptions = {
  origin: function (_origin: any, callback: any) {
    // في WSL، نسمح بجميع الأصول للتطوير
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', envConfig.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(envConfig.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit process, continue with HTTP/HTTPS server
    console.log('⚠️  Continuing without database connection...');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/payment', authenticate, paymentRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/otp', otpRoutes);

// Health check routes
app.get('/api/health', healthCheck);
app.get('/api/health/simple', simpleHealthCheck);
app.get('/api/health/system', systemInfo);

// 404 handler - must be last
app.use('*', notFound);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env['PORT'] || '5000', 10);
const USE_HTTPS = process.env['USE_HTTPS'] === 'true';
const CERTS_PATH = path.join(__dirname, '../../certs');

console.log(`🔍 Debug Info:`);
console.log(`   USE_HTTPS: ${USE_HTTPS}`);
console.log(`   CERTS_PATH: ${CERTS_PATH}`);

// التحقق من وجود شهادات SSL
const keyExists = fs.existsSync(path.join(CERTS_PATH, 'key.pem'));
const certExists = fs.existsSync(path.join(CERTS_PATH, 'cert.pem'));
const bothExist = keyExists && certExists;

console.log(`   Key exists: ${keyExists}`);
console.log(`   Cert exists: ${certExists}`);
console.log(`   Both exist: ${bothExist}`);

if (USE_HTTPS && bothExist) {
  // HTTPS Server
  console.log(`🔒 Starting HTTPS server...`);
  const server = https.createServer({
    key: fs.readFileSync(path.join(CERTS_PATH, 'key.pem')),
    cert: fs.readFileSync(path.join(CERTS_PATH, 'cert.pem'))
  }, app);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${PORT}`);
    console.log(`📱 API available at https://0.0.0.0:${PORT}/api`);
    console.log(`📖 API docs at https://0.0.0.0:${PORT}/api-docs`);
    connectDB();
  });
} else {
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

export default app;

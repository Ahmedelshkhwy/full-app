"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Load environment variables
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../../../.env') });
const validateEnvironment = () => {
    // Set default values for development
    const defaults = {
        MONGODB_URI: 'mongodb://localhost:27017/pharmacy',
        JWT_SECRET: 'pharmacy-backend-super-secret-key-2024-development',
        EMAIL_USER: 'test@pharmacy.com',
        EMAIL_PASS: 'test123',
        MOYASAR_API_KEY: 'sk_test_9g8AGzpe51aCcbYMFsn9iSZKy9sJDZZHyKkaRwEa'
    };
    // Use environment variables or defaults
    const envVars = {
        MONGODB_URI: process.env['MONGODB_URI'] || defaults.MONGODB_URI,
        JWT_SECRET: process.env['JWT_SECRET'] || defaults.JWT_SECRET,
        EMAIL_USER: process.env['EMAIL_USER'] || defaults.EMAIL_USER,
        EMAIL_PASS: process.env['EMAIL_PASS'] || defaults.EMAIL_PASS,
        MOYASAR_API_KEY: process.env['MOYASAR_API_KEY'] || defaults.MOYASAR_API_KEY
    };
    // Log which variables are using defaults
    const usingDefaults = Object.keys(envVars).filter(key => !process.env[key] && envVars[key] === defaults[key]);
    if (usingDefaults.length > 0) {
        console.log('⚠️  Using default values for:', usingDefaults.join(', '));
        console.log('💡 Create a .env file in the project root for production values');
    }
    // Validate JWT_SECRET length
    if (envVars.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    // Validate MongoDB URI format
    if (!envVars.MONGODB_URI.includes('mongodb://') && !envVars.MONGODB_URI.includes('mongodb+srv://')) {
        throw new Error('Invalid MONGODB_URI format');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(envVars.EMAIL_USER)) {
        throw new Error('Invalid EMAIL_USER format');
    }
    return {
        NODE_ENV: process.env['NODE_ENV'] || 'development',
        PORT: parseInt(process.env['PORT'] || '5000', 10),
        MONGODB_URI: envVars.MONGODB_URI,
        JWT_SECRET: envVars.JWT_SECRET,
        EMAIL_USER: envVars.EMAIL_USER,
        EMAIL_PASS: envVars.EMAIL_PASS,
        MOYASAR_API_KEY: envVars.MOYASAR_API_KEY,
        USE_HTTPS: process.env['USE_HTTPS'] === 'true'
    };
};
exports.envConfig = validateEnvironment();
// Log environment info (without sensitive data)
console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${exports.envConfig.NODE_ENV}`);
console.log(`   PORT: ${exports.envConfig.PORT}`);
console.log(`   USE_HTTPS: ${exports.envConfig.USE_HTTPS}`);
console.log(`   MONGODB_URI: ${exports.envConfig.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
console.log(`   EMAIL_USER: ${exports.envConfig.EMAIL_USER}`);
console.log(`   JWT_SECRET: ${exports.envConfig.JWT_SECRET.substring(0, 8)}...`);
console.log(`   MOYASAR_API_KEY: ${exports.envConfig.MOYASAR_API_KEY.substring(0, 8)}...`);
//# sourceMappingURL=env.validation.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_CONFIG = void 0;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// تحميل ملف .env من جذر المشروع
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../../../.env') });
exports.API_CONFIG = {
    PORT: process.env['PORT'] || 5000,
    NODE_ENV: process.env['NODE_ENV'] || 'development',
    MONGODB_URI: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/pharmacy',
    JWT_SECRET: process.env['JWT_SECRET'] || 'default_secret_key',
    JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '7d',
    BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '10'),
    // CORS URLs
    ALLOWED_ORIGINS: [
        process.env['MOBILE_APP_URL'],
        process.env['ADMIN_PANEL_URL'],
        process.env['WEB_APP_URL']
    ].filter(Boolean),
    // API Configuration
    API_URL: process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:5000/api',
    // Payment Configuration
    MOYASAR_API_KEY: process.env['MOYASAR_API_KEY']
};
exports.default = exports.API_CONFIG;
//# sourceMappingURL=api.config.js.map
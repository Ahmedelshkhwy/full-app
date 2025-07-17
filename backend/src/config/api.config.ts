import { config } from 'dotenv';
import path from 'path';

// تحميل ملف .env من جذر المشروع
config({ path: path.join(__dirname, '../../../.env') });

export const API_CONFIG = {
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

export default API_CONFIG;

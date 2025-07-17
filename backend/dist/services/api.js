"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://192.168.8.103:5000/api/auth';
// مثال: دالة تسجيل مستخدم جديد (يمكنك تعديل الحقول حسب الحاجة)
const registerUser = async (data) => {
    const response = await axios_1.default.post(`${API_BASE}/register`, data);
    return response.data;
};
exports.registerUser = registerUser;
// مثال: دالة تسجيل الدخول
const loginUser = async (username, password) => {
    const response = await axios_1.default.post(`${API_BASE}/login`, { username, password });
    return response.data; // يجب أن يرجع { user, token }
};
exports.loginUser = loginUser;
// يمكنك إضافة دوال أخرى حسب الحاجة (تحديث بيانات، حذف مستخدم، إلخ)
//# sourceMappingURL=api.js.map
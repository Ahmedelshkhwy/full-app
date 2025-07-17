"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET']);
        req.user = { id: decoded.id, role: decoded.role || 'user' };
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'جلسة غير صالحة' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map
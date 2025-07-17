"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const optionalAuth = (req, _res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        req.user = { id: 'guest', role: 'guest' };
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET']);
        req.user = { id: decoded.id, role: decoded.role || 'user' };
    }
    catch {
        req.user = { id: 'guest', role: 'guest' };
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=optionalAuth.middleware.js.map
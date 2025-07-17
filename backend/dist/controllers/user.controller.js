"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getUserProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const getUserProfile = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.user.id).select('-password');
        if (!user)
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب البروفايل' });
    }
};
exports.getUserProfile = getUserProfile;
const getAllUsers = async (_req, res) => {
    try {
        const users = await user_model_1.default.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب المستخدمين' });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=user.controller.js.map
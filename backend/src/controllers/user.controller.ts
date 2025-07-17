// backend/src/controllers/user.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب البروفايل' });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المستخدمين' });
  }
};
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.validation';

interface JwtPayload {
  id: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
  }

  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    
    (req as AuthenticatedRequest).user = { id: decoded.id, role: decoded.role || 'user' };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'جلسة غير صالحة' });
  }
};
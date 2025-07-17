// middlewares/optionalAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.user = { id: 'guest', role: 'guest' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as any;
    req.user = { id: decoded.id, role: decoded.role || 'user' };
  } catch {
    req.user = { id: 'guest', role: 'guest' };
  }

  next();
};
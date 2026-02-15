import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database';

export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
    req.userId = decoded.userId;
    
    // 获取用户角色
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId) as any;
    if (user) {
      req.role = user.role;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

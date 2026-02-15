import { Request, Response, NextFunction } from 'express';

// 扩展Request类型，添加role字段
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      role?: string;
    }
  }
}

// 检查是否为管理员
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

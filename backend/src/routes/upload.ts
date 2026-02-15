import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';
import fs from 'fs';

const router: Router = Router();

// 单个文件上传
router.post('/image', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    // 读取文件内容并转换为 Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageData = `data:${mimeType};base64,${base64Image}`;

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    // 返回 Base64 数据
    res.json({
      message: '图片上传成功',
      imageUrl: imageData, // 返回 Base64 data URL
      imageData: imageData,
      size: req.file.size
    });
  } catch (error) {
    console.error('上传图片错误:', error);
    // 清理临时文件
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // 忽略删除错误
      }
    }
    res.status(500).json({ error: '上传图片失败' });
  }
});

// 处理上传错误
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof Error) {
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: '文件大小超过限制（最大5MB）' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

export default router;

import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';
import fs from 'fs';
import convert from 'heic-convert';

const router: Router = Router();

// HEIF/HEIC 格式：上传后统一转为 JPEG 存储（浏览器兼容性最好）
const HEIF_MIMES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

const isHeifImage = (mimetype: string, filename: string) => {
  if (HEIF_MIMES.includes(mimetype)) return true;
  // mimetype 缺失或为 octet-stream 时按扩展名判断
  return (!mimetype || mimetype === 'application/octet-stream') && /\.(heic|heif)$/i.test(filename);
};

// 单个文件上传
router.post('/image', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    // 读取文件内容
    let imageBuffer = fs.readFileSync(req.file.path);
    let mimeType = req.file.mimetype;

    // HEIF/HEIC 转换为 JPEG
    if (isHeifImage(req.file.mimetype, req.file.originalname)) {
      try {
        const jpeg = await convert({ buffer: imageBuffer, format: 'JPEG', quality: 0.85 });
        imageBuffer = Buffer.from(jpeg);
        mimeType = 'image/jpeg';
      } catch (convertError) {
        console.error('HEIF 转换失败:', convertError);
        // 删除临时文件
        try { fs.unlinkSync(req.file.path); } catch (e) { /* 忽略 */ }
        return res.status(400).json({ error: 'HEIC/HEIF 图片转换失败，请转换为 JPG 后重试' });
      }
    }

    // 转换为 Base64
    const base64Image = imageBuffer.toString('base64');
    const imageData = `data:${mimeType};base64,${base64Image}`;

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    // 返回 Base64 数据
    res.json({
      message: '图片上传成功',
      imageUrl: imageData, // 返回 Base64 data URL
      imageData: imageData,
      size: imageBuffer.byteLength
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
      return res.status(400).json({ error: '文件大小超过限制（最大20MB）' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

export default router;

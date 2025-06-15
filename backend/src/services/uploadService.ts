import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import sharp from 'sharp';
import crypto from 'crypto';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const CLUB_UPLOAD_DIR = path.join(UPLOAD_DIR, 'club');
const MAX_FILE_SIZE = 300 * 1024; // 300KB

export const uploadImage = async (file: Express.Multer.File, clubId?: string): Promise<string> => {
  try {
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size exceeds 300KB limit');
    }

    // 使用图片内容生成哈希
    const hash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // 确定存储路径
    let uploadPath = UPLOAD_DIR;
    let relativePath = '/uploads';

    if (clubId) {
      // 如果是俱乐部图片，使用俱乐部专用目录
      uploadPath = path.join(CLUB_UPLOAD_DIR, clubId);
      relativePath = `/uploads/club/${clubId}`;
    }

    // 确保上传目录存在
    if (!fs.existsSync(uploadPath)) {
      await mkdirAsync(uploadPath, { recursive: true });
    }

    // 压缩图片
    const compressedBuffer = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 使用哈希作为文件名
    const fileName = `${hash}.jpg`;
    const filePath = path.join(uploadPath, fileName);

    // 保存文件
    await writeFileAsync(filePath, compressedBuffer);

    // 返回相对路径
    return `${relativePath}/${fileName}`;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw new Error('Failed to upload image');
  }
}; 
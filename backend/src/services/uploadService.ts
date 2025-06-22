import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import sharp from 'sharp';
import crypto from 'crypto';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
//const CLUB_UPLOAD_DIR = path.join(UPLOAD_DIR, 'club');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB，与前端压缩逻辑一致

export type UploadImageOptions = {
  subDir: string; // 如 'members' 或 'club/{clubId}'
  width: number;
  height: number;
  fit: 'cover' | 'inside';
};

export const uploadImage = async (
  file: Express.Multer.File,
  options: UploadImageOptions
): Promise<string> => {
  try {
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size exceeds 2MB limit');
    }
    // 使用图片内容生成哈希
    const hash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');
    // 确定存储路径
    const uploadPath = path.join(UPLOAD_DIR, options.subDir);
    const relativePath = `/uploads/${options.subDir}`;
    // 确保上传目录存在
    if (!fs.existsSync(uploadPath)) {
      await mkdirAsync(uploadPath, { recursive: true });
    }
    // 压缩图片
    const compressedBuffer = await sharp(file.buffer)
      .resize(options.width, options.height, {
        fit: options.fit,
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
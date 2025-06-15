import express from 'express';
import { getImage } from '../services/uploadService';

const router = express.Router();

router.get('/:imageId', async (req, res) => {
  try {
    const image = await getImage(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // 设置正确的Content-Type
    res.setHeader('Content-Type', image.mimeType);
    // 返回base64图片数据
    res.send(Buffer.from(image.base64, 'base64'));
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ message: 'Error getting image' });
  }
});

export default router; 
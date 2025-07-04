import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/:imageId', async (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../../uploads', req.params.imageId);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // 设置正确的Content-Type
    res.setHeader('Content-Type', 'image/jpeg');
    // 返回图片文件
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ message: 'Error getting image' });
  }
});

export default router; 
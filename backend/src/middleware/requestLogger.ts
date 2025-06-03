import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    // 只在发生错误时记录日志
    if (res.statusCode >= 400) {
      console.error(`[${new Date().toISOString()}] Error Response:
        Status: ${res.statusCode}
        Duration: ${duration}ms
        URL: ${req.originalUrl}
        Method: ${req.method}
      `);
    }
  });

  next();
}; 
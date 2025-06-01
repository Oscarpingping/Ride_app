import nodemailer from 'nodemailer';
import { SYSTEM_CONFIG } from '../config/system';

// 邮件发送接口
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: SYSTEM_CONFIG.EMAIL.SMTP.HOST,
  port: SYSTEM_CONFIG.EMAIL.SMTP.PORT,
  secure: SYSTEM_CONFIG.EMAIL.SMTP.PORT === 465,
  auth: {
    user: SYSTEM_CONFIG.EMAIL.SMTP.USER,
    pass: SYSTEM_CONFIG.EMAIL.SMTP.PASS,
  },
});

// 发送邮件函数
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // 检查是否配置了真实的SMTP设置
    if (!SYSTEM_CONFIG.EMAIL.SMTP.USER || !SYSTEM_CONFIG.EMAIL.SMTP.PASS || 
        SYSTEM_CONFIG.EMAIL.SMTP.USER === 'your-email@gmail.com') {
      // 开发环境下，只记录邮件内容而不实际发送
      console.log('=== 邮件发送模拟 (开发环境) ===');
      console.log('收件人:', options.to);
      console.log('主题:', options.subject);
      console.log('内容:', options.text);
      console.log('HTML:', options.html);
      console.log('=== 邮件发送模拟结束 ===');
      return;
    }

    // 生产环境下实际发送邮件
    await transporter.sendMail({
      from: `"${SYSTEM_CONFIG.EMAIL.FROM.NAME}" <${SYSTEM_CONFIG.EMAIL.FROM.ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log('邮件发送成功:', options.to);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}; 
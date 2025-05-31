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
    await transporter.sendMail({
      from: `"${SYSTEM_CONFIG.EMAIL.FROM.NAME}" <${SYSTEM_CONFIG.EMAIL.FROM.ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}; 
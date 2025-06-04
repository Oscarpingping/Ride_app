const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();

// 添加CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// 静态文件服务
app.use('/assets', express.static('public/assets'));
app.use(express.static('public'));

// 模拟用户数据库
const users = new Map();
users.set('ls.na8@outlook.com', {
  email: 'ls.na8@outlook.com',
  password: 'hashedpassword123',
  resetPasswordToken: null,
  resetPasswordExpires: null
});

// 存储重置令牌
const resetTokens = new Map();

// 请求密码重置
app.post('/api/auth/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[${new Date().toISOString()}] 🔐 密码重置请求: ${email}`);

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    const user = users.get(email);
    if (!user) {
      // 为了安全，即使邮箱不存在也返回成功消息，但不发送邮件
      console.log(`[${new Date().toISOString()}] ⚠️ Email not registered: ${email}`);
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 72 * 3600000); // 72小时有效期

    // 保存重置令牌
    resetTokens.set(resetToken, {
      email: email,
      expires: resetExpires,
      used: false
    });

    // 构建重置链接
    const resetUrl = `http://localhost:${PORT}/reset/password?token=${resetToken}`;

    // 模拟发送邮件
    console.log(`[${new Date().toISOString()}] 📧 Sending password reset email to registered email: ${email}`);
    console.log(`[${new Date().toISOString()}] 🔗 Reset link: ${resetUrl}`);
    console.log(`[${new Date().toISOString()}] 🎫 Reset token: ${resetToken}`);
    console.log(`[${new Date().toISOString()}] ⏰ Valid until: ${resetExpires.toLocaleString()}`);

    // 模拟邮件内容
    const emailContent = `
=== WildPals Password Reset Email ===
To: ${email}
Subject: WildPals - Password Reset Request

Dear User,

You are receiving this email because you requested a password reset for your WildPals account.

Please click the following link to reset your password:
${resetUrl}

Important reminders:
• This link is valid for 72 hours only
• The link can only be used once
• If you did not request a password reset, please ignore this email
• For your account security, do not share this link with anyone

If you have any questions, please contact our support team.

WildPals Team
${new Date().toLocaleString()}
========================
`;

    console.log(emailContent);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
      resetToken: resetToken, // 仅用于测试
      resetUrl: resetUrl // 仅用于测试
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// 密码重置页面
app.get('/reset/password', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect('/reset-error?reason=missing_token');
  }

  const resetData = resetTokens.get(token);
  if (!resetData) {
    return res.redirect('/reset-error?reason=invalid_token');
  }

  if (new Date() > resetData.expires) {
    resetTokens.delete(token);
    return res.redirect('/reset-error?reason=expired_token');
  }

  // 检查token是否已使用
  if (resetData.used) {
    resetTokens.delete(token);
    return res.redirect('/reset-error?reason=token_used');
  }

  // 返回密码重置表单
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - WildPals</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            color: #667eea;
            font-size: 28px;
            font-weight: 700;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .message {
            margin-top: 20px;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
        }
        
        .message.error {
            background-color: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        
        .message.success {
            background-color: #efe;
            color: #363;
            border: 1px solid #cfc;
        }
        
        .info {
            background-color: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .info p {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="/assets/images/logo.png" alt="WildPals" style="height: 60px; margin-bottom: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <h1 style="display: none;">🐾 WildPals</h1>
        </div>
        
        <div class="info">
            <p>Please enter your new password. Password should be at least 8 characters long.</p>
        </div>
        
        <form id="resetForm">
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" required minlength="8">
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="8">
            </div>
            
            <button type="submit" class="btn" id="submitBtn">Reset Password</button>
        </form>
        
        <div id="message"></div>
    </div>

    <script>
        document.getElementById('resetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');
            const submitBtn = document.getElementById('submitBtn');
            
            // 清除之前的消息
            messageDiv.innerHTML = '';
            
            // 验证密码
            if (newPassword.length < 8) {
                messageDiv.innerHTML = '<div class="message error">Password must be at least 8 characters long</div>';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                messageDiv.innerHTML = '<div class="message error">Passwords do not match</div>';
                return;
            }
            
            // 禁用按钮
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';
            
            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: '${token}',
                        newPassword: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageDiv.innerHTML = '<div class="message success">Password reset successfully! Redirecting to login page...</div>';
                    setTimeout(() => {
                        window.location.href = '/reset-success';
                    }, 2000);
                } else {
                    messageDiv.innerHTML = '<div class="message error">' + (data.error || 'Reset failed, please try again') + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message error">Network error, please try again</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
    </script>
</body>
</html>
  `);
});

// 处理密码重置
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log(`[${new Date().toISOString()}] 🔐 处理密码重置: token=${token}`);
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }
    
    const resetData = resetTokens.get(token);
    if (!resetData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    if (new Date() > resetData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired'
      });
    }
    
    // 检查token是否已使用
    if (resetData.used) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Reset token has already been used'
      });
    }
    
    // 标记token为已使用
    resetData.used = true;
    
    // 更新用户密码
    const user = users.get(resetData.email);
    if (user) {
      user.password = 'hashed_' + newPassword; // 模拟密码哈希
      console.log(`[${new Date().toISOString()}] ✅ Password reset successfully: ${resetData.email}`);
    }
    
    // 删除使用过的令牌
    resetTokens.delete(token);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// 成功页面
app.get('/reset-success', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>密码重置成功 - WildPals</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
        }
        
        .success-icon {
            font-size: 64px;
            color: #28a745;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 16px;
        }
        
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>密码重置成功！</h1>
        <p>您的密码已成功重置。现在您可以使用新密码登录您的WildPals账户。</p>
        <a href="https://work-1-czensuvescophapk.prod-runtime.all-hands.dev" class="btn">返回应用</a>
    </div>
</body>
</html>
  `);
});

// 错误页面
app.get('/reset-error', (req, res) => {
  const reason = req.query.reason || 'unknown';
  let message = '密码重置失败';
  
  switch (reason) {
    case 'missing_token':
      message = '缺少重置令牌';
      break;
    case 'invalid_token':
      message = '无效的重置令牌';
      break;
    case 'expired_token':
      message = '重置令牌已过期';
      break;
  }
  
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>密码重置失败 - WildPals</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
        }
        
        .error-icon {
            font-size: 64px;
            color: #dc3545;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 16px;
        }
        
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">❌</div>
        <h1>${message}</h1>
        <p>请重新请求密码重置或联系客服获取帮助。</p>
        <a href="https://work-1-czensuvescophapk.prod-runtime.all-hands.dev" class="btn">返回应用</a>
    </div>
</body>
</html>
  `);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 🚀 测试服务器启动在端口 ${PORT}`);
  console.log(`[${new Date().toISOString()}] 📧 测试邮箱: ls.na8@outlook.com`);
  console.log(`[${new Date().toISOString()}] 🔗 健康检查: http://localhost:${PORT}/health`);
});
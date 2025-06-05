export const getResetPasswordErrorHtml = () => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Password Reset Failed</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; text-align: center; }
        .error-icon { color: #dc3545; font-size: 48px; margin: 20px 0; }
        .message { margin: 20px 0; }
        .button { 
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">✕</div>
        <h2>Password Reset Failed</h2>
        <p class="message">The password reset link is invalid or has expired.</p>
        <p>Please request a new password reset link.</p>
        <a href="http://localhost:3000/forgot-password" class="button">Request New Link</a>
      </div>
    </body>
  </html>
`; 
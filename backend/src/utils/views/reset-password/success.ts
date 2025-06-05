export const getResetPasswordSuccessHtml = () => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Password Reset Success</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; text-align: center; }
        .success-icon { color: #28a745; font-size: 48px; margin: 20px 0; }
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
        <div class="success-icon">✓</div>
        <h2>Password Reset Successful</h2>
        <p class="message">Your password has been successfully reset.</p>
        <p>You can now log in with your new password.</p>
        <a href="http://localhost:3000/login" class="button">Go to Login</a>
      </div>
    </body>
  </html>
`; 
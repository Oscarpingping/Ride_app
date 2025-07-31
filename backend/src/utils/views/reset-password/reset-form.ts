import { PASSWORD_RULES } from '../../../config/passwordValidation';
import { SYSTEM_CONFIG } from '../../../config/system';

export const getResetPasswordFormHtml = (token: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Reset Password</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 15px; }
        input { width: 100%; padding: 8px; margin-top: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        .error { color: red; }
        .password-requirements {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <form id="resetForm">
          <div class="form-group">
            <label>New Password:</label>
            <input type="password" id="password" required minlength="${PASSWORD_RULES.MIN_LENGTH}">
            <div class="password-requirements">
              Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long and contain:
              <ul>
                <li>Uppercase letter</li>
                <li>Lowercase letter</li>
                <li>Number</li>
                <li>Special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>
          <div class="form-group">
            <label>Confirm Password:</label>
            <input type="password" id="confirmPassword" required minlength="${PASSWORD_RULES.MIN_LENGTH}">
          </div>
          <div class="error" id="error"></div>
          <button type="submit">Reset Password</button>
        </form>
      </div>
      <script>
        document.getElementById('resetForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const error = document.getElementById('error');
          
          // 验证密码复杂度
          const passwordRegex = ${PASSWORD_RULES.REGEX.toString()};
          if (!passwordRegex.test(password)) {
            error.textContent = '${PASSWORD_RULES.ERROR_MESSAGE}';
            return;
          }
          
          if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match';
            return;
          }
          
          try {
            const response = await fetch('${SYSTEM_CONFIG.PASSWORD_RESET.BASE_URL.replace('/reset-password', '')}/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                token: '${token}',
                password: password
              })
            });
            
            const result = await response.json();
            if (result.success) {
              window.location.href = '${SYSTEM_CONFIG.PASSWORD_RESET.SERVICE.SUCCESS_URL}';
            } else {
              error.textContent = result.error || 'Failed to reset password';
            }
          } catch (err) {
            error.textContent = 'An error occurred. Please try again.';
          }
        });
      </script>
    </body>
  </html>
`; 
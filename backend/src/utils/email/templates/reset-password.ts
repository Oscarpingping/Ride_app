interface ResetPasswordEmailParams {
  resetUrl: string;
}

export const getResetPasswordEmailContent = ({ resetUrl }: ResetPasswordEmailParams) => ({
  subject: 'Password Reset Request',
  text: `You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  html: `
    <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
    <p>Please click on the following link to complete the process:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `
});

export const getPasswordChangedEmailContent = (email: string) => ({
  subject: 'Your Password Has Been Changed',
  text: `This is a confirmation that the password for your account ${email} has just been changed.\n`,
  html: `<p>This is a confirmation that the password for your account ${email} has just been changed.</p>`
}); 
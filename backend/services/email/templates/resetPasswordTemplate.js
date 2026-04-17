export function resetPasswordTemplate(token) {
    return `
    <h2>Password Reset Request</h2>
    <p>You have requested to reset your password. Please click the link below to proceed:</p>
    <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    `;
}
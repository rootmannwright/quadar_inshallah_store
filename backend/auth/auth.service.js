// modules/auth/auth.service.js
import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import { saveVerificationToken } from '../utils/tokenStorage.js';
import { sendEmail } from '../services/email/sendEmail.js';
import { verifyEmailTemplate } from '../services/email/templates/verifyEmailTemplate.js';
import resetPasswordTemplate  from '../services/email/templates/resetPasswordTemplate.js';

export async function register(userData) {
  const { email, password } = userData;

  const user = await User.create({
    email,
    password,
    isVerified: false
  });

  const token = generateToken();

  await saveVerificationToken(user.id, token);

  await sendEmail({
    to: email,
    subject: 'Verifique sua conta',
    html: verifyEmailTemplate(token)
  });

  await resetPasswordTemplate({
    to: email,
    subject: 'Redefinir senha',
    html: resetPasswordTemplate(token)
  });

  return user;
}
// modules/token/tokenUtils.js

import crypto from 'crypto';
import { Token } from './token.model.js';

const TOKEN_EXPIRATION_MINUTES = 10;

// ======================
// HELPERS
// ======================
function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ======================
// CREATE TOKEN
// ======================
export async function createToken({ userId, type }) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  await Token.create({
    userId,
    tokenHash,
    type,
    expiresAt,
    used: false
  });

  return rawToken; // envia por email
}

// ======================
// VALIDATE TOKEN
// ======================
export async function validateToken({ token, type }) {
  const tokenHash = hashToken(token);

  const storedToken = await Token.findOne({
    tokenHash,
    type,
    used: false
  });

  if (!storedToken) {
    throw new Error('Token inválido');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Token expirado');
  }

  return storedToken;
}

// ======================
// MARK AS USED
// ======================
export async function markTokenAsUsed(tokenId) {
  await Token.findByIdAndUpdate(tokenId, {
    used: true
  });
}
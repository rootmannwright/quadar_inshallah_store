// modules/token/token.service.js

import crypto from 'crypto';
import { Token } from './token.model.js';

const TOKEN_EXPIRATION_MINUTES = 10;

// gerar token seguro
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// hash do token (NUNCA salva o token puro)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// criar token
export async function createToken({ userId, type }) {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  await Token.create({
    userId,
    tokenHash,
    type,
    expiresAt
  });

  return rawToken;
}

export async function verifyToken({ userId, token, type }) {
    const tokenHash = hashToken(token);

    const storedToken = await Token.findOne({
        userId,
        tokenHash,
        type,
        used: false,
        expiresAt: { $gt: new Date()}
    });

    if (!storedToken) {
        throw new Error('Token are expired! Please request a new one.');
    }

    if (!storedToken.expiresAt < new Date()) {
        throw new Error('Token are expired! Please request a new one.');
    }

    return storedToken;
}

export async function markTokenAsUsed(tokenId) {
    await Token.findByIdAndUpdate(tokenId, { used: true });
}

export async function deleteTokensForUser(userId, type) {
    await Token.deleteMany({ userId, type }, { used: false },
        { used: true }
    );
}
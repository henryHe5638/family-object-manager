import crypto from 'crypto';

/**
 * 后端密码解密和验证工具
 * 与前端的加密逻辑配合使用
 */

// 与前端保持一致的盐值
const CRYPTO_SALT = 'family-object-manager-2026';

/**
 * 加密密码（与前端逻辑一致）
 * @param password 原始密码
 * @returns 加密后的密码哈希值
 */
export const encryptPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password + CRYPTO_SALT).digest('hex');
};

/**
 * 验证客户端加密的密码是否与存储的哈希匹配
 * @param clientEncryptedPassword 客户端发送的加密密码
 * @param storedHash 数据库中存储的 bcrypt 哈希
 * @param originalPassword 用户的原始密码（用于验证）
 * @returns 是否匹配
 */
export const verifyClientEncryptedPassword = (
  clientEncryptedPassword: string,
  originalPassword: string
): boolean => {
  const expectedHash = encryptPassword(originalPassword);
  return clientEncryptedPassword === expectedHash;
};

import CryptoJS from 'crypto-js';

/**
 * 密码加密工具
 * 使用 SHA256 哈希算法对密码进行加密
 * 注意：这只是增加传输层的安全性，服务端仍会使用 bcrypt 进行二次加密存储
 */

// 使用固定的盐值用于客户端加密（可以配置到环境变量）
const CRYPTO_SALT = 'family-object-manager-2026';

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码哈希值
 */
export const encryptPassword = (password: string): string => {
  // 使用 SHA256 + 盐值进行加密
  const hash = CryptoJS.SHA256(password + CRYPTO_SALT);
  return hash.toString(CryptoJS.enc.Hex);
};

/**
 * 验证密码强度
 * @param password 原始密码
 * @returns 密码强度信息
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
} => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: '密码长度至少为6位',
      strength: 'weak'
    };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  // 检查密码复杂度
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return {
    isValid: true,
    message: strength === 'strong' ? '密码强度：强' : strength === 'medium' ? '密码强度：中' : '密码强度：弱',
    strength
  };
};

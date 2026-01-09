// src/common/utils/bcrypt.util.spec.ts
import { BcryptUtil } from './bcrypt.util';

describe('BcryptUtil', () => {
  const password = 'Pass@123456';

  /**
   * 🧠  Potential Tests for BcryptUtil:
   *  1️⃣ Should hash a password and return a string
   *  2️⃣ Should validate a correct password against its hash (true)
   *  3️⃣ Should reject an incorrect password (false)
   *  4️⃣ Should generate different hashes for the same password (due to salt)
   *  5️⃣ Should handle empty or invalid inputs gracefully (optional defensive test)
   */

  describe('hashPassword()', () => {
    it('should hash a password and return a string', async () => {
      // 🅰️ Arrange
      const plainPassword = password;

      // 🅰️ Act
      const hash = await BcryptUtil.hashPassword(plainPassword);

      // 🅰️ Assert
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
      expect(hash).not.toBe(plainPassword); // should never match the original password
    });

    it('should produce a unique hash each time (due to salting)', async () => {
      // 🅰️ Arrange
      const plainPassword = password;

      // 🅰️ Act
      const hash1 = await BcryptUtil.hashPassword(plainPassword);
      const hash2 = await BcryptUtil.hashPassword(plainPassword);

      // 🅰️ Assert
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('comparePassword()', () => {
    it('should return true for correct password', async () => {
      // 🅰️ Arrange
      const plainPassword = password;
      const hash = await BcryptUtil.hashPassword(plainPassword);

      // 🅰️ Act
      const isValid = await BcryptUtil.comparePassword(plainPassword, hash);

      // 🅰️ Assert
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // 🅰️ Arrange
      const plainPassword = password;
      const wrongPassword = 'Wrong@123';
      const hash = await BcryptUtil.hashPassword(plainPassword);

      // 🅰️ Act
      const isValid = await BcryptUtil.comparePassword(wrongPassword, hash);

      // 🅰️ Assert
      expect(isValid).toBe(false);
    });

    // it('should throw or handle invalid hash input gracefully', async () => {
    //   // 🅰️ Arrange
    //   const invalidHash = 'not_a_real_hash';

    //   // 🅰️ Act & 🅰️ Assert
    //   await expect(
    //     BcryptUtil.comparePassword(password, invalidHash),
    //   ).rejects.toThrow();
    // });
  });
});

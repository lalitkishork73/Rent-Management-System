export class OtpUtil {
  static generateOtp(length = 6): string {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .substring(0, length);
  }

  static isOtpExpired(createdAt: Date, expiryMinutes = 5): boolean {
    const now = new Date();
    const diff = (now.getTime() - createdAt.getTime()) / 1000 / 60;
    return diff > expiryMinutes;
  }
}

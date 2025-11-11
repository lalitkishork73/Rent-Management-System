import { OtpUtil } from './otp.util';

describe('OtpUtil', () => {
  it('generate 6 digit numeric otp', () => {
    const otp = OtpUtil.generateOtp();
    expect(typeof otp).toBe('string');
    expect(otp).toMatch(/^\d{6}$/);
  });
});

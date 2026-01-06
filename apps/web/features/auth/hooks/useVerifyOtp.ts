import { useMutation } from '@tanstack/react-query';
import { verifyOTP } from '@/features/auth/api/auth.api';

/**
 * Verifies email OTP
 * - Marks user as verified
 * - Does NOT log user in
 */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOTP,
    
  });
}

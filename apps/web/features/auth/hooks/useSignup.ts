import { useMutation } from '@tanstack/react-query';
import { signup } from '@/features/auth/api/auth.api';

/**
 * Signup mutation
 * - Creates user
 * - Triggers OTP email
 * - Does NOT authenticate user
 */
export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}

import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/auth.api';
import { setAccessToken } from '@/shared/store/authStore';

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });
}

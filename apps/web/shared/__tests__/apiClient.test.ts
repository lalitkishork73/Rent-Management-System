import { apiClient } from '@/shared/lib/apiClient';
import { setAccessToken } from '@/shared/store/authStore';

describe('apiClient refresh flow', () => {
  it('refreshes token and retries original request', async () => {
    // Initial expired token
    setAccessToken('expired-token');

    const response = await apiClient.get('/protected');

    expect(response.data.success).toBe(true);
  });
});

import {
  getAccessToken,
  setAccessToken,
  clearAuth,
  setAuthUser,
} from '@/shared/store/authStore';

describe('authStore', () => {
  it('sets and gets access token', () => {
    setAccessToken('abc-token');
    expect(getAccessToken()).toBe('abc-token');
  });

  it('clears auth state', () => {
    setAccessToken('token');
    setAuthUser({
      id: '1',
      name: 'Lalit',
      email: 'test@mail.com',
      roles: ['USER'],
    });

    clearAuth();

    expect(getAccessToken()).toBeNull();
  });
});

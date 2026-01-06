import { cookies } from 'next/headers';

/**
 * Checks if access token exists (server-side)
 * This does NOT validate token — backend will do that later
 */
export function isLoggedInServer(): boolean {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken'); // or whatever name you use

  return Boolean(accessToken?.value);
}

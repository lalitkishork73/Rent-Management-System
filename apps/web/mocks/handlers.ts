import { http, HttpResponse } from 'msw';

let accessToken = 'initial-token';

export const handlers = [
  http.post('/auth/refresh', () => {
    accessToken = 'refreshed-token';

    return HttpResponse.json({
      accessToken,
    });
  }),

  http.get('/protected', ({ request }) => {
    const auth = request.headers.get('authorization');

    if (auth !== 'Bearer refreshed-token') {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json({ success: true });
  }),

  http.post('/auth/login', async ({ request }) => {
    const body:any = await request.json();

    if (body.email === 'fail@mail.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401 }
      );
    }

    return HttpResponse.json({
      accessToken: 'mock-access-token',
    });
  }),

  http.post('/auth/signup', () => {
    return HttpResponse.json({
      message: 'Signup successful, please verify OTP',
    });
  }),

  http.post('/auth/verify-otp', () => {
    return HttpResponse.json({
      message: 'OTP verified',
    });
  }),

  http.post('/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'refreshed-token',
    });
  }),

  http.get('/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Lalit',
      email: 'lalit@mail.com',
      roles: ['USER'],
    });
  }),

  http.post('/auth/signup', () => {
    return HttpResponse.json({
      message: 'Signup successful, please verify OTP',
    });
  }),

  http.post('/auth/verify-otp', () => {
    return HttpResponse.json({
      message: 'OTP verified',
    });
  }),
  http.get('/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Lalit',
      email: 'lalit@mail.com',
      roles: ['USER'],
    });
  }),
];

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
];

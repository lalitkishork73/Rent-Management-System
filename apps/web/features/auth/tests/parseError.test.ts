import { parseError } from '@/shared/lib/parseError';

test('handles native error', () => {
  const err = new Error('Boom');
  const parsed = parseError(err);
  expect(parsed.message).toBe('Boom');
});
    
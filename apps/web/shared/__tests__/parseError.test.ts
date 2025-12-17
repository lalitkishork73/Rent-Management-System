import { parseError } from '@/shared/lib/parseError';

describe('parseError', () => {
  it('handles native Error', () => {
    const error = new Error('Boom');
    const parsed = parseError(error);

    expect(parsed.message).toBe('Boom');
  });

  it('handles unknown error', () => {
    const parsed = parseError(null);

    expect(parsed.message).toBe('Unexpected error occurred');
  });
});

import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// Start MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

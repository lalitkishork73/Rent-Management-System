import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignupForm } from '../SignupForm';

/* --------------------------------
   Mock useSignup hook
--------------------------------- */
vi.mock('@/features/auth/hooks/useSignup', () => ({
  useSignup: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

describe('SignupForm', () => {
  it('renders all fields', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors', async () => {
    render(<SignupForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      await screen.findByText(/name must be at least/i)
    ).toBeInTheDocument();
  });

  it('accepts valid input', () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Lalit' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'lalit@mail.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      screen.queryByText(/name must be at least/i)
    ).not.toBeInTheDocument();
  });
});

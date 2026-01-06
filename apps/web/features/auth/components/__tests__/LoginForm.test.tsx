import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../LoginForm';

/* --------------------------------
   Mock useLogin hook
--------------------------------- */
vi.mock('@/features/auth/hooks/useLogin', () => ({
    useLogin: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
    }),
}));

describe('LoginForm', () => {
    it('renders email and password inputs', () => {
        render(<LoginForm />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('shows validation errors on empty submit', async () => {
        render(<LoginForm />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(
            await screen.findByText(/enter a valid email/i)
        ).toBeInTheDocument();
    });

    it('submits valid data', () => {
        render(<LoginForm />);

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@mail.com' },
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: '123456' },
        });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // No error should appear
        expect(
            screen.queryByText(/enter a valid email/i)
        ).not.toBeInTheDocument();
    });
});

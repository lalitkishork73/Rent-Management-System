import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OTPForm } from '../OTPForm';

/* --------------------------------
   Mock useVerifyOtp hook
--------------------------------- */
vi.mock('@/features/auth/hooks/useVerifyOtp', () => ({
    useVerifyOtp: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
    }),
}));

describe('OTPForm (shadcn InputOTP)', () => {
    it('renders OTP slots', () => {
        render(<OTPForm email="test@mail.com" />);

        // InputOTP renders 6 inputs internally
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);
    });

    it('shows validation error when OTP is incomplete', async () => {
        const user = userEvent.setup();
        render(<OTPForm email="test@mail.com" />);

        const inputs: any = screen.getAllByRole('textbox');

        // Type only 2 digits
        await user.type(inputs[0], '1');
        await user.type(inputs[1], '2');

        await user.click(
            screen.getByRole('button', { name: /verify otp/i })
        );

        expect(
            await screen.findByText(/otp must be 6 digits/i)
        ).toBeInTheDocument();
    });

    it('accepts full 6-digit OTP', async () => {
        const user = userEvent.setup();
        render(<OTPForm email="test@mail.com" />);

        const inputs:any = screen.getAllByRole('textbox');

        // Type all 6 digits
        await user.type(inputs[0], '1');
        await user.type(inputs[1], '2');
        await user.type(inputs[2], '3');
        await user.type(inputs[3], '4');
        await user.type(inputs[4], '5');
        await user.type(inputs[5], '6');

        await user.click(
            screen.getByRole('button', { name: /verify otp/i })
        );

        // No validation error should be present
        expect(
            screen.queryByText(/otp must be 6 digits/i)
        ).not.toBeInTheDocument();
    });
});

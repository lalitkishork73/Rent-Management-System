'use client';

import * as React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useRouter } from 'next/navigation';

import { useVerifyOtp } from '@/features/auth/hooks/useVerifyOtp';
import { useResendOtp } from '@/features/auth/hooks/useResendOtp';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { otpSchema } from '../schemas/otp.schema';

export function OTPForm ({ email }: { email: string }) {
    const router = useRouter();
    const verifyOtpMutation = useVerifyOtp();
    const resendOtpMutation = useResendOtp();

    const [otp, setOtp] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    /* -------------------------
       Resend Timer
    -------------------------- */
    const RESEND_TIME = 60; // seconds
    const [timeLeft, setTimeLeft] = React.useState(RESEND_TIME);

    React.useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    /* -------------------------
       Redirect after success
    -------------------------- */
    React.useEffect(() => {
        console.log(verifyOtpMutation)
        if (verifyOtpMutation.isSuccess) {
            // Small delay for UX
            const t = setTimeout(() => {
                router.replace('/'); // or '/auth' if you have a dedicated auth page
            }, 1500);

            return () => clearTimeout(t);
        }
    }, [verifyOtpMutation.isSuccess, router]);

    /* -------------------------
       Submit OTP
    -------------------------- */
    function onSubmit (e: React.FormEvent) {
        e.preventDefault();

        const parsed:any = otpSchema.safeParse({ email, otp });
        if (!parsed.success) {
            setError(parsed.error.errors[0].message);
            return;
        }

        setError(null);
        verifyOtpMutation.mutate(parsed.data);
    }

    /* -------------------------
       Resend OTP
    -------------------------- */
    function handleResendOtp () {
        resendOtpMutation.mutate(email, {
            onSuccess: () => {
                setTimeLeft(RESEND_TIME);
                setOtp('');
            },
        });
    }

    return (
        <div className="space-y-6 text-black">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-serif">Verify OTP</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-2">
                    <Label>One-Time Password</Label>

                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        pattern={REGEXP_ONLY_DIGITS}
                    >
                        <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <InputOTPSlot key={i} index={i} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {/* Errors */}
                {error && (
                    <p className="text-center text-sm text-destructive">{error}</p>
                )}

                {verifyOtpMutation.isError && (
                    <p className="text-center text-sm text-destructive">
                        {(verifyOtpMutation.error as any).message}
                    </p>
                )}

                {verifyOtpMutation.isSuccess && (
                    <p className="text-center text-sm text-green-600">
                        OTP verified successfully. Redirecting to login…
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={otp.length < 6 || verifyOtpMutation.isPending}
                >
                    {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify OTP'}
                </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center text-sm">
                {timeLeft > 0 ? (
                    <p className="text-muted-foreground">
                        Resend OTP in {timeLeft}s
                    </p>
                ) : (
                    <Button
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={resendOtpMutation.isPending}
                    >
                        {resendOtpMutation.isPending
                            ? 'Resending…'
                            : 'Resend OTP'}
                    </Button>
                )}
            </div>
        </div>
    );
}

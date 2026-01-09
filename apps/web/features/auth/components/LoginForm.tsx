'use client';

import * as React from 'react';
import { useLogin } from '@/features/auth/hooks/useLogin';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoginFormValues, loginSchema } from '../schemas/login.schema';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useRouter } from 'next/navigation';


/* -------------------------------
   Component
-------------------------------- */
export function LoginForm () {
    const loginMutation = useLogin();
    const { loginWithGoogle } = useGoogleAuth()

    const router = useRouter()


    const [form, setForm] = React.useState<LoginFormValues>({
        email: '',
        password: '',
        clientType:'web'
    });

    const [errors, setErrors] = React.useState<Partial<LoginFormValues>>({});

    /* --------------------------------
   Handle login success
--------------------------------- */
    React.useEffect(() => {
        if (!loginMutation.isSuccess) return;

        const data: any = loginMutation.data;


        // 🔐 If email NOT verified → OTP
        if (data?.data?.user?.isEmailVerified === false) {
            router.replace(`/otp?email=${encodeURIComponent(data?.data?.user?.email)}`);
            return;
        }

        // ✅ Fully authenticated
        router.replace('/home');
    }, [loginMutation.isSuccess, loginMutation.data, router]);


    function onSubmit (e: React.FormEvent) {
        e.preventDefault();

        const parsed: any = loginSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<LoginFormValues> = {};
            parsed.error?.errors.forEach((err: any) => {
                const key = err.path[0] as keyof LoginFormValues;
                fieldErrors[key] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        loginMutation.mutate(parsed?.data);
    }


    return (
        <div className="space-y-6 text-black">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-serif">Welcome Back</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter your email and password to access your account
                </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1 text-black">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                </div>

                {/* API Error */}
                {loginMutation.isError && (
                    <p className="text-sm text-destructive">
                        {(loginMutation.error as any).message}
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                </Button>
            </form>

            <Separator />

            {/* Google Login (placeholder) */}
            <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
                Sign in with Google
            </Button>
        </div>
    );
}

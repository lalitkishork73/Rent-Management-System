'use client';

import * as React from 'react';
import { useSignup } from '@/features/auth/hooks/useSignup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SignupFormValues, signupSchema } from '../schemas/signup.schema';
import { useRouter } from 'next/navigation';





/* -------------------------------
   Component 
-------------------------------- */
export function SignupForm () {
    const signupMutation = useSignup();
    const router = useRouter();


    const [form, setForm] = React.useState<SignupFormValues>({
        name: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = React.useState<Partial<SignupFormValues>>({});

    React.useEffect(() => {
        if (signupMutation.isSuccess) {
            router.push(`/otp?email=${encodeURIComponent(form.email)}`);
        }
    }, [signupMutation.isSuccess, form.email, router]);


    function onSubmit (e: React.FormEvent) {
        e.preventDefault();

        const parsed: any = signupSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<SignupFormValues> = {};

            parsed.error.errors.forEach((err: any) => {
                const key = err.path[0] as keyof SignupFormValues;
                fieldErrors[key] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        signupMutation.mutate(parsed.data);
    }

    const OnGoogleLogin=()=>{

        
    }

    return (
        <div className="space-y-6 text-black">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-serif">Create an Account</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sign up to start finding and managing properties
                </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                    
                </div>

                {/* Email */}
                <div className="space-y-1">
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
                {signupMutation.isError && (
                    <p className="text-sm text-destructive">
                        {(signupMutation.error as any).message}
                    </p>
                )}

                {/* Success */}
                {signupMutation.isSuccess && (
                    <p className="text-sm text-green-600">
                        Signup successful. Check your email for OTP.
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={signupMutation.isPending}
                >
                    {signupMutation.isPending ? 'Creating account…' : 'Sign Up'}
                </Button>
            </form>

            <Separator />

            {/* Google Signup */}
            <Button variant="outline" className="w-full">
                Sign up with Google
            </Button>
        </div>
    );
}

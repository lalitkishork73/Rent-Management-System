'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Button } from '@/components/ui/button';

export function AuthSwitcher () {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    return (
        <>
            {mode === 'login' ? <LoginForm /> : <SignupForm />}

            <div className="mt-6 text-center text-sm text-black">
                {mode === 'login' ? (
                    <>
                        Don’t have an account?{' '}
                        <Button variant="link" onClick={() => setMode('signup')}>
                            Sign up
                        </Button>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Button variant="link" onClick={() => setMode('login')}>
                            Sign in
                        </Button>
                    </>
                )}
            </div>
        </>
    );
}

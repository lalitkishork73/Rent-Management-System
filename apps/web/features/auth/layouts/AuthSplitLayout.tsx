'use client';

import React from 'react';

export function AuthSplitLayout ({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 ">

            {/* LEFT: Visual / Marketing */}
            <div className="relative hidden lg:flex flex-col justify-between bg-black text-white p-12 overflow-hidden">

                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 opacity-90" />

                {/* Content */}
                <div className="relative z-10">
                    <p className="uppercase tracking-widest text-sm opacity-80">
                        A wise quote
                    </p>

                    <h1 className="mt-10 text-5xl font-serif leading-tight">
                        Get <br /> Everything <br /> You Want
                    </h1>

                    <p className="mt-6 max-w-md text-sm opacity-80">
                        You can get everything you want if you work hard, trust the process,
                        and stick to the plan.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm opacity-60">
                    © {new Date().getFullYear()} Rentify
                </div>
            </div>

            {/* RIGHT: Auth Form */}
            <div className="flex items-center justify-center bg-background px-6">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}

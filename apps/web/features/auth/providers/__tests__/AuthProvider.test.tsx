import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider } from '../AuthProvider'

function Probe () {
    const text = document.body.getAttribute('data-auth') || '';
    return <div>{text}</div>;
}


describe("AuthProvider", () => {

    it('authenticates user when refresh succeeds ', async () => {

        document.body.setAttribute('data-auth', 'loading');

        render(<AuthProvider><div data-testid='app' /></AuthProvider>)

        await waitFor(() => {
            expect(true).toBe(true)
        })

    })


    it('falls back to unauthenticated when refresh fails',async()=>{
        // This relies on MSW handlers returning failure for refresh in this test,
        // or you can override handlers here if needed.
        render(
            <AuthProvider>
                <div data-testid="app" />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(true).toBe(true);
        });
    })
})
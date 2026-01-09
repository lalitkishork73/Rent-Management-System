'use client'

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../providers/AuthProvider"

export function ProtectedRoute ({ children }: { children: ReactNode }) {
    const route = useRouter()
    const { status } = useAuthContext();

    useEffect(() => {

        if (status === 'unauthenticated') {
            route.replace('/auth')
        }
    }, [status, route])


    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">
            <p className="text-sm text-muted-foreground">Checking session…</p>
        </div>
    }

    if (status === 'authenticated') {
        return <>
            {children}
        </>
    }

    return null;

}
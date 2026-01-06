'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
    useAuthStore,
    setAccessToken,
    setAuthUser,
    clearAuth,
} from '@/shared/store/authStore'
import { refresh, getMe } from '../api/auth.api'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
    status: AuthStatus
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.user)
    const accessToken = useAuthStore((s) => s.accessToken)

    const [bootstrapped, setBootstrapped] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function bootstrap () {
            try {
                const res: any = await refresh()
                const token = res?.data?.accessToken

                if (cancelled) return

                if (token) {
                    setAccessToken(token)
                }

                const me: any = await getMe()
                if (cancelled) return

                setAuthUser(me)
            } catch {
                if (cancelled) return
                clearAuth()
            } finally {
                if (!cancelled) setBootstrapped(true)
            }
        }

        bootstrap()

        return () => {
            cancelled = true
        }
    }, [])

    const status: AuthStatus = useMemo(() => {
        if (!bootstrapped) return 'loading'
        if (user && accessToken) return 'authenticated'
        return 'unauthenticated'
    }, [bootstrapped, user, accessToken])

    



    return (
        <AuthContext.Provider value={{ status }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext () {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return ctx
}

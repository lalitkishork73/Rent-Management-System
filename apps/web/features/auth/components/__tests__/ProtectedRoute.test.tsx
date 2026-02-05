import { expect, it, describe, vi } from 'vitest'
import { screen, render, fireEvent, } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'

const mockAuthContext = vi.fn();

vi.mock('../providers/AuthProvider', () => ({
    useAuthContext: () => mockAuthContext(),
}))
describe('ProtectedRouteTest', () => {

    /* 
    --------------------------
     Loading Test   
    --------------------------
    */
    it('shows loader when status is loading', () => {
        render(<ProtectedRoute>
            <div>Secret</div>
        </ProtectedRoute>)

        expect(screen.getByText('Checking session...')).toBeInTheDocument()
    })

    /*
    --------------------------
     UnAuthenticated Test   
    --------------------------
    */

    it('redirects when unauthenticated', async () => {
        mockAuthContext.mockReturnValue({ status: 'unauthenticated' })
        render(<ProtectedRoute>
            <div>Secret</div>
        </ProtectedRoute>)

        expect(await screen.findByText('Secret')).not.toBeInTheDocument()
    })

    /*
    --------------------------
     Authenticate Test   
    --------------------------
    */

    it('render children when authenticated', async () => {
        mockAuthContext.mockReturnValue({ status: 'authenticated' })

        render(<ProtectedRoute>
            Secret
        </ProtectedRoute>)
        expect(await screen.findByText('Secret')).toBeInTheDocument()
    })



})
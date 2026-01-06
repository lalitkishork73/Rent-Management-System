import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/features/auth/providers/AuthProvider';
import { DropdownMenuUser } from './HeaderMenu';
import { ButtonSkeleton } from '@/shared/skeleton/ButtonSkelton'
import { CircleSkeleton } from '@/shared/skeleton/CircleSkelton'


export function RentSwitchTab () {
    const { status } = useAuthContext()

    if (status === 'authenticated') return <>
        <Button>Tenant</Button>
        <Button>Landlord</Button>
    </>

    if (status === 'loading') return <>
        <ButtonSkeleton />
        <ButtonSkeleton />
    </>
    return null;
}

export function UserAuthTransition () {
    const { status } = useAuthContext()

    if (status === 'authenticated') return <DropdownMenuUser />
    if (status === 'loading') return <CircleSkeleton />

    return <Button asChild variant={'ghost'}>
        <Link href="/auth">Login</Link>
    </Button>

}
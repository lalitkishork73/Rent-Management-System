'use client';

import Link from 'next/link';
import { RentSwitchTab, UserAuthTransition } from './HeaderOption';

export function Header () {

    return (
        <div className="border-b w-full  flex justify-center items-center">
            <div className=" flex h-16 w-full  items-center justify-between px-4">
                <Link href="/" className="text-xl font-semibold">
                    RentMAG
                </Link>

                <nav className="flex items-center gap-4">
                    <RentSwitchTab />
                    <UserAuthTransition />
                </nav>
            </div>
        </div>
    );
}

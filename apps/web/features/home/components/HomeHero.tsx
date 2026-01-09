import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { Input } from "@/components/ui/input"


export function InputWithButton () {
    return (
        <div className="flex w-full max-w-sm items-center gap-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit" variant="outline">
                Subscribe
            </Button>
        </div>
    )
}


export function HomeHero () {
    return (
        <section className="bg-linear-to-r from-cyan-500 to-blue-500 max-h-screen py-20 w-full  ">
            <div className="mx-auto w-full h-full text-center flex flex-col justify-center items-center ">
                <h1 className="text-6xl font-bold text-white">
                    Find your next home, without hassle
                </h1>

                <p className="mt-4 text-lg text-white">
                    Discover apartments, PGs, and rental properties across India. Connect directly with landlords and move into your new home.
                </p>

                <div className="my-6 p-3 rounded-3xl flex justify-between gap-4 bg-white items-center md:w-1/2">
                    <div>
                        <MapPin />
                    </div>
                    <Input placeholder='Search city, locality, or property'/>
                    <Button size="lg" className='px-4'>
                        <Search /> Search</Button>
                    {/*<Button size="lg" variant="outline">
                        List Your Property
                    </Button> */}
                </div>
            </div>
        </section>
    );
}

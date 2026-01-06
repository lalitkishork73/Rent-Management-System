import { mockProperties } from '../data/mockProperties';
import { PropertyCard } from './PropertyCard';
import { Button } from '@/components/ui/button';
export function FeaturedProperties () {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4">
                <h2 className="mb-6 text-2xl font-semibold">
                    Featured Properties
                </h2>
                <div className='flex justify-between items-center py-2'>
                    <p>Handpicked properties for quality living</p>
                    <Button >View</Button>

                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mockProperties.map((p) => (
                        <PropertyCard key={p.id} {...p} />
                    ))}
                </div>
            </div>
        </section>
    );
}

import { FlashCard } from './FlashCard';
import { data } from '../data/FlashCardData'

export function PropertySearch () {
    return (
        <div id="search" className="py-10 flex flex-col items-center justify-center w-full h-1/2">
            <h1 className='text-4xl font-bold py-5 text-center'>Why Choose RentFlow?</h1>
            <p className='py-2 pb-10'>We make finding and renting your next home simple, secure, and stress-free.</p>

            <div className='flex justify-center items-center gap-5 flex-col md:flex-row flex-wrap'>

                {data.map((item) => (
                    <FlashCard key={item.id} {...item} />
                ))}
            </div>
        </div>
    );
}



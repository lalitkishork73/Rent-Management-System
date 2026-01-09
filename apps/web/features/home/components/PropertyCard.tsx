import { Card, CardContent, CardHeader } from '@/components/ui/card';

type Props = {
    title: string;
    location: string;
    price: string;
    image: string;
};

export function PropertyCard ({ title, location, price, image }: Props) {
    return (
        <Card className=''>
            <CardHeader>
                <img src={image} alt='img' />
            </CardHeader>
            <CardHeader>
                <h3 className="text-lg font-semibold">{title}</h3>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{location}</p>
                <p className="mt-2 font-medium">{price}</p>
            </CardContent>
        </Card>
    );
}

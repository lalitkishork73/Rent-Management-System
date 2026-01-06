import { Card, CardContent, CardHeader } from '@/components/ui/card';


type flash = {
    title: string;
    description: string;
    icon: React.ElementType;
}
export function FlashCard ({ title, description, icon: Icon }: flash) {
    return (
        <Card className=' bg-gray-100 max-w-100 h-50'>
            <CardHeader>
                <Icon />
            </CardHeader>
            <CardHeader>
                <h3 className="text-lg font-semibold">{title}</h3>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}
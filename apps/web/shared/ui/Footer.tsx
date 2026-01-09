export function Footer () {
    return (
        <footer className="border-t py-6 h-1/2 flex flex-col justify-end items-center">
            <div className="mx-auto px-4 text-sm text-muted-foreground">
                © {new Date().getFullYear()} RentMag. All rights reserved.
            </div>
        </footer>
    );
}

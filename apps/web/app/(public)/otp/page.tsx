import { AuthSplitLayout } from '@/features/auth/layouts/AuthSplitLayout';
import { OTPForm } from '@/features/auth/components/OTPForm';

type PageProps = {
    searchParams: Promise<{
        email?: string;
    }>;
};

export default async function OTPPage ({ searchParams }: PageProps) {
    const { email } = await searchParams;

    if (!email) {
        return (
            <AuthSplitLayout>
                <p className="text-center text-sm text-destructive">
                    Email is missing. Please sign up again.
                </p>
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout>
            <OTPForm email={decodeURIComponent(email)} />
        </AuthSplitLayout>
    );
}

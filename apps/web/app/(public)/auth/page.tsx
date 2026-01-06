import { AuthSplitLayout } from '@/features/auth/layouts/AuthSplitLayout';
import { AuthSwitcher } from '@/features/auth/components/AuthSwitcher';
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute';

export default function AuthPage () {
    return (
        <PublicOnlyRoute>
            <AuthSplitLayout>
                <AuthSwitcher />
            </AuthSplitLayout>
        </PublicOnlyRoute>
    );
}

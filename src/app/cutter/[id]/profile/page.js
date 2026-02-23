'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EditProfileForm from '@/components/profile/edit-profile-form';
import ChangePasswordForm from '@/components/profile/change-password-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CutterProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id;
    const { currentUser, userData, isLoadingUser } = useAuth();

    // 🔒 ROUTE GUARD: Only the matching Cutter can access
    useEffect(() => {
        if (isLoadingUser) return;
        const storedUserId = localStorage.getItem('stitch_user_id');
        const storedRole = localStorage.getItem('stitch_user_role');

        if (!currentUser || storedUserId !== userId || storedRole !== 'Cutter') {
            router.push('/');
        }
    }, [currentUser, isLoadingUser, userId, router]);

    if (isLoadingUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!currentUser || !userData) return null;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/cutter/${userId}`)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
                        <p className="text-xs text-muted-foreground">
                            {userData?.name ? `${userData.name} — Cutter` : 'Manage your account'}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="grid gap-6">
                    <EditProfileForm />
                    <ChangePasswordForm />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-8 px-4">
                    If you need to change your email or role, please contact your administrator.
                </p>
            </main>
        </div>
    );
}

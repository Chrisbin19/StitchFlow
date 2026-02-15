'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Header from '@/components/tailor/header';
import TailorStats from '@/components/tailor/tailor-stats';
import AssignedGarmentsTable from '@/components/tailor/assigned-garments-table';
import MeasurementDetails from '@/components/tailor/measurement-details';
import WorkProgress from '@/components/tailor/work-progress';
import CompletedGarments from '@/components/tailor/completed-garments';


export default function TailorDashboard() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verify user and fetch data
        const verifyAndFetchUser = async () => {
            try {
                // Security check: verify localStorage matches URL
                const storedUserId = localStorage.getItem('stitch_user_id');
                const storedRole = localStorage.getItem('stitch_user_role');

                if (!storedUserId || storedUserId !== userId) {
                    console.error('Unauthorized access attempt');
                    router.push('/');
                    return;
                }

                if (storedRole !== 'Tailor') {
                    console.error('Role mismatch');
                    router.push('/');
                    return;
                }

                // Fetch user data from Firestore
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserData({ id: userId, ...userDoc.data() });
                } else {
                    console.error('User not found');
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        verifyAndFetchUser();
    }, [userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return null; // Router will redirect
    }

    return (
        <div className="min-h-screen bg-background">
            <Header userId={userId} userName={userData.name} />

            <main className="p-6">
                <div className="grid gap-6">
                    {/* Top Stats */}
                    <TailorStats userId={userId} />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Assigned Garments */}
                        <div className="lg:col-span-2">
                            <AssignedGarmentsTable userId={userId} />
                        </div>

                        {/* Right Column - Measurements and Progress */}
                        <div className="flex flex-col gap-6">
                            <MeasurementDetails userId={userId} />
                            <WorkProgress userId={userId} />
                        </div>
                    </div>

                    {/* Completed Garments */}
                    <CompletedGarments userId={userId} />
                </div>
            </main>
        </div>
    );
}

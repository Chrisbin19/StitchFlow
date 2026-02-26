'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Header from '@/components/cutter/header';
import CutterStats from '@/components/cutter/cutter-stats';
import AssignedOrdersTable from '@/components/cutter/assigned-orders-table';
import FabricRackInfo from '@/components/cutter/fabric-rack-info';
import TaskProgress from '@/components/cutter/task-progress';
import CompletedTasks from '@/components/cutter/completed-tasks';


import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';
// ... rest of your imports


export default function CutterDashboard() {
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

                if (storedRole !== 'Cutter') {
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
                    <CutterStats userId={userId} />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Assigned Orders */}
                        <div className="lg:col-span-2">
                            <AssignedOrdersTable userId={userId} />
                        </div>

                        {/* Right Column - Fabric and Progress */}
                        <div className="flex flex-col gap-6">
                            <FabricRackInfo userId={userId} />
                            <TaskProgress userId={userId} />
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <CompletedTasks userId={userId} />
                </div>
            </main>
        </div>
    );
}

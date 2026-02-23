'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Shield, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditProfileForm() {
    const { currentUser, userData, refreshUserData } = useAuth();

    const [name, setName] = useState(userData?.name || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name.trim()) {
            setError('Name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                name: name.trim(),
                phone: phone.trim(),
            });

            // Refresh AuthContext so header updates immediately
            await refreshUserData();

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        return new Date(timestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Profile Information
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                {success && (
                    <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Profile updated successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Editable: Name */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground transition-all outline-none focus:bg-background focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500"
                        />
                    </div>

                    {/* Editable: Phone */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <Phone className="w-3 h-3" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground transition-all outline-none focus:bg-background focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500"
                        />
                    </div>

                    {/* Read-only: Email */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <div className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground cursor-not-allowed">
                            {userData?.email || currentUser?.email || '—'}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed. Contact Admin for assistance.</p>
                    </div>

                    {/* Read-only: Role & Joined */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                                <Shield className="w-3 h-3" /> Role
                            </label>
                            <div className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground cursor-not-allowed capitalize">
                                {userData?.role || '—'}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                                <Calendar className="w-3 h-3" /> Joined
                            </label>
                            <div className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground cursor-not-allowed">
                                {formatDate(userData?.joinedDate)}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

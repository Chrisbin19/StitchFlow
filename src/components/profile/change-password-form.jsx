'use client';

import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ChangePasswordForm() {
    const { currentUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const validate = () => {
        if (!currentPassword) {
            setError('Please enter your current password.');
            return false;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return false;
        }
        if (currentPassword === newPassword) {
            setError('New password must be different from your current password.');
            return false;
        }
        return true;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validate()) return;

        setLoading(true);
        try {
            // Step 1: Re-authenticate the user (Firebase requires this before sensitive ops)
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Step 2: Update to new password
            await updatePassword(currentUser, newPassword);

            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            console.error('Password change error:', err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak. Use at least 6 characters.');
            } else {
                setError('Failed to change password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Change Password
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                {success && (
                    <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Password changed successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <ShieldCheck className="w-3 h-3" /> Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => { setCurrentPassword(e.target.value); setError(''); }}
                                placeholder="Enter your current password"
                                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-muted/50 border border-border text-sm text-foreground transition-all outline-none focus:bg-background focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <Lock className="w-3 h-3" /> New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-muted/50 border border-border text-sm text-foreground transition-all outline-none focus:bg-background focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase mb-1.5">
                            <Lock className="w-3 h-3" /> Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                            placeholder="Repeat new password"
                            className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground transition-all outline-none focus:bg-background focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-500"
                        />
                    </div>

                    {/* Password Requirements Hint */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Password Requirements</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li className={`flex items-center gap-1.5 ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {newPassword.length >= 6 ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-muted-foreground inline-block" />}
                                At least 6 characters
                            </li>
                            <li className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {newPassword && newPassword === confirmPassword ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-muted-foreground inline-block" />}
                                Passwords match
                            </li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Changing Password...
                            </span>
                        ) : (
                            'Change Password'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

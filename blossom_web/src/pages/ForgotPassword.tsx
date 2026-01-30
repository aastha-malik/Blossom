import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Mail, Lock, ShieldCheck } from 'lucide-react';
import { authAPI } from '../api/client';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState(''); // Backend needs username for reset
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authAPI.sendForgotPasswordOTP(email);
            showToast('OTP sent to your email! 📧', 'success');
            setStep(2);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to send OTP', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.forgotPassword(otp, username, newPassword, confirmPassword);
            showToast('Password reset successful! 🚀', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Password reset failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen page-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="card relative p-8">
                    <Link
                        to="/login"
                        className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={24} />
                    </Link>

                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-4">
                            {step === 1 ? (
                                <Mail size={64} className="text-pink-soft-100" />
                            ) : (
                                <ShieldCheck size={64} className="text-pink-soft-100" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary mb-2">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h2>
                        <p className="text-text-secondary">
                            {step === 1
                                ? "No worries! Enter your email and we'll send you an OTP."
                                : "Enter the OTP, your identity, and your new password."}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div>
                                <label className="block text-text-secondary text-sm mb-3">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="input-field w-full py-3 pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-text-secondary text-sm mb-3">Username or Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username or your@email.com"
                                        className="input-field w-full py-3 pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-text-secondary text-sm mb-3">OTP (6 Digits)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="input-field w-full py-3 text-center text-2xl tracking-widest"
                                    required
                                    maxLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-text-secondary text-sm mb-3">New Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="input-field w-full py-3 pl-12"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-text-secondary text-sm mb-3">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="input-field w-full py-3 pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-text-muted hover:text-text-primary transition-colors mt-2"
                            >
                                Back to Step 1
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center border-t border-dark-border pt-6">
                        <p className="text-text-secondary">
                            Remember your password?{' '}
                            <Link to="/login" className="text-pink-soft-100 font-medium hover:text-pink-soft-200">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

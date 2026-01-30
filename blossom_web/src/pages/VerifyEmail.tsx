import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Mail, CheckCircle } from 'lucide-react';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, showToast, removeToast } = useToast();
    const { login } = useAuth();

    // Get email and auth data from navigation state if available
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
        if (location.state?.password) {
            setPassword(location.state.password);
        }
        if (location.state?.username) {
            setUsername(location.state.username);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !verificationCode) {
            showToast('Please enter both email and verification code', 'error');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.verifyEmail(email, verificationCode);
            setIsVerified(true);
            showToast('Email verified successfully! 🎉', 'success');

            // Auto-login if we have credentials
            if (username && password) {
                try {
                    await login({ username, password });
                    showToast('Logged in successfully! 🚀', 'success');
                    navigate('/tasks');
                } catch (loginError) {
                    console.error('Auto-login failed:', loginError);
                    showToast('Verification successful, but auto-login failed. Please log in manually.', 'error');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else {
                // Fallback to login redirect if no credentials
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Verification failed. Please check your code.',
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen page-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="card relative p-8">
                    <Link
                        to="/"
                        className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={24} />
                    </Link>

                    <div className="mb-8 text-center">
                        {isVerified ? (
                            <>
                                <div className="flex justify-center mb-4">
                                    <CheckCircle size={64} className="text-green-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-text-primary mb-2">Email Verified!</h2>
                                <p className="text-text-secondary">
                                    Your email has been verified successfully. {username && password ? 'Logging you in...' : 'Redirecting to login...'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4">
                                    <Mail size={64} className="text-pink-soft-100" />
                                </div>
                                <h2 className="text-3xl font-bold text-text-primary mb-2">Verify Your Email</h2>
                                <p className="text-text-secondary">
                                    Please enter the verification code sent to your email
                                </p>
                            </>
                        )}
                    </div>

                    {!isVerified && (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-text-secondary text-sm mb-3">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className={`input-field w-full py-3 ${location.state?.email ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        required
                                        readOnly={!!location.state?.email}
                                    />
                                </div>

                                <div>
                                    <label className="block text-text-secondary text-sm mb-3">Verification Code</label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        className="input-field w-full py-3 text-center text-2xl tracking-widest"
                                        required
                                        maxLength={6}
                                    />
                                    <p className="text-text-muted text-xs mt-2">
                                        Check your email inbox for the verification code
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-text-secondary text-sm">
                                    Didn't receive the code?{' '}
                                    <Link to="/signup" className="text-pink-soft-100 hover:text-pink-soft-200 font-medium">
                                        Sign up again
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-text-secondary text-sm">
                                    Already verified?{' '}
                                    <Link to="/login" className="text-pink-soft-100 hover:text-pink-soft-200 font-medium">
                                        Log in
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
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

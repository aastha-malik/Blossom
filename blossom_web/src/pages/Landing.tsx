import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Heart, BarChart3, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-dark-base text-text-primary font-sans selection:bg-pink-soft-200 selection:text-dark-base">

            {/* Navbar Placeholder (if you want a specific landing navbar, otherwise the main Header might show up) */}
            {/* Since App.tsx has <Header />, it will show up. We might want to HIDE the main app header on Landing? 
          Usually yes, or style it differently. But for now, let's assume the main header is fine or we conditionally render it in App.tsx. 
          The user said: "user isnt allowed to do anything ... until they login". 
          So the main Header with Nav Links (Tasks, Pets, etc.) should probably NOT be shown or should be disabled.
          I will handle the Header visibility in App.tsx later.
      */}

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Abstract Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-gentle-300/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-soft-100/10 rounded-full blur-[100px] translate-y-1/3 pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-48 sm:pt-48 sm:pb-64 min-h-screen flex items-center">
                    <div className="text-center w-full">
                        <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight mb-12">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-soft-100 via-purple-gentle-100 to-blue-muted-100 animate-gradient-x leading-tight">
                                Focus. Grow. Thrive.
                            </span>
                            <span className="block text-3xl sm:text-5xl mt-8 text-text-secondary font-medium">
                                Your productivity journey, gamified.
                            </span>
                        </h1>

                        <p className="mt-10 max-w-2xl mx-auto text-xl sm:text-2xl text-text-muted mb-16 leading-relaxed">
                            Blossom turns your daily tasks into a rewarding adventure. Stay focused, complete goals, and watch your virtual companion grow with you.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/tasks"
                                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-dark-base bg-pink-soft-100 hover:bg-pink-soft-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(232,180,184,0.3)]"
                                    >
                                        Go to Tasks
                                        <LayoutDashboard className="ml-2 h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/pets"
                                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-text-primary border border-dark-border hover:bg-dark-surface transition-all"
                                    >
                                        My Pets
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/signup"
                                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-dark-base bg-pink-soft-100 hover:bg-pink-soft-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(232,180,184,0.3)]"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-text-primary border border-dark-border hover:bg-dark-surface transition-all"
                                    >
                                        Log In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-dark-elevated/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">Why Blossom?</h2>
                        <p className="text-text-muted">Designed to keep you in the flow.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-pink-soft-300/50 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-pink-soft-100/10 flex items-center justify-center mb-6 group-hover:bg-pink-soft-100/20 transition-colors">
                                <CheckCircle className="h-6 w-6 text-pink-soft-100" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Focus Management</h3>
                            <p className="text-text-muted">
                                Clear task lists and focus timers help you destroy distraction. Prioritize what matters most.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-purple-gentle-200/50 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-purple-gentle-100/10 flex items-center justify-center mb-6 group-hover:bg-purple-gentle-100/20 transition-colors">
                                <Heart className="h-6 w-6 text-purple-gentle-100" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Virtual Companion</h3>
                            <p className="text-text-muted">
                                Your focus feeds your pet. Build a bond and unlock evolutions as you achieve your goals.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-blue-muted-200/50 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-blue-muted-100/10 flex items-center justify-center mb-6 group-hover:bg-blue-muted-100/20 transition-colors">
                                <BarChart3 className="h-6 w-6 text-blue-muted-100" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Insightful Analytics</h3>
                            <p className="text-text-muted">
                                Track your XP, focus hours, and task completion streaks with beautiful interactive charts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security / Trust Mockup (Optional) */}
            <div className="py-20 border-t border-dark-border/50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Shield className="h-10 w-10 text-green-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Your Data is Safe</h3>
                    <p className="text-text-muted">
                        Built with secure authentication and privacy-first design. We don't sell your data. We just help you bloom.
                    </p>
                </div>
            </div>

            {/* Feedback & Contact Section */}
            <div className="py-16 border-t border-dark-border/50">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">Have feedback or suggestions?</h3>
                    <p className="text-text-muted mb-6">
                        We'd love to hear from you! Any advice, corrections, or ideas to make Blossom better are welcome.
                    </p>
                    <a
                        href="mailto:aasthamalik.work@gmail.com?subject=Blossom Feedback"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-soft-100 to-purple-gentle-100 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send us an email
                    </a>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 text-center text-text-muted text-sm bg-dark-base border-t border-dark-border">
                <p>© 2026 Blossom. All rights reserved.</p>
            </footer>
        </div>
    );
}

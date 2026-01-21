import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const username = searchParams.get('username');
        const email = searchParams.get('email');

        if (token && username && email) {
            // Set auth data in context
            setAuthData(token, username, email);

            // Redirect to home page
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 500);
        } else {
            // If no token, redirect to login with error
            navigate('/login', { replace: true });
        }
    }, [searchParams, setAuthData, navigate]);

    return (
        <div className="min-h-screen page-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 size={48} className="animate-spin text-pink-soft-100 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Completing Google Sign In...
                </h2>
                <p className="text-text-secondary">
                    Please wait while we log you in
                </p>
            </div>
        </div>
    );
}

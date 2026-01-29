import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { userAPI } from '../api/client';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [theme, setThemeState] = useState<Theme>('light');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user's theme preference from backend when authenticated
    useEffect(() => {
        const fetchTheme = async () => {
            if (isAuthenticated) {
                try {
                    const response = await userAPI.getTheme();
                    const userTheme = response.theme as Theme;
                    setThemeState(userTheme);
                    document.documentElement.classList.toggle('light', userTheme === 'light');
                } catch (error) {
                    console.error('Failed to fetch theme:', error);
                    // Default to light if fetch fails
                    setThemeState('light');
                }
            } else {
                // Guest users: check localStorage
                const savedTheme = localStorage.getItem('theme') as Theme;
                if (savedTheme) {
                    setThemeState(savedTheme);
                    document.documentElement.classList.toggle('light', savedTheme === 'light');
                } else {
                    // Default for new guests
                    setThemeState('light');
                    document.documentElement.classList.toggle('light', true);
                }
            }
            setIsLoading(false);
        };

        fetchTheme();
    }, [isAuthenticated]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.toggle('light', theme === 'light');
    }, [theme]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');

        if (isAuthenticated) {
            // Save to backend for logged-in users
            try {
                await userAPI.updateTheme(newTheme);
            } catch (error) {
                console.error('Failed to update theme:', error);
            }
        } else {
            // Save to localStorage for guests
            localStorage.setItem('theme', newTheme);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

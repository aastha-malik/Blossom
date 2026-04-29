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

function applyTheme(t: Theme) {
    document.documentElement.classList.toggle('dark', t === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [theme, setThemeState] = useState<Theme>('light');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTheme = async () => {
            if (isAuthenticated) {
                try {
                    const response = await userAPI.getTheme();
                    const userTheme = response.theme as Theme;
                    setThemeState(userTheme);
                    applyTheme(userTheme);
                } catch (error) {
                    console.error('Failed to fetch theme:', error);
                    setThemeState('light');
                    applyTheme('light');
                }
            } else {
                const saved = localStorage.getItem('tendr-theme') as Theme | null;
                const resolved = saved === 'dark' ? 'dark' : 'light';
                setThemeState(resolved);
                applyTheme(resolved);
            }
            setIsLoading(false);
        };

        fetchTheme();
    }, [isAuthenticated]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);

        if (isAuthenticated) {
            try {
                await userAPI.updateTheme(newTheme);
            } catch (error) {
                console.error('Failed to update theme:', error);
            }
        } else {
            localStorage.setItem('tendr-theme', newTheme);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (isLoading) {
        return null;
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

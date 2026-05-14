import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocalTasksProvider } from './contexts/LocalTasksContext';
import { LocalPetsProvider } from './contexts/LocalPetsContext';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LocalTasksProvider>
            <LocalPetsProvider>
              <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', position: 'relative' }}>
                <App />
              </div>
            </LocalPetsProvider>
          </LocalTasksProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

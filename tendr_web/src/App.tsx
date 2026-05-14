import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useIsMobile } from './hooks/useIsMobile';
import Today from './pages/Today';
import Pet from './pages/Pet';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import ChooseUsername from './pages/ChooseUsername';

function AppContent() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const hideHeader = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/auth/callback', '/choose-username'].includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingBottom: (!hideHeader && isMobile) ? 64 : 0, overflowX: 'hidden', maxWidth: '100%' }}>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/choose-username" element={<ChooseUsername />} />

        <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
        <Route path="/pet" element={<ProtectedRoute><Pet /></ProtectedRoute>} />
        <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
      {!hideHeader && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

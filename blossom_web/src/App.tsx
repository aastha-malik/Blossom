import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
// import { ProtectedRoute } from './components/layout/ProtectedRoute';
import TaskFocus from './pages/TaskFocus';
import Pets from './pages/Pets';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-base">
        <Header />
        <Routes>
          <Route path="/" element={<TaskFocus />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

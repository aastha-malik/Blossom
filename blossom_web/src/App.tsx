import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import TaskFocus from './pages/TaskFocus';
import Pets from './pages/Pets';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-base">
        <Header />
        <Routes>
          <Route path="/" element={<TaskFocus />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

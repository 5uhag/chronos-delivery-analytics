import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('chronos_user'));

  const handleAuth = username => setUser(username);

  const handleLogout = () => {
    localStorage.removeItem('chronos_token');
    localStorage.removeItem('chronos_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onAuth={handleAuth} />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onAuth={handleAuth} />} />
        <Route
          path="/*"
          element={
            user ? (
              <div>
                <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Signed in as <span className="text-white font-medium">{user}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    Sign out
                  </button>
                </div>
                <Dashboard />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

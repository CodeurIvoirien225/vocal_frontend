import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import Home from './pages/Home';
import UserMessages from './components/UserMessages';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/user/:userId/messages" element={<UserMessages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Ajoutez cette route de fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
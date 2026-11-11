import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BirthdayPage } from './pages/BirthdayPage/BirthdayPage';
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { GiftConfigProvider } from './context/GiftConfigContext';

/**
 * Root Route Handler:
 * - If launched normally without gift query params -> Opens Admin Studio by default!
 * - If launched via shared gift link (?surprise=... or ?gift=...) -> Opens Recipient Surprise World!
 */
const RootRouteHandler: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isGiftLink = searchParams.has('surprise') || searchParams.has('gift');

  if (isGiftLink) {
    return <BirthdayPage />;
  }

  return <AdminDashboard />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GiftConfigProvider>
          <Routes>
            <Route path="/" element={<RootRouteHandler />} />
            <Route path="/gift" element={<BirthdayPage />} />
            <Route path="/surprise" element={<BirthdayPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GiftConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

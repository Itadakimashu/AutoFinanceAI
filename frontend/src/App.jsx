import React from 'react';
import { AuthProvider } from './AuthContext';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionsPage from './pages/AddTransactionsPage';
import AnalysisPage from './pages/AnalysisPage';
import { useRouter } from './hooks/useRouter';
import { ROUTES } from './utils/constants';
import './App.css';

function AppContent() {
  const { currentView } = useRouter();

  const renderPage = () => {
    switch (currentView) {
      case ROUTES.LOGIN:
        return <LoginPage />;
      case ROUTES.SIGNUP:
        return <SignupPage />;
      case ROUTES.TRANSACTIONS:
        return <TransactionsPage />;
      case ROUTES.ADD_TRANSACTIONS:
        return <AddTransactionsPage />;
      case ROUTES.ANALYSIS:
        return <AnalysisPage />;
      case ROUTES.HOME:
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <Navigation />
      {renderPage()}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

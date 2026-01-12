import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './views/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Offices } from './views/Offices';
import { BookParcel } from './views/BookParcel';
import { ParcelList } from './views/ParcelList';
import { Tracking } from './views/Tracking';
import { OrganizationNotFound } from './views/OrganizationNotFound';
import { UserRole } from './types';


const AppContent = () => {
  const { currentUser, organization, loading, logout } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');


  // Reset view when user changes (e.g. login/logout)
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === UserRole.PUBLIC) setCurrentView('tracking');
    else setCurrentView('dashboard');
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Vyahan...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return <OrganizationNotFound />;
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'offices': return <Offices />;
      case 'book': return <BookParcel />;
      case 'parcels': return <ParcelList />;
      case 'tracking': return <Tracking />;
      default: return <Dashboard />;
    }
  };

  // If public user, show a simplified layout or just the view
  if (currentUser.role === UserRole.PUBLIC) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl text-indigo-900">
            <span>LogiTrack Public Portal</span>
          </div>
          <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-indigo-600">Back to Login</button>
        </header>
        <main className="p-6">
          <Tracking />
        </main>
      </div>
    );
  }

  return (
    <Layout activeView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
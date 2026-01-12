import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Navigation,
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  Building2,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView }) => {
  const { currentUser, logout, notifications, organization } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setMobileMenuOpen(false);
      }}
      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all mb-1 ${activeView === view
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-colors ${activeView === view ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-sans">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Sidebar Desktop - Professional Dark Mode */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 fixed h-full z-20 shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg transform rotate-3">
            <Navigation className="w-5 h-5 text-white transform -rotate-45 translate-x-0.5" fill="currentColor" />
          </div>
          <span className="text-2xl font-brand font-bold text-white tracking-tight">{organization?.title || 'Vyhan'}</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 font-brand">Main Menu</div>
          {currentUser?.role === UserRole.SUPER_ADMIN && (
            <>
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="offices" icon={Building2} label="Offices" />
              <NavItem view="parcels" icon={ClipboardList} label="Shipments" />
            </>
          )}

          {currentUser?.role === UserRole.OFFICE_ADMIN && (
            <>
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="book" icon={PackagePlus} label="New Booking" />
              <NavItem view="parcels" icon={ClipboardList} label="Shipments" />
            </>
          )}

          {currentUser?.role === UserRole.PUBLIC && (
            <NavItem view="tracking" icon={Search} label="Track Parcel" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold font-brand ring-2 ring-indigo-500/20">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate font-brand">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Manager'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-20 px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2 text-white">
          <div className="bg-indigo-600 p-1.5 rounded-md">
            <Navigation className="w-5 h-5 text-white transform -rotate-45" fill="currentColor" />
          </div>
          <span className="font-brand font-bold text-lg">{organization?.title || 'Vyhan'}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-slate-900 pt-16 px-6">
          <nav className="space-y-2 mt-4">
            <button onClick={() => { onChangeView('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left p-4 bg-slate-800 rounded-lg text-white font-medium">Dashboard</button>
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left p-4 text-rose-400 font-medium">Sign Out</button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 bg-slate-50 min-h-screen flex flex-col">
        {/* Top Header Strip */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-brand font-bold text-slate-800 capitalize">
            {activeView === 'book' ? 'New Shipment' : activeView}
          </h2>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-14 right-8 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-black/5 z-30 animate-fade-in">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase font-brand">Notifications</span>
                  <span className="text-xs text-slate-400">{notifications.length} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No new alerts</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${n.recipient === 'Sender' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>{n.recipient}</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm font-brand ring-2 ring-indigo-100">
                {currentUser?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
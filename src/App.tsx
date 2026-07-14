import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, AlertTriangle, HeartPulse, LogOut, Globe } from 'lucide-react';
import DashboardView from './components/DashboardView';
import AdmissionsView from './components/AdmissionsView';
import BedsoresView from './components/BedsoresView';
import InfectionsView from './components/InfectionsView';
import FallsView from './components/FallsView';
import CardiacView from './components/CardiacView';
import { useLanguage } from './lib/LanguageContext';

type View = 'dashboard' | 'admissions' | 'bedsores' | 'infections' | 'falls' | 'cardiac';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { language, setLanguage, translate } = useLanguage();

  useEffect(() => {
    const auth = localStorage.getItem('hospital_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'waheed') {
      setIsAuthenticated(true);
      localStorage.setItem('hospital_auth', 'true');
      setError('');
    } else {
      setError(translate('wrongPassword'));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hospital_auth');
    setPassword('');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50" dir={dir}>
        <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
          <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <HeartPulse className="w-16 h-16 mx-auto text-indigo-600 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{translate('appTitle')}</h1>
          <p className="text-gray-500 mb-8">{translate('loginPrompt')}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={translate('password')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center"
                dir="ltr"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-medium rounded-lg text-sm px-5 py-3 hover:bg-indigo-700 transition-colors"
            >
              {translate('login')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'admissions': return <AdmissionsView />;
      case 'bedsores': return <BedsoresView />;
      case 'infections': return <InfectionsView />;
      case 'falls': return <FallsView />;
      case 'cardiac': return <CardiacView />;
      default: return <DashboardView />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: translate('dashboard'), icon: LayoutDashboard },
    { id: 'admissions', label: translate('admissions'), icon: Users },
    { id: 'bedsores', label: translate('bedsores'), icon: Activity },
    { id: 'infections', label: translate('infections'), icon: AlertTriangle },
    { id: 'falls', label: translate('falls'), icon: AlertTriangle },
    { id: 'cardiac', label: translate('cardiac'), icon: HeartPulse },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans" dir={dir}>
      {/* Sidebar */}
      <aside className={`w-64 bg-white ${language === 'ar' ? 'border-l' : 'border-r'} border-gray-200 flex flex-col hidden md:flex print:hidden`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-3 text-indigo-600">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8" />
            <span className="text-xl font-bold">{translate('appTitle')}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeView === item.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {translate('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center md:hidden print:hidden">
          <div className="flex items-center gap-2 text-indigo-600">
            <HeartPulse className="w-6 h-6" />
            <span className="font-bold">{translate('appTitle')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="text-gray-500 p-2">
              <Globe className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="text-gray-500 p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto print:max-w-none">
             {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}


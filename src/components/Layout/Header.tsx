import { Menu, User, Globe, ChevronDown, Bell, Moon, Sun, Plus, BarChart2, Filter, FilePlus, CreditCard } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

type LanguageCode = 'en' | 'hi' | 'mr';

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const languages: { code: LanguageCode; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
  ];

  const notifications = [
    { id: 1, text: 'New invoice generated', time: '2 min ago' },
    { id: 2, text: 'Stock low: Wireless Mouse', time: '10 min ago' },
    { id: 3, text: 'Payment received: Invoice #453', time: '30 min ago' },
  ];

  const quickActions = [
    { id: 1, text: 'Add Invoice', icon: <FilePlus className="w-4 h-4" /> },
    { id: 2, text: 'Add Product', icon: <Plus className="w-4 h-4" /> },
    { id: 3, text: 'Generate Report', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 4, text: 'Reconcile Payments', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="lg:hidden p-2 text-gray-600 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl font-semibold text-gray-900">{t('Trackit')}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">

          {/* Quick Actions */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-md transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Quick Actions
              <ChevronDown className="w-3 h-3 text-white ml-1" />
            </button>

            <AnimatePresence>
              {quickActionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => alert(`${action.text} clicked`)}
                    >
                      {action.icon} {action.text}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reports Shortcut */}
          <button className="hidden sm:flex items-center gap-1 px-3 py-1 text-sm text-violet-700 border border-violet-300 rounded-md hover:bg-violet-50 transition">
            <BarChart2 className="w-4 h-4" /> Reports
          </button>

          {/* Filter */}
          <button className="hidden sm:flex items-center gap-1 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>

          {/* Language selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition">
              <Globe className="w-4 h-4 text-violet-600" />
              <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <div className="absolute right-0 z-50 w-40 mt-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`block w-full px-3 py-2 text-sm text-left transition-colors ${
                    language === lang.code
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full hover:bg-gray-50 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  {notifications.map((note) => (
                    <div key={note.id} className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between">
                      <span>{note.text}</span>
                      <span className="text-gray-400 text-xs">{note.time}</span>
                    </div>
                  ))}
                  <div className="border-t px-4 py-2 text-sm text-center text-violet-600 hover:bg-gray-50 cursor-pointer">
                    Mark all as read
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-full border border-gray-300 text-gray-600 hover:text-violet-600 hover:bg-gray-50 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center p-1.5 border border-gray-300 rounded-full hover:ring-2 hover:ring-violet-500 transition"
            >
              <User className="w-5 h-5 text-gray-700" />
              <span className="w-2 h-2 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 border border-white" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <button className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Profile</button>
                  <button className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Settings</button>
                  <button className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}




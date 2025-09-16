import { Menu, User, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { NotificationButton } from './NotificationButton';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

type LanguageCode = 'en' | 'hi' | 'mr';

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: LanguageCode; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-600 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / App Name */}
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('Trackit')}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Language selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
              <Globe className="w-4 h-4 text-violet-600" />
              <span>{languages.find((l) => l.code === language)?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <div className="absolute right-0 z-50 w-44 mt-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
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
          <NotificationButton />

          {/* User menu */}
          <button
            className="flex items-center p-2 text-gray-600 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full transition"
            aria-label="User Menu"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}


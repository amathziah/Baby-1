import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Bell, 
  Receipt, 
  Package, 
  BarChart3, 
  Shield,
  Bot
} from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

const navigation = [
  { name: 'dashboard', href: '/', icon: LayoutDashboard },
  { name: 'invoices', href: '/invoices', icon: FileText },
  { name: 'customers', href: '/customers', icon: Users },
  { name: 'payments', href: '/payments', icon: CreditCard },
  { name: 'reminders', href: '/reminders', icon: Bell },
  { name: 'expenses', href: '/expenses', icon: Receipt },
  { name: 'inventory', href: '/inventory', icon: Package },
  { name: 'reports', href: '/reports', icon: BarChart3 },
  { name: 'compliance', href: '/compliance', icon: Shield },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-20 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-violet-600" />
              <span className="text-xl font-bold text-gray-900">Baby-1</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                   ${
                     isActive
                       ? 'bg-violet-50 text-violet-700 border-r-2 border-violet-700'
                       : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                   }`
                }
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {t(item.name)}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

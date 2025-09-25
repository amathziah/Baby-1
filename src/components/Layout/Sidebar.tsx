import { NavLink } from "react-router-dom";
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
  Bot,
} from "lucide-react";
import { useLanguage } from "../LanguageProvider";

const navigation = [
  { name: "dashboard", href: "/", icon: LayoutDashboard },
  { name: "invoices", href: "/invoices", icon: FileText },
  { name: "customers", href: "/customers", icon: Users },
  { name: "payments", href: "/payments", icon: CreditCard },
  { name: "reminders", href: "/reminders", icon: Bell },
  { name: "expenses", href: "/expenses", icon: Receipt },
  { name: "inventory", href: "/inventory", icon: Package },
  { name: "reports", href: "/reports", icon: BarChart3 },
  { name: "compliance", href: "/compliance", icon: Shield },
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-20 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64
          bg-gradient-to-b from-yellow-700 via-yellow-500 to-amber-400
          text-white dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900
          shadow-2xl ring-1 ring-white/20 dark:ring-black/20
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Branding */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/20 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-white" />
              <span className="text-xl font-bold tracking-wide">Baby-1</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/25 text-white shadow-inner border-l-4 border-yellow-400 dark:border-amber-400"
                      : "text-yellow-100 hover:bg-white/10 hover:text-white dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {t(item.name)}
              </NavLink>
            ))}
          </nav>

          {/* Footer / Profile */}
          <div className="p-4 border-t border-white/20 dark:border-gray-700 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white dark:text-gray-200">
                  Baby-1 Inc.
                </span>
                <p className="text-xs text-yellow-200 dark:text-gray-400">
                  © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

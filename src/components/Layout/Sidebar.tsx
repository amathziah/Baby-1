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
          fixed inset-y-0 left-0 z-30 w-20
          bg-gradient-to-b from-yellow-700 via-yellow-500 to-amber-400
          text-white dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900
          shadow-2xl ring-1 ring-white/20 dark:ring-black/20
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-white/20 dark:border-gray-700">
            <Bot className="w-6 h-6 text-white" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-1 py-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center px-1 py-2 text-[10px] font-medium rounded-md transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/25 text-white shadow-inner"
                      : "text-yellow-100 hover:bg-white/10 hover:text-white dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-4 h-4 mb-1" />
                <span className="truncate">{t(item.name)}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-1 border-t border-white/20 dark:border-gray-700 text-center">
            <p className="text-[8px] text-yellow-200 dark:text-gray-400">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


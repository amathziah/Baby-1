import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

const demoNotifications = [
  { id: 1, message: 'Invoice INV-023 is overdue', type: 'warn' },
  { id: 2, message: 'New payment received from Acme Corp', type: 'success' },
  { id: 3, message: 'Inventory low: Mechanical Keyboard', type: 'warn' },
];

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case 'warn':
        return 'bg-yellow-50 text-yellow-700';
      case 'success':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        className="relative p-2 text-gray-600 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full transition"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 font-medium text-gray-900">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {demoNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-center px-4 py-3 text-sm ${getColor(
                  notif.type
                )} border-b border-gray-100`}
              >
                <span className="flex-1">{notif.message}</span>
                <span className="text-gray-400 text-xs ml-2">•</span>
              </div>
            ))}
          </div>
          <button
            className="w-full px-4 py-2 text-sm text-center text-violet-700 hover:bg-violet-50 transition"
            onClick={() => alert('View all notifications')}
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}

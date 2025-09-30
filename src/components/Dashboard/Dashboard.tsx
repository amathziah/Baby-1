import { useState, useEffect, useMemo } from 'react';
import { DashboardStats } from '../../types';
import { dataService } from '../../services/dataService';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../LanguageProvider';
import {
  TrendingUp,
  FileText,
  Clock,
  AlertCircle,
  IndianRupee,
  Activity,
  PlusCircle,
  Bell,
  RefreshCw,   // ✅ keep only one
  Mic,
  Zap,
} from 'lucide-react';

import InvoiceGenerator from '../InvoiceGenerator/InvoiceGenerator';


import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import DashboardHeader from './DashboardHeader';

interface AIInsight {
  id: string;
  type: 'suggest' | 'warn' | 'auto';
  message: string;
  priority: number;
}

/**
 * Enhanced Dashboard
 * - Adds cashflow & business health score
 * - Festival offer card (AI suggestion)
 * - Voice-to-invoice starter (graceful feature detection)
 * - KPI badges, quick actions, export buttons
 * - Minor performance / accessibility improvements
 */
export function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
    lowStockItems: 0,
    recentActivity: [],
  });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [festival, setFestival] = useState<{ title: string; message: string } | null>(null);
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null)

  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const invoices = await dataService.getInvoices();
      const products = await dataService.getProducts();
      const payments = await dataService.getPayments();
      const customers = await dataService.getCustomers();

      const totalRevenue = invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const pendingPayments = invoices
        .filter((inv) => ['sent', 'overdue'].includes(inv.status))
        .reduce((sum, inv) => sum + inv.total, 0);

      const overdueInvoices = invoices.filter(
        (inv) => inv.dueDate < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled'
      ).length;

      const lowStockItems = products.filter((p) => p.stock <= p.minStock).length;

      const recentInvoices = invoices
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((inv) => ({
          type: 'invoice' as const,
          description: `Invoice ${inv.invoiceNumber} created`,
          date: inv.createdAt,
          amount: inv.total,
        }));

      const recentPayments = payments
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((payment) => {
          const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
          return {
            type: 'payment' as const,
            description: `Payment received for ${invoice?.invoiceNumber ?? 'Unknown'}`,
            date: payment.createdAt,
            amount: payment.amount,
          };
        });

      const recentActivity = [...recentInvoices, ...recentPayments]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 8);

      setStats({
        totalRevenue,
        totalInvoices: invoices.length,
        pendingPayments,
        overdueInvoices,
        lowStockItems,
        recentActivity,
      });

      // Prepare chart data (monthly) — ensure stable month ordering
      const monthMap: Record<string, { revenue: number; invoices: number; idx: number }> = {};
      invoices.forEach((inv) => {
        const month = inv.createdAt.toLocaleString('default', { month: 'short' });
        const idx = inv.createdAt.getMonth();
        if (!monthMap[month]) monthMap[month] = { revenue: 0, invoices: 0, idx };
        if (inv.status === 'paid') monthMap[month].revenue += inv.total;
        monthMap[month].invoices += 1;
      });
      const chartArr = Object.entries(monthMap)
        .map(([month, values]) => ({ month, revenue: values.revenue, invoices: values.invoices, idx: values.idx }))
        .sort((a, b) => a.idx - b.idx)
        .map(({ idx, ...rest }) => rest);
      setChartData(chartArr);

      // Load AI insights + festival prompt
      const ai = await aiService.getDashboardInsights();
      setInsights(ai as AIInsight[]);
      try {
        const fest = await aiService.getFestivalPrompt();
        if (fest) setFestival(fest);
      } catch (e) {
        // ignore if not available
      }
    } catch (err) {
      console.error('Dashboard load failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Business Health Score (0-100) — more robust aggregation
  const businessHealthScore = useMemo(() => {
    const revenueFactor = Math.min(1, stats.totalRevenue / Math.max(1, (stats.totalInvoices || 1) * 1000));
    const overdueFactor = Math.max(0, 1 - (stats.overdueInvoices || 0) * 0.05);
    const stockFactor = stats.lowStockItems > 0 ? 0.92 : 1;
    return Math.round((0.6 * revenueFactor + 0.3 * overdueFactor + 0.1 * stockFactor) * 100);
  }, [stats]);

  // Voice-to-invoice starter with feature detection & accessibility
  const startVoiceInvoice = () => {
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // graceful fallback
      setVoiceDraft('Voice not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript;
      // Basic parse hint (production: send to NLP service)
      setVoiceDraft(text);
    };
    rec.onerror = () => setVoiceDraft('Voice recognition error.');
    rec.onend = () => {
      /* noop */
    };
    rec.start();
  };

  // Quick export (CSV) for top metrics — minimal client-side export
  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalRevenue.toString()],
      ['Total Invoices', stats.totalInvoices.toString()],
      ['Pending Payments', stats.pendingPayments.toString()],
      ['Overdue Invoices', stats.overdueInvoices.toString()],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices.toString(),
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Pending Payments',
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Overdue Invoices',
      value: stats.overdueInvoices.toString(),
      icon: AlertCircle,
      color: 'text-red-600 bg-red-100',
    },
  ];
  type ActionType = "newInvoice" | "reminders" | "reorder";

  const handleAction = (action: ActionType) => {
    switch (action) {
      case "newInvoice":
        setShowInvoice(true); // ✅ show invoice
        break;
      case "reminders":
        alert("Open reminders");
        break;
      case "reorder":
        alert("Open reorder suggestions");
        break;
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">{t('Management Console')}</h1>
          <p className="text-gray-600">Welcome to your invoice management dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Refresh dashboard"
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm shadow-sm hover:shadow"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            aria-label="Export dashboard CSV"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm shadow-sm hover:shadow"
          >
            <Zap className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xl font-bold text-gray-600">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue & Invoices (Monthly)</h2>
            <div className="text-sm text-gray-500">Business Health: {businessHealthScore}%</div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="invoices" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(`${stats.totalRevenue}`)}
                className="text-sm px-2 py-1 rounded-md bg-gray-50 border"
              >
                Copy Revenue
              </button>
              <button
                onClick={() => setVoiceDraft(null) || startVoiceInvoice()}
                className="text-sm px-2 py-1 rounded-md bg-blue-50 border"
                aria-label="Start voice invoice"
              >
                <Mic className="w-4 h-4 inline-block mr-1" /> Voice Invoice
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Low Stock Items</span>
            <span className={`font-semibold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.lowStockItems}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Customers</span>
            <span className="font-semibold text-gray-900">{dataService.getCustomers().length}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Products in Inventory</span>
            <span className="font-semibold text-gray-900">{dataService.getProducts().length}</span>
          </div>

          {/* Festival prompt */}
          {festival && (
            <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-100">
              <div className="text-sm font-semibold">{festival.title}</div>
              <div className="text-xs text-gray-700">{festival.message}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => alert('Campaign applied — edit in campaigns page')} className="px-3 py-1 rounded bg-yellow-600 text-white text-sm">Apply</button>
                <button onClick={() => alert('Open campaign editor')} className="px-3 py-1 rounded bg-white border text-sm">Edit</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
  <div className="bg-white rounded-2xl shadow-md border border-violet-200 transition hover:shadow-lg">
    {/* Header */}
    <div className="p-6 border-b border-violet-100 flex items-center gap-3">
      <Activity className="w-6 h-6 text-violet-600" />
      <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
      <span className="ml-auto text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700 font-medium">
        Updated just now
      </span>
    </div>

    {/* Insights list */}
    <div className="p-6 space-y-4">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`flex items-start gap-4 p-4 rounded-xl border-l-4 transition hover:shadow-sm ${
            insight.type === "warn"
              ? "bg-yellow-50 border-yellow-400"
              : "bg-white border-violet-400"
          }`}
        >
          {/* Badge Icon */}
          <div
            className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${
              insight.type === "warn"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>

          {/* Message */}
          <p className="text-sm leading-relaxed text-slate-800">{insight.message}</p>
        </div>
      ))}
    </div>
  </div>
)}


      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${activity.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'
                  }`}
              >
                {activity.type === 'payment' ? (
                  <IndianRupee className="w-4 h-4 text-green-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">₹{activity.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowInvoice(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white font-medium shadow hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
          aria-label="Create new invoice"
        >
          <PlusCircle className="w-4 h-4" />
          New Invoice
        </button>

        <button
          onClick={() => handleAction("reminders")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          aria-label="Send reminders"
        >
          <Bell className="w-4 h-4" />
          Reminders
        </button>

        <button
          onClick={() => handleAction("reorder")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          aria-label="Reorder suggestions"
        >
          <RefreshCw className="w-4 h-4" />
          Reorder
        </button>
      </div>

      {/* Invoice Generator Modal */}
      {showInvoice && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Semi-transparent overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-2xl"
            onClick={() => setShowInvoice(false)}
          />
          {/* Centered modal */}
          <div className="relative bg-white w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] p-4 rounded-2xl shadow-xl overflow-y-auto z-20 mt-10">
            <InvoiceGenerator onClose={() => setShowInvoice(false)} />
          </div>
        </div>
      )}

    </div>
  );
}

import { useMemo, useState } from "react";
import { CreditCard, Smartphone, DollarSign, AlertTriangle, CheckCircle, Download, Zap } from "lucide-react";

type PaymentMethod = "UPI" | "Card" | "Netbanking" | "Cash";

type Payment = {
  invoice: string;
  method: PaymentMethod;
  amount: number;
  date?: string; // ISO date
  reconciled?: boolean;
};

type AIAlert = {
  id: string;
  type: "warning" | "info";
  message: string;
  score?: number; // confidence / severity 0-100
};

const demoPayments: Payment[] = [
  { invoice: "INV-001", method: "UPI", amount: 1200, date: "2025-08-01", reconciled: true },
  { invoice: "INV-002", method: "Card", amount: 5400, date: "2025-08-03", reconciled: false },
  { invoice: "INV-003", method: "Netbanking", amount: 3000, date: "2025-08-10", reconciled: false },
  { invoice: "INV-004", method: "Cash", amount: 800, date: "2025-08-12", reconciled: true },
  { invoice: "INV-005", method: "UPI", amount: 150000, date: "2025-08-15", reconciled: false }, // high-value for demo
];

function methodIcon(method: PaymentMethod) {
  switch (method) {
    case "Card":
      return <CreditCard className="w-4 h-4" />;
    case "UPI":
      return <Smartphone className="w-4 h-4" />;
    case "Netbanking":
      return <DollarSign className="w-4 h-4" />;
    case "Cash":
      return <DollarSign className="w-4 h-4" />;
  }
}

/**
 * Simulated front-end AI detector (demo-only)
 * - flags high-value payments
 * - flags likely-duplicate invoices
 */
function detectAIAlerts(payments: Payment[]): AIAlert[] {
  const alerts: AIAlert[] = [];

  // high-value threshold (demo)
  const HIGH_VALUE = 50000;
  payments.forEach((p) => {
    if (p.amount >= HIGH_VALUE) {
      alerts.push({
        id: `high-${p.invoice}`,
        type: "warning",
        message: `High-value payment detected: ₹${p.amount.toLocaleString()} on ${p.invoice}`,
        score: 92,
      });
    }
  });

  // duplicate invoice detection (simple)
  const counts: Record<string, number> = {};
  payments.forEach((p) => (counts[p.invoice] = (counts[p.invoice] || 0) + 1));
  Object.entries(counts).forEach(([invoice, count]) => {
    if (count > 1) {
      alerts.push({
        id: `dup-${invoice}`,
        type: "warning",
        message: `${count} payment records found for ${invoice}. Verify duplicates.`,
        score: 85,
      });
    }
  });

  // quick insight
  alerts.push({
    id: "summary",
    type: "info",
    message: `Detected ${payments.length} payments • Total: ₹${payments
      .reduce((s, p) => s + p.amount, 0)
      .toLocaleString()}`,
    score: 60,
  });

  return alerts;
}

export function Payments() {
  // UI / filter state (typed)
  const [payments] = useState<Payment[]>(demoPayments);
  const [search, setSearch] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<"All" | PaymentMethod>("All");
  const [showOnlyUnreconciled, setShowOnlyUnreconciled] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AIAlert[]>(() => detectAIAlerts(demoPayments));
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // derived lists (typed)
  const methods: ("All" | PaymentMethod)[] = useMemo(() => ["All", "UPI", "Card", "Netbanking", "Cash"], []);

  const filtered = useMemo<Payment[]>(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter((p) => (methodFilter === "All" ? true : p.method === methodFilter))
      .filter((p) => (showOnlyUnreconciled ? !p.reconciled : true))
      .filter((p) => (q ? p.invoice.toLowerCase().includes(q) || (p.date ?? "").includes(q) : true));
  }, [payments, methodFilter, showOnlyUnreconciled, search]);

  const totals = useMemo(
    () => ({
      count: filtered.length,
      sum: filtered.reduce((s, p) => s + p.amount, 0),
      byMethod: filtered.reduce<Record<PaymentMethod, number>>(
        (acc, p) => {
          acc[p.method] = (acc[p.method] || 0) + p.amount;
          return acc;
        },
        { UPI: 0, Card: 0, Netbanking: 0, Cash: 0 }
      ),
    }),
    [filtered]
  );

  // export CSV (typed)
  const exportCSV = (rows: Payment[]) => {
    const header = ["Invoice", "Method", "Amount", "Date", "Reconciled"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.invoice,
          r.method,
          r.amount,
          r.date ?? "",
          r.reconciled ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // small handlers
  const dismissAlert = (id: string) => setAlerts((s) => s.filter((a) => a.id !== id));
  const markReconciled = (invoice: string) => {
    // demo-only: inform user (in prod, call API and update state)
    alert(`Marked ${invoice} as reconciled (demo)`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-violet-600" />
            Payments
          </h2>
          <p className="text-sm text-gray-600 mt-1">Track incoming payments, reconcile quickly and surface anomalies via AI.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700 transition"
            aria-label="Export payments"
            title="Export visible payments (CSV)"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setAlerts(detectAIAlerts(payments))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border text-sm hover:bg-gray-50 transition"
            aria-label="Re-run AI checks"
            title="Re-run AI checks"
          >
            <Zap className="w-4 h-4 text-violet-600" /> Re-check
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or date..."
            className="px-3 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Search payments"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as "All" | PaymentMethod)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Filter by method"
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showOnlyUnreconciled}
              onChange={(e) => setShowOnlyUnreconciled(e.target.checked)}
            />
            Show unreconciled only
          </label>
        </div>

        <div className="text-sm text-gray-600">
          <div>Count: <strong className="text-gray-900">{totals.count}</strong></div>
          <div>Total: <strong className="text-gray-900">₹{totals.sum.toLocaleString()}</strong></div>
        </div>
      </div>

      {/* AI Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 p-3 rounded-md ${a.type === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-indigo-50 border-indigo-200"
                } border`}
              role="alert"
            >
              <div className="pt-1">
                {a.type === "warning" ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> : <CheckCircle className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800">{a.message}</div>
                {typeof a.score === "number" && <div className="text-xs text-gray-500 mt-1">Confidence: {a.score}%</div>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Suggested action for: ${a.message}`)}
                  className="px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50"
                >
                  Take Action
                </button>
                <button
                  onClick={() => dismissAlert(a.id)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  aria-label="Dismiss alert"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <article
            key={p.invoice + (p.date ?? "")}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex flex-col justify-between"
            onClick={() => setSelectedInvoice(p.invoice)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedInvoice === p.invoice}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">Invoice</div>
              <div className="text-sm font-medium text-gray-700">{p.invoice}</div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">Method</div>
              <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 text-violet-600">
                  {methodIcon(p.method)}
                </span>
                <span>{p.method}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-lg font-semibold text-gray-900">₹{p.amount.toLocaleString()}</div>
              </div>

              <div className="text-right">
                <div className={`text-xs px-2 py-1 rounded-full ${p.reconciled ? "bg-green-100 text-green-800" : "bg-yellow-50 text-yellow-800"}`}>
                  {p.reconciled ? "Reconciled" : "Unreconciled"}
                </div>
                <div className="text-xs text-gray-500 mt-2">{p.date ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markReconciled(p.invoice);
                }}
                className="px-3 py-2 rounded-md bg-white border text-sm hover:bg-gray-50"
              >
                Mark Reconciled
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Open receipt for ${p.invoice} (demo)`);
                }}
                className="px-3 py-2 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-700"
              >
                View Receipt
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Selected detail panel (simple inline modal/demo) */}
      {selectedInvoice && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white border rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Payment Details — {selectedInvoice}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-sm text-gray-500">Close</button>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <p>This is a demo detail view. In production, load transaction metadata (UTR, bank, payer) and reconciliation history.</p>
              <p className="mt-2">Suggested actions: download receipt, flag for review, export transaction, or reconcile against invoice.</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  exportCSV(payments.filter((p) => p.invoice === selectedInvoice));
                }}
                className="px-3 py-2 bg-violet-600 text-white rounded"
              >
                Export Transaction
              </button>
              <button
                onClick={() => {
                  alert("Flagged for review (demo)");
                }}
                className="px-3 py-2 bg-white border rounded"
              >
                Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { MoreVertical, ChevronDown, Download } from "lucide-react";

type ExpenseItem = { category: string; amount: number };

const COLORS = [
  "#065F46", // deep green
  "#047857", // primary green
  "#059669", // medium green
  "#10B981", // light green
  "#34D399", // lighter green
];
export function Expenses({
  demoExpenses = [
    { category: "Office Supplies", amount: 2000 },
    { category: "Travel", amount: 5000 },
    { category: "Rent", amount: 15000 },
    { category: "Utilities", amount: 3200 },
    { category: "Salaries", amount: 40000 },
  ],
}: {
  demoExpenses?: ExpenseItem[];
}) {
  const totalExpenses = demoExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const highestExpense = demoExpenses.reduce(
    (max, exp) => (exp.amount > max.amount ? exp : max),
    demoExpenses[0]
  );

  const currency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const downloadCSV = () => {
    const header = ["Category", "Amount"];
    const rows = demoExpenses.map((d) => [d.category, d.amount.toString()]);
    // Use an escaped newline instead of a raw line break inside quotes
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900">
            💸 Expenses
          </h2>

          <p className="text-base text-gray-500">
            Track and manage your business expenses with{" "}
            <span className="font-medium text-gray-700">
              AI-powered insights
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
            This month <ChevronDown size={14} />
          </button>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:shadow-sm"
            aria-label="Download CSV"
          >
            <Download size={16} /> Export
          </button>

          <button
            className="p-2 rounded-md hover:bg-gray-50 border border-gray-200"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Total Expenses (This Month)</p>
          <h3 className="text-2xl font-bold text-red-600">
            {currency(totalExpenses)}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Highest Expense</p>
          <h3 className="text-lg font-bold text-gray-900">
            {highestExpense.category}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {currency(highestExpense.amount)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Recurring Expense</p>
          <h3 className="text-lg font-bold text-gray-900">Salaries</h3>
          <p className="text-sm text-gray-600 mt-1">
            Stable · Paid on 1st of month
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Expense Distribution
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Breakdown of expenses by category.
          </p>

          <div className="relative h-72">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-xl font-semibold text-gray-900">
                {currency(totalExpenses)}
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demoExpenses}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={100}
                  paddingAngle={6}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${Math.round(percent * 100)}%)`
                  }
                >
                  {demoExpenses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number) => currency(value)}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Expenses by Category
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Absolute values to compare categories quickly.
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoExpenses} margin={{ left: 0, right: 12 }}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value: number) => currency(value)} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {demoExpenses.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <h4 className="text-sm font-medium text-gray-900">Expenses</h4>
          <p className="text-xs text-gray-500">
            {demoExpenses.length} categories
          </p>
        </div>

        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {demoExpenses.map((exp, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[idx % COLORS.length] }}
                    aria-hidden
                  />
                  <span>{exp.category}</span>
                </td>
                <td className="px-6 py-4 text-right">{currency(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-red-50 to-orange-100 p-6 rounded-2xl shadow border border-red-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🤖 AI Expense Insights
        </h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Salaries</strong> form the largest recurring expense each
            month — consider forecasting for headcount changes.
          </li>
          <li>
            <strong>Travel</strong> costs are above average → implement travel
            policy & pre-approval to reduce costs.
          </li>
          <li>
            <strong>Rent & Utilities</strong> are stable → no anomalies detected
            this period.
          </li>
          <li>
            AI suggests tracking <strong>Office Supplies</strong> more closely;
            small line items can accumulate.
          </li>
        </ul>
      </div>
    </div>
  );
}

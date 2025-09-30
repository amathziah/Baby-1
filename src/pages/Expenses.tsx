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

import { useState } from "react";

import { MoreVertical, ChevronDown, Download, X, Cpu } from "lucide-react";

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

  const [showModal, setShowModal] = useState(false);

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
      {/* AI Insights Card */}
      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-6 rounded-2xl shadow-lg border border-violet-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-violet-800 flex items-center gap-2">
            <Cpu size={20} className="text-violet-600" /> AI Expense Insights
          </h3>

          {/* Only the icon triggers the modal */}
          <span
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-violet-700 text-sm cursor-pointer px-3 py-1 rounded-full border border-violet-300 hover:border-violet-600 hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            <Cpu size={16} className="text-violet-600" /> AI Insights
          </span>
        </div>

        {/* Brief insights */}
        <ul className="list-disc pl-6 text-violet-800 mt-4 space-y-2">
          <li>
            <strong>Salaries:</strong> form the largest recurring expense each month — consider forecasting for headcount changes.
          </li>
          <li>
            <strong>Travel:</strong> costs are above average → implement travel policy & pre-approval to reduce costs.
          </li>
          <li>
            <strong>Rent & Utilities:</strong> are stable → no anomalies detected this period.
          </li>
          <li>
            AI suggests tracking <strong>Office Supplies</strong> more closely; small line items can accumulate.
          </li>
        </ul>
      </div>

      {/* Modal for Detailed Insights */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] p-6 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto border border-violet-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-violet-100 pb-3">
              <h2 className="text-2xl font-bold text-violet-800 flex items-center gap-3">
                <Cpu size={28} className="text-violet-600" /> AI Expense Insights
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-violet-50 text-violet-600 hover:text-violet-800 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Table Layout for Insights */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-violet-50 border-b border-violet-100">
                    <th className="text-left text-violet-700 font-semibold px-4 py-2">Category</th>
                    <th className="text-left text-violet-700 font-semibold px-4 py-2">Insight</th>
                  </tr>
                </thead>
                <tbody className="text-violet-800">
                  <tr className="border-b border-violet-100 hover:bg-violet-100 transition">
                    <td className="px-4 py-2 font-medium">Salaries</td>
                    <td className="px-4 py-2">Highest recurring expense. Forecast for hiring or attrition.</td>
                  </tr>
                  <tr className="border-b border-violet-100 hover:bg-violet-100 transition">
                    <td className="px-4 py-2 font-medium">Travel</td>
                    <td className="px-4 py-2">Above average — implement travel approval workflow.</td>
                  </tr>
                  <tr className="border-b border-violet-100 hover:bg-violet-100 transition">
                    <td className="px-4 py-2 font-medium">Rent & Utilities</td>
                    <td className="px-4 py-2">Stable this period, no anomalies detected.</td>
                  </tr>
                  <tr className="border-b border-violet-100 hover:bg-violet-100 transition">
                    <td className="px-4 py-2 font-medium">Office Supplies</td>
                    <td className="px-4 py-2">Track closely — small items add up.</td>
                  </tr>
                  <tr className="hover:bg-violet-100 transition">
                    <td className="px-4 py-2 font-medium">AI Recommendation</td>
                    <td className="px-4 py-2">Automate recurring expense alerts to identify trends faster.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

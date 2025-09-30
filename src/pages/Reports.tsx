import React from "react";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Download } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Sample chart data
const revenueData = [
  { month: "June", revenue: 41200, expenses: 18000 },
  { month: "July", revenue: 38500, expenses: 16200 },
  { month: "August", revenue: 40000, expenses: 15000 },
  { month: "September", revenue: 45000, expenses: 17000 },
  { month: "October", revenue: 48000, expenses: 20000 },
];

export function Reports() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChartIcon className="w-5 h-5 text-violet-600" />
          <span>Reports</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive financial analytics and real-time business insights.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: 120450, trend: 12, trendType: "up" },
          { title: "Total Expenses", value: 45200, trend: 5, trendType: "down" },
          { title: "Net Profit", value: 75250, trend: 18, trendType: "up" },
          { title: "Growth Rate", value: 22, trend: null, trendType: "up" },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-2xl shadow-sm border border-gray-200 bg-white p-4 flex flex-col justify-between"
          >
            <p className="text-sm text-gray-500">{kpi.title}</p>
            <h3 className="text-xl font-bold text-gray-900">
              {kpi.title === "Growth Rate" ? `${kpi.value}%` : `$${kpi.value.toLocaleString()}`}
            </h3>
            {kpi.trend !== null && (
              <p className={`text-sm mt-1 ${kpi.trendType === "up" ? "text-green-600" : "text-red-600"}`}>
                {kpi.trendType === "up" ? "▲" : "▼"} {kpi.trend}% vs last month
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses — Professional Line Card */}
      <div
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
        role="region"
        aria-labelledby="rev-exp-line-title"
      >
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h3 id="rev-exp-line-title" className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <LineChartIcon className="w-5 h-5 text-violet-600" />
              Revenue vs Expenses
            </h3>
            <p className="text-xs text-gray-500 mt-1">Monthly trend to monitor margins and cashflow direction.</p>
          </div>

          {/* Compact KPI summary + actions */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">Revenue (YTD)</div>
              <div className="text-sm font-semibold text-gray-900">
                ₹{revenueData.reduce((s: any, d: any) => s + (d.revenue || 0), 0).toLocaleString()}
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">Expenses (YTD)</div>
              <div className="text-sm font-semibold text-gray-900">
                ₹{revenueData.reduce((s: any, d: any) => s + (d.expenses || 0), 0).toLocaleString()}
              </div>
            </div>

            <button
              className="text-sm px-3 py-1 flex items-center gap-2 bg-violet-50 text-violet-700 rounded hover:bg-violet-100 transition"
              onClick={() => {/* hook to download CSV / PNG */ }}
              aria-label="Download revenue vs expenses report"
              title="Download report"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
              <YAxis tickFormatter={(v) => `₹${v.toLocaleString()}`} tick={{ fill: '#6b7280' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
                  const exp = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0;
                  const diff = rev - exp;
                  return (
                    <div className="bg-white border shadow p-3 text-sm rounded">
                      <div className="font-medium">{label}</div>
                      <div className="mt-1">Revenue: <span className="font-semibold">₹{rev.toLocaleString()}</span></div>
                      <div>Expenses: <span className="font-semibold">₹{exp.toLocaleString()}</span></div>
                      <div className={`mt-2 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff >= 0 ? 'Surplus' : 'Shortfall'}: <strong>₹{Math.abs(diff).toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
              <Line
                name="Revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="Expenses"
                type="monotone"
                dataKey="expenses"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div>Values shown in INR (₹)</div>
          <div>Tip: hover points for exact values · click legend to toggle series</div>
        </div>
      </div>


      {/* Revenue vs Expenses Bar Chart */}
      {/* Revenue vs Expenses — Professional Card */}
      <div
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
        role="region"
        aria-labelledby="revenue-expenses-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 id="revenue-expenses-title" className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <BarChartIcon className="w-5 h-5 text-violet-600" />
              Revenue vs Expenses
            </h3>
            <p className="text-xs text-gray-500 mt-1">Monthly comparison to help you spot trends and margin changes.</p>
          </div>

          {/* Small KPI summary (compact, actionable) */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500">Total Revenue</div>
              <div className="text-sm font-semibold text-gray-900">₹{revenueData.reduce((s: any, d: any) => s + (d.revenue || 0), 0).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total Expenses</div>
              <div className="text-sm font-semibold text-gray-900">₹{revenueData.reduce((s: any, d: any) => s + (d.expenses || 0), 0).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Avg Margin</div>
              <div className="text-sm font-semibold text-gray-900">
                {(
                  (revenueData.reduce((s: any, d: any) => s + (d.revenue || 0), 0) -
                    revenueData.reduce((s: any, d: any) => s + (d.expenses || 0), 0)
                  ) /
                  Math.max(1, revenueData.reduce((s: any, d: any) => s + (d.revenue || 0), 0))
                  * 100
                ).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
              <YAxis tickFormatter={(v) => `₹${v.toLocaleString()}`} tick={{ fill: '#6b7280' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
                  const exp = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0;
                  const diff = rev - exp;
                  return (
                    <div className="bg-white border shadow p-2 text-sm">
                      <div className="font-medium">{label}</div>
                      <div className="mt-1">Revenue: <span className="font-semibold">₹{rev.toLocaleString()}</span></div>
                      <div>Expenses: <span className="font-semibold">₹{exp.toLocaleString()}</span></div>
                      <div className={`mt-1 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff >= 0 ? 'Surplus' : 'Shortfall'}: <strong>₹{Math.abs(diff).toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: 12 }}
                formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
              />
              <Bar name="Revenue" dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={14} />
              <Bar name="Expenses" dataKey="expenses" fill="#f97316" radius={[6, 6, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div>Values shown in INR (₹)</div>
          <div>Tip: click a legend item to toggle series visibility</div>
        </div>
      </div>


      {/* Recent Reports Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-gray-600 border-b">
              <tr>
                <th className="py-2 px-3">Month</th>
                <th className="py-2 px-3">Revenue</th>
                <th className="py-2 px-3">Expenses</th>
                <th className="py-2 px-3">Profit</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {revenueData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-2 px-3">{row.month}</td>
                  <td className="py-2 px-3">${row.revenue.toLocaleString()}</td>
                  <td className="py-2 px-3">${row.expenses.toLocaleString()}</td>
                  <td
                    className={`py-2 px-3 font-semibold ${row.revenue - row.expenses >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    ${(row.revenue - row.expenses).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

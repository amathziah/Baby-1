import { FileCheck, FileText, CalendarCheck, Search, Download, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

type ComplianceItem = {
  type: string;
  description: string;
  dueDate: string;
  status: "Completed" | "Pending" | "Overdue";
};

const demoCompliance: ComplianceItem[] = [
  { type: "GST Return", description: "Monthly GST filing", dueDate: "2025-09-20", status: "Pending" },
  { type: "TDS Payment", description: "Quarterly TDS deposit", dueDate: "2025-09-25", status: "Completed" },
  { type: "E-Way Bill", description: "Invoice transport compliance", dueDate: "2025-09-18", status: "Overdue" },
];

export function Compliance() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "Pending" | "Overdue">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const statusColors = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
  };

  // Filter + Search + Sort
  const filteredCompliance = useMemo(() => {
    let data = demoCompliance;

    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.type.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    data = [...data].sort((a, b) =>
      sortAsc
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    return data;
  }, [statusFilter, searchQuery, sortAsc]);

  // Progress bar
  const completed = demoCompliance.filter((i) => i.status === "Completed").length;
  const total = demoCompliance.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Export CSV
  const exportCSV = () => {
    const headers = ["Type", "Description", "Due Date", "Status"];
    const rows = demoCompliance.map((i) => [i.type, i.description, i.dueDate, i.status]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance_tasks.csv";
    link.click();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 space-y-5 text-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-violet-600" />
        <h2 className="text-lg font-semibold text-gray-900">Compliance Dashboard</h2>
      </div>
      <p className="text-xs text-gray-600">
        ⚖️ Keep track of GST, TDS, E-Way bills, and other compliance deadlines.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          {
            icon: <FileText className="w-4 h-4 text-violet-600" />,
            label: "Total Tasks",
            value: total,
          },
          {
            icon: <CalendarCheck className="w-4 h-4 text-violet-600" />,
            label: "Upcoming Deadlines",
            value: demoCompliance.filter((i) => i.status === "Pending").length,
          },
          {
            icon: <FileCheck className="w-4 h-4 text-violet-600" />,
            label: "Completed",
            value: completed,
          },
          {
            icon: null,
            label: "Completion",
            value: `${completionRate}%`,
            extra: (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="h-2 rounded-full bg-violet-600"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            ),
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-1 mb-1 text-gray-500 text-xs font-medium">
              {kpi.icon} {kpi.label}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{kpi.value}</h3>
            {kpi.extra}
          </div>
        ))}
      </div>

      {/* Filters + Search + Export */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex gap-2">
          {["All", "Pending", "Completed", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                statusFilter === status
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center border rounded-lg px-2 bg-white w-full md:w-60">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-xs outline-none"
          />
        </div>

        {/* Export */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-1 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs shadow hover:bg-violet-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Compliance Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-left text-xs border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2 border font-medium">Type</th>
              <th className="px-3 py-2 border font-medium">Description</th>
              <th
                className="px-3 py-2 border cursor-pointer font-medium"
                onClick={() => setSortAsc(!sortAsc)}
              >
                <div className="flex items-center gap-1">
                  Due Date <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-3 py-2 border font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompliance.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition text-gray-800">
                <td className="px-3 py-2 border">{item.type}</td>
                <td className="px-3 py-2 border">{item.description}</td>
                <td className="px-3 py-2 border">{item.dueDate}</td>
                <td className="px-3 py-2 border text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCompliance.length === 0 && (
          <p className="text-gray-500 text-xs p-4">No compliance tasks found.</p>
        )}
      </div>
    </div>
  );
}

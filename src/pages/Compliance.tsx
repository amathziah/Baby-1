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

  // Progress bar (completion %)
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
    <div className="p-6 min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileCheck className="w-6 h-6 text-violet-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Compliance Dashboard</h2>
      </div>
      <p className="text-gray-600">⚖️ Keep track of GST, TDS, E-Way bills, and other compliance deadlines.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Total Compliance Tasks</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{total}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {demoCompliance.filter((i) => i.status === "Pending").length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Completed</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{completed}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-2">Completion Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-violet-600"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{completionRate}% Completed</p>
        </div>
      </div>

      {/* Filters + Search + Export */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          {["All", "Pending", "Completed", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-sm border ${
                statusFilter === status ? "bg-violet-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center border rounded-lg px-2 bg-white w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search compliance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-sm outline-none"
          />
        </div>

        {/* Export */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm shadow hover:bg-violet-700 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Compliance Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Description</th>
              <th
                className="px-4 py-2 border cursor-pointer flex items-center gap-1"
                onClick={() => setSortAsc(!sortAsc)}
              >
                Due Date <ArrowUpDown className="w-4 h-4 inline" />
              </th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompliance.map((item, idx) => (
              <tr key={idx} className="text-center border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 border">{item.type}</td>
                <td className="px-4 py-2 border">{item.description}</td>
                <td className="px-4 py-2 border">{item.dueDate}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCompliance.length === 0 && (
          <p className="text-gray-500 p-4">No compliance tasks found.</p>
        )}
      </div>
    </div>
  );
}

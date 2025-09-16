import { FileCheck, FileText, CalendarCheck } from "lucide-react";

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
  const statusColors = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileCheck className="w-6 h-6 text-violet-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Compliance Dashboard</h2>
      </div>
      <p className="text-gray-600">
        ⚖️ Keep track of GST, TDS, E-Way bills, and other compliance deadlines.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Total Compliance Tasks</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">3</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">2</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-violet-600" />
            <p className="text-sm font-medium text-gray-500">Completed</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900">1</h3>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Due Date</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoCompliance.map((item, idx) => (
              <tr key={idx} className="text-center border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 border">{item.type}</td>
                <td className="px-4 py-2 border">{item.description}</td>
                <td className="px-4 py-2 border">{item.dueDate}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {demoCompliance.length === 0 && (
          <p className="text-gray-500 p-4">No compliance tasks found.</p>
        )}
      </div>
    </div>
  );
}

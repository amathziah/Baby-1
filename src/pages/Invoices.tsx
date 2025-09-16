import { useMemo, useState } from "react";
import { FileText, Download, Mail, CheckCircle} from "lucide-react";

type Invoice = {
  number: string;
  customer: string;
  sector: string;
  total: number;
  status: "Paid" | "Overdue" | "Pending";
  date?: string; // ISO date (optional demo field)
};

const demoInvoices: Invoice[] = [
  { number: "INV-001", customer: "Acme Corp", sector: "Corporate", total: 1200, status: "Paid", date: "2025-08-01" },
  { number: "INV-002", customer: "Tech Solutions", sector: "Tech", total: 5400, status: "Overdue", date: "2025-08-10" },
  { number: "INV-003", customer: "Global Enterprises", sector: "Corporate", total: 7800, status: "Pending", date: "2025-08-15" },
  { number: "INV-004", customer: "SmartRetail Chain", sector: "Retail", total: 3200, status: "Paid", date: "2025-08-20" },
  // ... you can extend this list for testing
];

type FilterStatus = Invoice["status"] | "All";

const STATUS_COLORS: Record<Invoice["status"], string> = {
  Paid: "bg-green-100 text-green-800",
  Overdue: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

export function Invoices() {
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [filterSector, setFilterSector] = useState<"All" | string>("All");
  const [sortKey, setSortKey] = useState<"number" | "customer" | "total" | "status" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Derived lists
  const sectors = useMemo(() => {
    const s = Array.from(new Set(demoInvoices.map((d) => d.sector)));
    return ["All", ...s];
  }, []);

  // Filtering
  const filtered = useMemo(() => {
    return demoInvoices
      .filter((inv) =>
        inv.customer.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
      .filter((inv) => (filterStatus === "All" ? true : inv.status === filterStatus))
      .filter((inv) => (filterSector === "All" ? true : inv.sector === filterSector));
  }, [searchTerm, filterStatus, filterSector]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "total") return dir * (a.total - b.total);
      if (sortKey === "customer") return dir * a.customer.localeCompare(b.customer);
      if (sortKey === "status") return dir * a.status.localeCompare(b.status);
      if (sortKey === "number") return dir * a.number.localeCompare(b.number);
      // date fallback (ISO strings sort lexicographically)
      return dir * (String(a.date || "").localeCompare(String(b.date || "")));
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Totals
  const totalVisible = useMemo(() => sorted.reduce((s, i) => s + i.total, 0), [sorted]);
  const selectedTotal = useMemo(() => {
    return demoInvoices.filter((inv) => selected[inv.number]).reduce((s, i) => s + i.total, 0);
  }, [selected]);

  // Helpers
  const toggleSelectAllOnPage = () => {
    const allSelected = paged.every((p) => selected[p.number]);
    const newSel = { ...selected };
    paged.forEach((p) => {
      newSel[p.number] = !allSelected;
    });
    setSelected(newSel);
  };

  const toggleSelect = (num: string) => {
    setSelected((s) => ({ ...s, [num]: !s[num] }));
  };

  const exportCSV = (rows: Invoice[]) => {
    const header = ["Number", "Customer", "Sector", "Total", "Status", "Date"];
    const csvRows = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.number,
          `"${r.customer.replace(/"/g, '""')}"`,
          r.sector,
          r.total,
          r.status,
          r.date ?? "",
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const bulkSendReminder = () => {
    const toRemind = demoInvoices.filter((inv) => selected[inv.number]);
    if (toRemind.length === 0) {
      alert("Select one or more invoices to send reminders.");
      return;
    }
    // placeholder: call your API here
    alert(`Sending reminders for ${toRemind.length} invoices.`);
  };

  const rowActionRemind = (inv: Invoice) => {
    alert(`Reminder sent for ${inv.number} — ${inv.customer}`);
  };

  const rowActionMarkPaid = (inv: Invoice) => {
    alert(`Marking ${inv.number} as Paid (demo only).`);
  };

  // UI helpers for sort
  const setSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-violet-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage, filter and export invoices quickly.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by customer..."
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as FilterStatus);
                setPage(1);
              }}
            >
              {(["All", "Paid", "Overdue", "Pending"] as FilterStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filterSector}
              onChange={(e) => {
                setFilterSector(e.target.value as "All" | string);
                setPage(1);
              }}
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(sorted)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-700 transition"
              aria-label="Export visible invoices"
            >
              <Download className="w-4 h-4" /> Export
            </button>

            <button
              onClick={() => bulkSendReminder()}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm hover:bg-gray-50 transition"
              aria-label="Send bulk reminders"
            >
              <Mail className="w-4 h-4 text-violet-600" /> Remind
            </button>

            <button
              onClick={() => {
                setSelected({});
                setPage(1);
                setSearchTerm("");
                setFilterStatus("All");
                setFilterSector("All");
              }}
              className="px-3 py-2 rounded-md bg-gray-50 border text-sm hover:bg-gray-100 transition"
              title="Reset filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-3 w-12">
                <input
                  aria-label="Select all on page"
                  type="checkbox"
                  checked={paged.length > 0 && paged.every((p) => selected[p.number])}
                  onChange={toggleSelectAllOnPage}
                />
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => setSort("number")}>
                Number
                {sortKey === "number" && <span className="ml-2 text-xs text-gray-500">{sortDir}</span>}
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => setSort("customer")}>
                Customer
                {sortKey === "customer" && <span className="ml-2 text-xs text-gray-500">{sortDir}</span>}
              </th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3 cursor-pointer text-right" onClick={() => setSort("total")}>
                Total
                {sortKey === "total" && <span className="ml-2 text-xs text-gray-500">{sortDir}</span>}
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => setSort("status")}>
                Status
                {sortKey === "status" && <span className="ml-2 text-xs text-gray-500">{sortDir}</span>}
              </th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No invoices match your search or filters.
                </td>
              </tr>
            ) : (
              paged.map((inv) => (
                <tr key={inv.number} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      aria-label={`Select invoice ${inv.number}`}
                      type="checkbox"
                      checked={!!selected[inv.number]}
                      onChange={() => toggleSelect(inv.number)}
                    />
                  </td>
                  <td className="px-4 py-3">{inv.number}</td>
                  <td className="px-4 py-3">{inv.customer}</td>
                  <td className="px-4 py-3">{inv.sector}</td>
                  <td className="px-4 py-3 text-right">₹{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`View ${inv.number}`)}
                        className="px-2 py-1 rounded bg-white border text-xs hover:bg-gray-50"
                        aria-label={`View ${inv.number}`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => rowActionRemind(inv)}
                        className="px-2 py-1 rounded bg-violet-50 text-violet-700 text-xs hover:bg-violet-100"
                        aria-label={`Send reminder ${inv.number}`}
                      >
                        <Mail className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => rowActionMarkPaid(inv)}
                        className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs hover:bg-green-100"
                        aria-label={`Mark ${inv.number} paid`}
                      >
                        <CheckCircle className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Footer: totals */}
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-xs text-gray-600">
                {sorted.length} invoice(s) • Page {page} of {totalPages}
              </td>
              <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                Visible Total: ₹{totalVisible.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Selected: ₹{selectedTotal.toLocaleString()}</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>
          <div className="text-sm text-gray-700">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

  
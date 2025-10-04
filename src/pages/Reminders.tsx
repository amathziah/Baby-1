import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, Bell, Plus, Clock, Zap, RefreshCw, AlertCircle,Search,X,Filter,SortAsc,Download } from "lucide-react";


/**
 * Professional Reminders page (TypeScript + React)
 * - No `any` types
 * - Local persistence (localStorage)
 * - Natural-language quick-add (heuristic parser)
 * - AI-like suggestions (priority, snooze hints, overdue flags)
 * - Search, filter, sort
 * - Snooze / mark done / remove actions
 */

type Priority = "High" | "Medium" | "Low";
type Reminder = {
  id: number;
  task: string;
  dueISO: string; // ISO string for date/time
  priority: Priority;
  completed: boolean;
  createdISO: string;
  snoozedUntilISO?: string | null;
};

const STORAGE_KEY = "app.reminders.v2";

// helper utilities
const uid = (() => {
  let counter = Date.now();
  return () => ++counter;
})();

const now = () => new Date();

const toISO = (d: Date) => d.toISOString();

const daysUntil = (iso: string) => {
  const target = new Date(iso);
  const diffMs = +target - +now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// naive parser for quick-add text (demo)
function parseQuickInput(input: string): { task: string; date?: Date } {
  const text = input.trim();
  const lower = text.toLowerCase();

  // detect "tomorrow", "today", "in X days"
  let date: Date | undefined;
  if (lower.includes("tomorrow")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date = d;
  } else if (lower.includes("today")) {
    date = new Date();
  } else {
    const inDays = lower.match(/in\s+(\d+)\s+days?/);
    if (inDays) {
      const d = new Date();
      d.setDate(d.getDate() + Number(inDays[1]));
      date = d;
    }
  }

  // try to detect time like "5pm" or "14:30"
  if (date) {
    const timeMatch = lower.match(/(\b\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hrs = Number(timeMatch[1]);
      const mins = timeMatch[2] ? Number(timeMatch[2]) : 0;
      const ampm = timeMatch[3];
      if (ampm) {
        if (ampm === "pm" && hrs < 12) hrs += 12;
        if (ampm === "am" && hrs === 12) hrs = 0;
      }
      date.setHours(hrs, mins, 0, 0);
    } else {
      date.setHours(18, 0, 0, 0); // default 6pm if no time
    }
  }

  return { task: text, date };
}

// heuristic priority suggestion (demo)
function suggestPriority(dueISO?: string | null, text?: string): Priority {
  const t = (text || "").toLowerCase();
  const urgentWords = ["urgent", "asap", "due", "submit", "expire", "renew", "deadline"];
  if (urgentWords.some((w) => t.includes(w))) return "High";
  if (!dueISO) return "Medium";
  const days = daysUntil(dueISO);
  if (days <= 1) return "High";
  if (days <= 7) return "Medium";
  return "Low";
}

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Reminder[];
        return parsed.map((r) => ({ ...r, snoozedUntilISO: r.snoozedUntilISO ?? null }));
      }
    } catch {
      /* ignore parse errors and fall back to seed */
    }
    // seed data
    const base = now();
    const seed: Reminder[] = [
      {
        id: uid(),
        task: "Submit project report",
        dueISO: toISO(new Date(base.getTime() + 1000 * 60 * 60 * 24 * 3)), // +3 days
        priority: "High",
        completed: false,
        createdISO: toISO(base),
        snoozedUntilISO: null,
      },
      {
        id: uid(),
        task: "Team meeting with client",
        dueISO: toISO(new Date(base.getTime() + 1000 * 60 * 60 * 24 * 1)), // +1 day
        priority: "Medium",
        completed: false,
        createdISO: toISO(base),
        snoozedUntilISO: null,
      },
    ];
    return seed;
  });

  // UI state
  const [quickText, setQuickText] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<"All" | Priority>("All");
  const [sortBy, setSortBy] = useState<"due" | "priority" | "created">("due");

  // persist reminders
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  // actions
  const addReminderFromQuick = () => {
    if (!quickText.trim()) return;
    const parsed = parseQuickInput(quickText);
    const due = parsed.date ?? now();
    const priority = suggestPriority(toISO(due), parsed.task);
    const newRem: Reminder = {
      id: uid(),
      task: parsed.task,
      dueISO: toISO(due),
      priority,
      completed: false,
      createdISO: toISO(now()),
      snoozedUntilISO: null,
    };
    setReminders((s) => [newRem, ...s]);
    setQuickText("");
  };

  const toggleComplete = (id: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed, snoozedUntilISO: null } : r))
    );
  };

  const removeReminder = (id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const snooze = (id: number, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const d = new Date(r.snoozedUntilISO ?? r.dueISO);
        d.setMinutes(d.getMinutes() + minutes);
        return { ...r, snoozedUntilISO: toISO(d) };
      })
    );
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // derived data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reminders
      .filter((r) => (filterPriority === "All" ? true : r.priority === filterPriority))
      .filter((r) => (q ? r.task.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (sortBy === "due") return +new Date(a.snoozedUntilISO ?? a.dueISO) - +new Date(b.snoozedUntilISO ?? b.dueISO);
        if (sortBy === "created") return +new Date(b.createdISO) - +new Date(a.createdISO); // newest first
        // priority order High < Medium < Low
        const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [reminders, search, filterPriority, sortBy]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const upcoming = reminders.filter((r) => +new Date(r.snoozedUntilISO ?? r.dueISO) - +now() <= 1000 * 60 * 60 * 24 * 2 && !r.completed);
    if (upcoming.length > 0) list.push(`You have ${upcoming.length} reminder(s) due within 48 hours.`);
    const overdue = reminders.filter((r) => +new Date(r.snoozedUntilISO ?? r.dueISO) < +now() && !r.completed);
    if (overdue.length > 0) list.push(`⚠️ ${overdue.length} overdue reminder(s). Consider following up.`);
    return list;
  }, [reminders]);

  // UI helpers
  const priorityColors: Record<Priority, string> = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Bell className="w-6 h-6 text-violet-600" />
            Reminders
          </h2>
          <p className="text-sm text-gray-600 mt-1">Smart reminders with quick-add, suggestions and snooze — optimized for productivity.</p>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md bg-white border text-sm hover:bg-gray-50"
            onClick={() => {
              setQuickText("Pay subscription tomorrow 9am");
            }}
            title="Load example"
            aria-label="Load example quick input"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Example
          </button>

          <button
            className="px-3 py-2 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-700"
            onClick={resetAll}
            title="Reset reminders"
            aria-label="Reset reminders"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Quick-add */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <label className="text-xs text-gray-500">Quick add (natural language)</label>
        <div className="mt-3 flex gap-2">
          <input
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder='Try: "Pay rent tomorrow 5pm" or "Renew license in 3 days"'
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Quick add reminder"
          />
          <button
            onClick={addReminderFromQuick}
            className="px-4 py-2 rounded-md bg-violet-600 text-white flex items-center gap-2 hover:bg-violet-700"
            aria-label="Add reminder"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {quickText.trim() && (
          <div className="mt-3 text-sm text-gray-700">
            <strong>Preview:</strong>{" "}
            {(() => {
              const parsed = parseQuickInput(quickText.trim());
              const iso = parsed.date ? toISO(parsed.date) : toISO(now());
              return `${parsed.task} — ${new Date(iso).toLocaleString()} • Priority: ${suggestPriority(iso, parsed.task)}`;
            })()}
            <div className="text-xs text-gray-500 mt-1">Tip: use words like “tomorrow”, “in 3 days”, or a time like “5pm”.</div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-6 space-y-2">
          {insights.map((ins, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-indigo-50 border border-indigo-100">
              <AlertCircle  className="w-5 h-5 text-indigo-600" />
              <div className="text-sm text-gray-800">{ins}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders..."
            className="px-3 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Search reminders"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as "All" | Priority)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Filter by priority"
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "due" | "priority" | "created")}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Sort reminders"
          >
            <option value="due">Sort by due date</option>
            <option value="priority">Sort by priority</option>
            <option value="created">Sort by created date</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">Total reminders: <strong className="text-gray-900">{reminders.length}</strong></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const effectiveISO = r.snoozedUntilISO ?? r.dueISO;
          const effectiveDate = new Date(effectiveISO);
          const overdue = !r.completed && +effectiveDate < +now();
          const days = daysUntil(effectiveISO);

          return (
            <article key={r.id} className={`bg-white p-4 rounded-lg border ${overdue ? "border-red-100" : "border-gray-200"} shadow-sm`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={`text-md font-semibold ${r.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {r.task}
                  </h3>

                  <div className="mt-2 text-xs text-gray-500">
                    Due: <span className="font-medium text-gray-800">{effectiveDate.toLocaleString()}</span>
                    {r.snoozedUntilISO ? <span className="ml-2 text-xs text-gray-500">(snoozed)</span> : null}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                    <span className="text-xs text-gray-500">• {days <= 0 ? (overdue ? "Overdue" : "Due today") : `${days}d`}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => toggleComplete(r.id)}
                    className={`px-3 py-1 rounded-md text-sm ${r.completed ? "bg-green-50 text-green-700" : "bg-violet-600 text-white"} hover:opacity-95`}
                    aria-label={`Mark ${r.task} done`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {r.completed ? "Completed" : "Mark Done"}
                  </button>

                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => snooze(r.id, 60)}
                      className="px-2 py-1 rounded-md bg-white border text-xs hover:bg-gray-50"
                      title="Snooze 1 hour"
                    >
                      Snooze 1h
                    </button>
                    <button
                      onClick={() => snooze(r.id, 60 * 24)}
                      className="px-2 py-1 rounded-md bg-white border text-xs hover:bg-gray-50"
                      title="Snooze 1 day"
                    >
                      Snooze 1d
                    </button>
                  </div>

                  <button
                    onClick={() => removeReminder(r.id)}
                    className="mt-2 px-2 py-1 rounded-md bg-white border text-xs text-red-600 hover:bg-red-50"
                    aria-label={`Remove ${r.task}`}
                  >
                    <XCircle className="w-4 h-4 inline" /> Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {reminders.length === 0 && (
        <div className="mt-8 p-6 bg-white border rounded-lg text-gray-600">
          <div className="text-lg font-semibold">No reminders yet</div>
          <div className="mt-2 text-sm">Add reminders with the quick-add box above or import from your calendar.</div>
        </div>
      )}

      {/* Footer help */}
      <div className="mt-6 text-xs text-gray-500 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Natural-language quick-add and AI suggestions are demo heuristics — replace with your aiService for production.
      </div>
    </div>
  );
}




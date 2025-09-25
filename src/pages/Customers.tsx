import { useState } from "react";
import { ArrowLeft, User, TrendingUp, AlertCircle, Calendar, Activity, CheckCircle } from "lucide-react";

// Types
type Customer = {
  id: number;
  name: string;
  email: string;
  sector: string;
  tags: string[];
};

type Transaction = {
  id: number;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
};

// Demo customers
// Demo customers
const demoCustomers: Customer[] = [
  { id: 1, name: "Acme Corp", email: "accounts@acme.com", sector: "Corporate", tags: ["VIP"] },
  { id: 2, name: "Tech Solutions", email: "billing@techsol.com", sector: "Tech", tags: ["Regular"] },
  { id: 3, name: "HealthPlus Clinic", email: "contact@healthplus.com", sector: "Healthcare", tags: ["VIP"] },
  { id: 4, name: "GreenMart", email: "finance@greenmart.com", sector: "Retail", tags: ["Regular"] },
  { id: 5, name: "BrightEdu", email: "accounts@brightedu.org", sector: "Education", tags: ["New"] },
  { id: 6, name: "FinEdge Ltd", email: "billing@finedge.com", sector: "Finance", tags: ["VIP"] },
  { id: 7, name: "City Builders", email: "accounts@citybuilders.com", sector: "Construction", tags: ["Regular"] },
  { id: 8, name: "NextGen Media", email: "media@nextgen.com", sector: "Media", tags: ["Regular"] },
  { id: 9, name: "TravelEase", email: "accounts@travelease.com", sector: "Travel", tags: ["Inactive"] },
  { id: 10, name: "Zenith Motors", email: "finance@zenithmotors.com", sector: "Automobile", tags: ["VIP"] },
  { id: 11, name: "AquaPure", email: "billing@aquapure.com", sector: "Utilities", tags: ["Regular"] },
  { id: 12, name: "FreshBite Foods", email: "orders@freshbite.com", sector: "Food & Beverages", tags: ["New"] },
  { id: 13, name: "MediCare Plus", email: "finance@medicareplus.com", sector: "Healthcare", tags: ["VIP"] },
  { id: 14, name: "SoftWave", email: "accounts@softwave.io", sector: "Software", tags: ["Regular"] },
  { id: 15, name: "QuickShip Logistics", email: "billing@quickship.com", sector: "Logistics", tags: ["At Risk"] },
];


// Mock transactions (in real app, fetch per customer)
const demoTransactions: Record<number, Transaction[]> = {
  1: [
    { id: 101, date: "2025-08-12", amount: 1200, status: "Paid" },
    { id: 102, date: "2025-09-05", amount: 3000, status: "Pending" },
    { id: 103, date: "2025-09-20", amount: 2500, status: "Paid" },
  ],
  2: [
    { id: 201, date: "2025-07-18", amount: 800, status: "Paid" },
    { id: 202, date: "2025-08-03", amount: 950, status: "Overdue" },
  ],
  3: [
    { id: 301, date: "2025-08-25", amount: 500, status: "Paid" },
    { id: 302, date: "2025-09-10", amount: 750, status: "Paid" },
  ],
  4: [
    { id: 401, date: "2025-07-15", amount: 1100, status: "Paid" },
    { id: 402, date: "2025-09-01", amount: 1500, status: "Pending" },
  ],
  5: [
    { id: 501, date: "2025-06-22", amount: 300, status: "Overdue" },
    { id: 502, date: "2025-08-12", amount: 700, status: "Paid" },
  ],
  6: [
    { id: 601, date: "2025-07-30", amount: 4000, status: "Paid" },
    { id: 602, date: "2025-09-05", amount: 5000, status: "Paid" },
  ],
  7: [
    { id: 701, date: "2025-08-10", amount: 2500, status: "Paid" },
    { id: 702, date: "2025-09-15", amount: 1800, status: "Pending" },
  ],
  8: [
    { id: 801, date: "2025-07-05", amount: 950, status: "Overdue" },
    { id: 802, date: "2025-08-25", amount: 1250, status: "Paid" },
  ],
  9: [
    { id: 901, date: "2025-05-18", amount: 400, status: "Overdue" },
    { id: 902, date: "2025-09-02", amount: 600, status: "Pending" },
  ],
  10: [
    { id: 1001, date: "2025-07-20", amount: 7200, status: "Paid" },
    { id: 1002, date: "2025-09-12", amount: 6800, status: "Paid" },
  ],
  11: [
    { id: 1101, date: "2025-06-28", amount: 900, status: "Pending" },
    { id: 1102, date: "2025-08-18", amount: 1200, status: "Paid" },
  ],
  12: [
    { id: 1201, date: "2025-07-12", amount: 450, status: "Paid" },
    { id: 1202, date: "2025-09-03", amount: 650, status: "Pending" },
  ],
  13: [
    { id: 1301, date: "2025-08-01", amount: 2000, status: "Paid" },
    { id: 1302, date: "2025-09-08", amount: 2200, status: "Paid" },
  ],
  14: [
    { id: 1401, date: "2025-07-10", amount: 1500, status: "Overdue" },
    { id: 1402, date: "2025-09-01", amount: 1750, status: "Paid" },
  ],
  15: [
    { id: 1501, date: "2025-06-25", amount: 3200, status: "Overdue" },
    { id: 1502, date: "2025-09-07", amount: 2800, status: "Pending" },
  ],
};

// Mock AI health score
const getCustomerHealth = (customerId: number) => {
  switch (customerId) {
    case 1:
    case 6:
    case 10:
    case 13:
      return { score: 85, label: "Highly Active", color: "bg-green-500" };
    case 2:
    case 4:
    case 7:
    case 11:
    case 14:
      return { score: 60, label: "Moderately Active", color: "bg-yellow-500" };
    case 3:
    case 5:
    case 8:
    case 12:
      return { score: 45, label: "Low Activity", color: "bg-orange-500" };
    default:
      return { score: 25, label: "At Risk", color: "bg-red-500" };
  }
};

const getAIInsights = (customerId: number) => {
  return {
    churnRisk: customerId % 2 === 0 ? 30 : 65,
    nextPurchase: customerId % 2 === 0 ? "Expected in 12 days (₹8,500 est.)" : "Expected in 25 days (₹12,000 est.)",
    engagement: {
      email: Math.floor(Math.random() * 40) + 10,
      purchases: Math.floor(Math.random() * 30) + 5,
      support: Math.floor(Math.random() * 20),
    },
    actions: [
      "Send loyalty discount",
      "Schedule account manager call",
      "Personalize email with product recommendations",
    ],
    confidence: 92,
  };
};




export function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  if (selectedCustomer) {
    const transactions = demoTransactions[selectedCustomer.id] || [];
    const health = getCustomerHealth(selectedCustomer.id);
    const ai = getAIInsights(selectedCustomer.id);

    return (
      <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
        {/* Back Button */}
        <button
          className="flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
          onClick={() => setSelectedCustomer(null)}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>

        {/* Profile */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
              <User className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
              <p className="text-gray-600">{selectedCustomer.email}</p>
              <p className="text-sm text-gray-500">{selectedCustomer.sector}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {selectedCustomer.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Customer Health
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${health.color} h-3 rounded-full`}
                style={{ width: `${health.score}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm font-medium">{health.label} ({health.score}%)</p>
          </div>

          {/* Churn Risk */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" /> Churn Risk
            </h3>
            <p className="text-sm text-gray-600 mb-2">Predicted probability of churn</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${
                  ai.churnRisk > 50 ? "bg-red-500" : "bg-green-500"
                } h-3 rounded-full`}
                style={{ width: `${ai.churnRisk}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm font-medium">{ai.churnRisk}% risk</p>
          </div>

          {/* Next Purchase Prediction */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" /> Next Purchase
            </h3>
            <p className="text-gray-700 text-sm">{ai.nextPurchase}</p>
          </div>

          {/* Engagement Breakdown */}
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Engagement Breakdown
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email interactions: <span className="font-semibold">{ai.engagement.email}</span></li>
              <li>Purchases: <span className="font-semibold">{ai.engagement.purchases}</span></li>
              <li>Support tickets: <span className="font-semibold">{ai.engagement.support}</span></li>
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Recommended Actions
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {ai.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">AI Confidence: {ai.confidence}%</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          {transactions.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b">
                    <td className="p-2">{tx.date}</td>
                    <td className="p-2">₹{tx.amount.toLocaleString()}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : tx.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No transactions found.</p>
          )}
        </div>
      </div>
    );
  }

  // Main Customer List
  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Customers</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedCustomer(cust)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{cust.name}</p>
                <p className="text-sm text-gray-500">{cust.sector}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{cust.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {cust.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
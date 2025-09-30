import { useState } from "react";
import { Box, TrendingUp, AlertCircle, Package, X, Bot, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Inventory() {
  const [insightsOpen, setInsightsOpen] = useState(false);

  const handleRefreshInsights = () => {
    // Simulate refresh — replace this with actual data fetching later
    console.log("Insights refreshed!");

    // If you have a state for insights, you can refresh like:
    // setInsights([...newInsights])
  };

  const demoInventory = [
    { product: "Wireless Mouse", stock: 120, sales: 85 },
    { product: "Bluetooth Speaker", stock: 50, sales: 40 },
    { product: "Laptop Stand", stock: 15, sales: 12 },
    { product: "Mechanical Keyboard", stock: 0, sales: 25 },
  ];

  const lowStockCount = demoInventory.filter((i) => i.stock > 0 && i.stock < 20).length;
  const outOfStockCount = demoInventory.filter((i) => i.stock === 0).length;
  const topSeller = demoInventory.reduce(
    (prev, curr) => (curr.sales > prev.sales ? curr : prev),
    { product: "—", sales: -Infinity }
  ).product;

  const insights = [
    { id: 1, title: "Wireless Mouse", detail: "85 units sold this month", tag: "Best seller" },
    { id: 2, title: "Mechanical Keyboard", detail: "Out of stock — reorder suggested", tag: "Urgent" },
    { id: 3, title: "Laptop Stand", detail: "15 left — suggested reorder: 50 units", tag: "Low stock" },
    { id: 4, title: "Bluetooth Speaker", detail: "Sales growing — consider bundle offers", tag: "Growing" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Inventory Performance Hub
        </h2>
        <p className="text-sm text-gray-600">
          Monitor stock levels, sales performance & AI-driven insights.
        </p>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Total Products */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-violet-200 flex flex-col items-center">
          <Box className="w-5 h-5 text-violet-600 mb-1" />
          <p className="text-xs font-medium text-gray-500">Total Products</p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">{demoInventory.length}</h3>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-violet-200 flex flex-col items-center">
          <AlertCircle className="w-5 h-5 text-violet-600 mb-1" />
          <p className="text-xs font-medium text-gray-500">Low Stock Items</p>
          <h3 className="text-lg font-semibold text-violet-700 mt-1">{lowStockCount}</h3>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-violet-200 flex flex-col items-center">
          <AlertCircle className="w-5 h-5 text-violet-600 mb-1" />
          <p className="text-xs font-medium text-gray-500">Out of Stock</p>
          <h3 className="text-lg font-semibold text-violet-700 mt-1">{outOfStockCount}</h3>
        </div>

        {/* Top Seller */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-violet-200 flex flex-col items-center">
          <TrendingUp className="w-5 h-5 text-violet-600 mb-1" />
          <p className="text-xs font-medium text-gray-500">Top Seller</p>
          <h3 className="text-lg font-semibold text-violet-700 mt-1">{topSeller}</h3>
        </div>
      </div>



      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search product..."
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg shadow hover:bg-violet-700 transition">
            + Add Product
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow hover:bg-gray-200 transition">
            Export
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3 text-center">Sales (This Month)</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">AI Suggestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {demoInventory.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">{item.product}</td>
                <td className="px-6 py-4 text-center">{item.stock}</td>
                <td className="px-6 py-4 text-center">{item.sales}</td>
                <td className="px-6 py-4 text-center">
                  {item.stock === 0 ? (
                    <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      Out of Stock
                    </span>
                  ) : item.stock < 20 ? (
                    <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-sm text-violet-600 italic">
                  {item.stock === 0
                    ? "Reorder immediately"
                    : item.stock < 20
                      ? "Suggested reorder: 50 units"
                      : "Stable"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Insights (clickable) */}
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setInsightsOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setInsightsOpen(true)}
          className="cursor-pointer bg-gradient-to-r from-violet-50 to-violet-100 p-4 rounded-xl shadow border border-violet-200"
          aria-haspopup="dialog"
          aria-expanded={insightsOpen}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">AI Inventory Insights</h3>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li>Wireless Mouse is your <strong>best seller</strong> (85 units sold this month).</li>
                <li>Mechanical Keyboard is <strong>out of stock</strong> → reorder suggested.</li>
                <li>Laptop Stand stock is low (15 left) → reorder 50 units.</li>
                <li>Bluetooth Speaker sales growing steadily → consider bundle offers.</li>
              </ul>
            </div>

            <div className="flex-shrink-0 ml-3 relative group">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInsightsOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-700
          border-2 border-transparent bg-gradient-to-r from-white via-violet-200 to-white
          bg-[length:200%_200%] bg-clip-border
          animate-gradient-move shadow-sm overflow-hidden border-violet-600"
              >
                <Bot className="w-3.5 h-3.5 text-violet-600" />
                AI Insights
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {insightsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setInsightsOpen(false)}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative z-10 max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="insights-title"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h4 id="insights-title" className="text-lg font-semibold text-gray-900">
                      Inventory insights
                    </h4>
                  </div>

                  <button
                    onClick={() => setInsightsOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                    aria-label="Close insights"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Insights List */}
                <div className="mt-4 grid gap-4">
                  {insights.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.detail}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                          {item.tag}
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="text-sm px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                            Details
                          </button>
                          <button className="text-sm px-3 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700">
                            Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Last updated: Sep 16, 2025</span>
                    <button
                      onClick={handleRefreshInsights}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition"
                      title="Refresh Insights"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                      Export
                    </button>
                    <button className="text-sm px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                      Create reorder
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

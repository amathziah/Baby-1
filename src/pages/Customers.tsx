import { useState } from "react";
import { User } from "lucide-react";

type Customer = {
  name: string;
  email: string;
  sector: string;
  tags: string[];
};

export function Customers() {
  const demoCustomers: Customer[] = [
    { name: "Acme Corp", email: "accounts@acme.com", sector: "Corporate", tags: ["VIP"] },
    { name: "Tech Solutions", email: "billing@techsol.com", sector: "Tech", tags: ["Regular"] },
    { name: "Global Enterprises", email: "finance@global.com", sector: "Corporate", tags: ["High-Volume"] },
    { name: "SmartRetail Chain", email: "purchase@smartretail.in", sector: "Retail", tags: ["Chain"] },
    { name: "Manufacturing Hub Ltd", email: "procurement@mfghub.com", sector: "Manufacturing", tags: ["Bulk"] },
    { name: "EduTech Academy", email: "admin@edutech.com", sector: "Education", tags: ["New"] },
    { name: "TravelBuddy Pvt Ltd", email: "support@travelbuddy.com", sector: "Travel", tags: ["Regular"] },
    { name: "HealthPlus Clinic", email: "contact@healthplus.com", sector: "Healthcare", tags: ["VIP"] },
    { name: "Foodies Delight", email: "orders@foodies.com", sector: "Food & Beverage", tags: ["New"] },
    { name: "GreenEnergy Solutions", email: "info@greenenergy.com", sector: "Energy", tags: ["High-Volume"] },
    { name: "StyleHub Fashion", email: "sales@stylehub.com", sector: "Retail", tags: ["Regular"] },
    { name: "SmartFarm Tech", email: "info@smartfarm.com", sector: "Agriculture", tags: ["New"] },
    { name: "CityBank Ltd", email: "finance@citybank.com", sector: "Finance", tags: ["VIP"] },
    { name: "Global Logistics", email: "logistics@global.com", sector: "Logistics", tags: ["Bulk"] },
    { name: "NextGen AI", email: "contact@nextgenai.com", sector: "Tech", tags: ["High-Volume"] },
  ];

  const sectors = Array.from(new Set(demoCustomers.map((c) => c.sector)));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");

  const filteredCustomers = demoCustomers.filter((c) => {
    const matchesSector = selectedSector === "All" || c.sector === selectedSector;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <h2 className="text-2xl font-semibold mb-6">Customers</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="All">All Sectors</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      {/* Customers Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-violet-600" />
              <span className="text-lg font-medium text-gray-900">{cust.name}</span>
            </div>
            <div className="text-gray-500 text-sm mb-2">{cust.email}</div>
            <div className="flex flex-wrap gap-2 mt-auto">
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

      {filteredCustomers.length === 0 && (
        <p className="text-gray-500 mt-6">No customers match your search or filter criteria.</p>
      )}
    </div>
  );
}


  
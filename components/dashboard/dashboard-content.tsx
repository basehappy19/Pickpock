"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  Search
} from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";

interface DashboardContentProps {
  initialProducts: Product[];
}

export default function DashboardContent({ initialProducts }: DashboardContentProps) {
  const { t } = useLanguage();
  const { filteredData, filters, updateFilter } = useFilter(initialProducts);

  const stats = [
    { title: t.dashboard.stats.revenue, value: formatCurrency(125000), icon: DollarSign, trend: "+12%", color: "text-green-600" },
    { title: t.dashboard.stats.users, value: "1,240", icon: Users, trend: "+5%", color: "text-blue-600" },
    { title: t.dashboard.stats.products, value: initialProducts.length, icon: Package, trend: "0%", color: "text-purple-600" },
    { title: t.dashboard.stats.rating, value: "4.7", icon: TrendingUp, trend: "+0.2", color: "text-yellow-600" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-gray-500">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <button className="px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-600">{t.common.daily}</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">{t.common.weekly}</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">{t.common.monthly}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend} <ArrowUpRight size={12} className="ml-1" />
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t.dashboard.filters.search}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
            />
          </div>
          <select 
            className="w-full md:w-48 p-2 rounded-lg border bg-white outline-none"
            value={filters.category}
            onChange={(e) => updateFilter({ category: e.target.value })}
          >
            <option value="all">{t.dashboard.filters.allCategories}</option>
            {/* Unique categories from initialProducts */}
            {Array.from(new Set(initialProducts.map(p => p.category))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold">{t.dashboard.table.title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                <th className="px-6 py-3 font-medium">{t.dashboard.table.name}</th>
                <th className="px-6 py-3 font-medium">{t.dashboard.table.category}</th>
                <th className="px-6 py-3 font-medium">{t.dashboard.table.price}</th>
                <th className="px-6 py-3 font-medium">{t.dashboard.table.stock}</th>
                <th className="px-6 py-3 font-medium">{t.dashboard.table.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">{item.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.stock > 10 ? t.dashboard.table.inStock : t.dashboard.table.lowStock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              {t.dashboard.table.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

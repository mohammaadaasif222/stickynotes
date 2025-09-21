import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar,

} from "lucide-react";
import { Button } from "./Button";

export const Table = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchable = true,
  dateFilterable = true,
  className = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Filter and search logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDate =
      !dateFilter.start ||
      !dateFilter.end ||
      (item.date &&
        new Date(item.date) >= new Date(dateFilter.start) &&
        new Date(item.date) <= new Date(dateFilter.end));

    return matchesSearch && matchesDate;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Filters */}
      <div className="p-4 mb-4 border border-white/20 rounded-md bg-[#1e1e1e]">
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {dateFilterable && (
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start: e.target.value })
                  }
                  className="pl-10 pr-4 py-2 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end: e.target.value })
                  }
                  className="pl-10 pr-4 py-2 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1e1e1e]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-base font-medium text-gray-200  tracking-wider cursor-pointer transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig.key === column.key && (
                      <span className="text-blue-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-800 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"
                  >
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-900 border-t border-white/20 flex items-center justify-between">
          <div className="text-sm text-gray-200">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "text-gray-100 hover:bg-blue-700"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

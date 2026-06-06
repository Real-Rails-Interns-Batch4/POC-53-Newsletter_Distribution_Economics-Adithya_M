"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "@/lib/api";
import type { DashboardData, FilterState } from "@/types/dashboard";
import { IntelligenceSidebar } from "./IntelligenceSidebar";
import { MainStage } from "./MainStage";

const DEFAULT_FILTERS: FilterState = {
  cohort: "all",
  startMonth: "2024-07",
  endMonth: "2025-03",
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (currentFilters: FilterState) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard(currentFilters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (!data && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-obsidian">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading intelligence rail...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-obsidian">
        <p className="text-sm text-red-400">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-obsidian">
      {/* Main Stage — 70% */}
      <div className="w-[70%] min-w-0 border-r border-border-rail">
        <MainStage data={data} />
      </div>

      {/* Intelligence Sidebar — 30% */}
      <div className="w-[30%] min-w-0">
        <IntelligenceSidebar
          data={data}
          filters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

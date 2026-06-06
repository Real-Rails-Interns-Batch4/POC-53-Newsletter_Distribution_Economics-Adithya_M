"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SponsorshipRow } from "@/types/dashboard";
import { formatMonth } from "@/lib/utils";

interface SponsorshipChartProps {
  data: SponsorshipRow[];
}

export function SponsorshipChart({ data }: SponsorshipChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "#1F2937" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "#1F2937" }}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "#1F2937" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0B1117",
            border: "1px solid #1F2937",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const v = Number(value ?? 0);
            const n = String(name);
            if (n === "CPM" || n.includes("Revenue")) return [`$${v.toFixed(2)}`, n];
            return [v, n];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
        <Bar
          yAxisId="left"
          dataKey="revenue_per_send"
          name="Revenue/Send"
          fill="rgba(56, 189, 248, 0.7)"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="total_revenue"
          name="Total Revenue"
          fill="rgba(129, 140, 248, 0.5)"
          radius={[3, 3, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cpm"
          name="CPM"
          stroke="#34D399"
          strokeWidth={2}
          dot={{ r: 3, fill: "#34D399" }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="slots"
          name="Sponsor Slots"
          stroke="#FBBF24"
          strokeWidth={2}
          dot={{ r: 3, fill: "#FBBF24" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  Area,
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
import type { CohortRow } from "@/types/dashboard";
import { formatMonth } from "@/lib/utils";

interface CohortChartProps {
  data: CohortRow[];
}

export function CohortChart({ data }: CohortChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
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
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "#1F2937" }}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{
            background: "#0B1117",
            border: "1px solid #1F2937",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#F1F5F9" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="subscribers"
          name="Subscribers"
          fill="rgba(56, 189, 248, 0.15)"
          stroke="#38BDF8"
          strokeWidth={2}
        />
        <Bar
          yAxisId="left"
          dataKey="new_subscribers"
          name="New Subs"
          fill="rgba(129, 140, 248, 0.6)"
          radius={[2, 2, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="churn_rate"
          name="Churn %"
          stroke="#F87171"
          strokeWidth={2}
          dot={{ r: 3, fill: "#F87171" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

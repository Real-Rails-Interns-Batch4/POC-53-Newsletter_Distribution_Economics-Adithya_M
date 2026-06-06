"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { DeliverabilityRow } from "@/types/dashboard";
import { formatMonth } from "@/lib/utils";

interface DeliverabilityChartProps {
  data: DeliverabilityRow[];
}

export function DeliverabilityChart({ data }: DeliverabilityChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
    open_delta: d.open_rate - d.industry_open_rate,
    bounce_delta: d.bounce_rate - d.industry_bounce_rate,
    spam_delta: d.spam_rate - d.industry_spam_rate,
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
          formatter={(value, name) => [`${value ?? 0}%`, String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
        <ReferenceLine
          y={35}
          stroke="#818CF8"
          strokeDasharray="4 4"
          label={{ value: "Industry Open", fill: "#818CF8", fontSize: 10 }}
        />
        <Bar dataKey="open_rate" name="Open Rate" fill="#38BDF8" radius={[3, 3, 0, 0]} />
        <Line
          type="monotone"
          dataKey="bounce_rate"
          name="Bounce Rate"
          stroke="#F87171"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="spam_rate"
          name="Spam Rate"
          stroke="#FBBF24"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="industry_open_rate"
          name="Industry Open (benchmark)"
          stroke="#818CF8"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

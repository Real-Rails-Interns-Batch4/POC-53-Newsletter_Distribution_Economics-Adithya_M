"use client";

import ReactECharts from "echarts-for-react";
import type { ReferralFlow } from "@/types/dashboard";

interface ReferralChartProps {
  flows: ReferralFlow[];
}

export function ReferralChart({ flows }: ReferralChartProps) {
  const nodes = new Set<string>();
  flows.forEach((f) => {
    nodes.add(f.source);
    nodes.add(f.target);
  });

  const nodeList = Array.from(nodes).map((name) => ({ name }));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: "#0B1117",
      borderColor: "#1F2937",
      textStyle: { color: "#F1F5F9", fontSize: 12 },
    },
    series: [
      {
        type: "sankey",
        layout: "none",
        emphasis: { focus: "adjacency" },
        nodeAlign: "left",
        data: nodeList,
        links: flows.map((f) => ({
          source: f.source,
          target: f.target,
          value: f.value,
        })),
        lineStyle: {
          color: "gradient",
          curveness: 0.5,
          opacity: 0.4,
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: "#1F2937",
        },
        label: {
          color: "#94A3B8",
          fontSize: 11,
        },
        levels: [
          {
            depth: 0,
            itemStyle: { color: "#38BDF8" },
          },
          {
            depth: 1,
            itemStyle: { color: "#818CF8" },
          },
          {
            depth: 2,
            itemStyle: { color: "#34D399" },
          },
        ],
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 320, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}

// components/dashboard/SalesChart.tsx

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipValueType,
} from "recharts";

interface SalesChartProps {
  data?: Array<{
    jour: string;
    benefice: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = data?.length
    ? data
    : [
        { jour: "Lun", benefice: 0 },
        { jour: "Mar", benefice: 0 },
        { jour: "Mer", benefice: 0 },
        { jour: "Jeu", benefice: 0 },
        { jour: "Ven", benefice: 0 },
        { jour: "Sam", benefice: 0 },
        { jour: "Dim", benefice: 0 },
      ];

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="jour"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(v: TooltipValueType | undefined) => [
              `${Number(v).toLocaleString()} FC`,
              "Bénéfice",
            ]}
          />
          <Bar dataKey="benefice" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

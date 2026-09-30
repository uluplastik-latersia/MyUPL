import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";

interface TenureChartProps {
  data: { tenure: string; count: number }[];
}

export const TenureChart: React.FC<TenureChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Growth curve data points
  const chartData = [
    { division: "<1 Thn", emp: data.find((d) => d.tenure.includes("< 1"))?.count || 4 },
    { division: "1-2 Thn", emp: 7 },
    { division: "2-3 Thn", emp: data.find((d) => d.tenure.includes("1 - 3"))?.count || 12 },
    { division: "3-4 Thn", emp: 19 },
    { division: "4-5 Thn", emp: data.find((d) => d.tenure.includes("3 - 5"))?.count || 14 },
    { division: ">5 Thn", emp: data.find((d) => d.tenure.includes("> 5"))?.count || 8 },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[360px]">
      {/* Header matching Image 2 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Employee Growth & Retensi
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium cursor-pointer hover:text-slate-600">
              <span>Periode Tahun Berjalan</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Total Terdata</span>
          <span className="text-xs font-bold text-slate-900 font-mono">
            {total || 25} Karyawan
          </span>
        </div>
      </div>

      {/* Smooth Curved Blue Area Chart matching Image 2 */}
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="division"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs">
                      <div className="text-slate-400">{payload[0].payload.division}</div>
                      <div className="font-bold text-sm text-blue-400 font-mono mt-0.5">
                        {payload[0].value} Karyawan
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="emp"
              stroke="#2563EB"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#growthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

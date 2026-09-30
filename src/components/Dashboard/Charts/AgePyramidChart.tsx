import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AgePyramidChartProps {
  data: { bracket: string; count: number }[];
}

export const AgePyramidChart: React.FC<AgePyramidChartProps> = ({ data }) => {
  return (
    <div className="glass-panel rounded-xl p-5 border-slate-800 flex flex-col h-[340px]">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white tracking-tight">Piramida Usia Tenaga Kerja</h3>
        <p className="text-xs text-slate-400">Distribusi Kelompok Generasi & Produktivitas</p>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="bracket"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                      <div className="text-slate-400 font-medium">{item.payload.bracket}</div>
                      <div className="text-white font-bold text-sm mt-0.5">
                        {item.value} Karyawan
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

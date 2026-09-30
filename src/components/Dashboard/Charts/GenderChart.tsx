import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface GenderChartProps {
  data: { name: string; value: number; color: string }[];
}

export const GenderChart: React.FC<GenderChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="glass-panel rounded-xl p-5 border-slate-800 flex flex-col h-[340px]">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white tracking-tight">Distribusi Gender</h3>
        <p className="text-xs text-slate-400">Komposisi Tenaga Kerja (Laki-laki vs Perempuan)</p>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#1E293B" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const percent = total > 0 ? (((item.value as number) / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-slate-300 mt-0.5">
                        {item.value} Karyawan ({percent}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-xl font-bold text-white">{total}</span>
          <span className="block text-[10px] text-slate-400 font-medium uppercase">Total</span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Calendar, User, ChevronDown } from "lucide-react";

interface GenderChartProps {
  data: { name: string; value: number; color: string }[];
}

const DONUT_COLORS = ["#7C3AED", "#10B981", "#2563EB", "#06B6D4"];

export const GenderChart: React.FC<GenderChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const displayData = data.length > 0 ? data : [
    { name: "Laki-laki", value: 12, color: "#7C3AED" },
    { name: "Perempuan", value: 8, color: "#10B981" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Attendance & Demografi</h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium cursor-pointer hover:text-slate-600">
              <span>Hari ini, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart with Center User Avatar */}
      <div className="flex-1 flex items-center justify-between gap-4">
        <div className="relative w-48 h-48 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={4}
                dataKey="value"
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = total > 0 ? (((item.value as number) / total) * 100).toFixed(0) : 0;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-slate-300 font-mono">{item.value} Karyawan ({percent}%)</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center User Avatar Icon matching Image 2 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Legend Pills matching Reference Image */}
        <div className="space-y-3 pr-4">
          {displayData.map((entry, idx) => {
            const percent = total > 0 ? Math.round((entry.value / total) * 100) : 50;
            return (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || DONUT_COLORS[idx % DONUT_COLORS.length] }}
                />
                <span className="text-slate-600 font-medium min-w-[70px]">{entry.name}</span>
                <span className="font-bold text-slate-900 font-mono">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

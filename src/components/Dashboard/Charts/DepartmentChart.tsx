import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DepartmentChartProps {
  data: { department: string; count: number }[];
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="glass-panel rounded-xl p-5 border-slate-800 flex flex-col h-[340px]">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white tracking-tight">Karyawan per Departemen</h3>
        <p className="text-xs text-slate-400">Distribusi Alokasi SDM per Divisi Kerja</p>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sorted}
            margin={{ top: 5, right: 25, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              stroke="#94A3B8"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              type="category"
              dataKey="department"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                      <div className="text-slate-400 font-medium">{item.payload.department}</div>
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
              fill="#0EA5E9"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { SlidersHorizontal } from "lucide-react";

interface DepartmentChartProps {
  data: { department: string; count: number }[];
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  // Map department list or sample Indonesian factory divisions
  const defaultDivisions = [
    { name: "Operations", current: 8, target: 6 },
    { name: "IT & Eng", current: 12, target: 9 },
    { name: "HR & GA", current: 5, target: 4 },
    { name: "Finance", current: 7, target: 8 },
    { name: "Marketing", current: 9, target: 7 },
    { name: "Production", current: 18, target: 14 },
    { name: "QC / QA", current: 6, target: 5 },
  ];

  const chartData =
    data && data.length > 0
      ? data.map((d) => ({
          name: d.department.length > 12 ? d.department.slice(0, 11) + "..." : d.department,
          current: d.count,
          target: Math.max(1, Math.round(d.count * 0.75)),
        }))
      : defaultDivisions;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
      {/* Header matching Image 2 Performance card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Performance & Distribusi Divisi</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisasi perbandingan kekuatan staf aktif per departemen kerja
          </p>
        </div>

        {/* Legend & Filter button matching Image 2 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Bulan Ini</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-200" />
            <span className="text-slate-500 font-medium">Bulan Lalu</span>
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
          >
            <span>Filter</span>
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dual Bar Chart (Blue & Light Blue) matching Image 2 */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="name"
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
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-xs">
                      <div className="font-semibold text-slate-300">{payload[0].payload.name}</div>
                      <div className="text-blue-400 font-bold mt-1">
                        Bulan Ini: {payload[0].value} Karyawan
                      </div>
                      {payload[1] && (
                        <div className="text-blue-200 font-medium">
                          Bulan Lalu: {payload[1].value} Karyawan
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="current" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="target" fill="#BFDBFE" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

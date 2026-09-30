import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Users, Briefcase } from "lucide-react";

interface EmploymentStatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  TETAP: "#2563EB", // Vibrant Blue
  KONTRAK: "#F59E0B", // Amber
  HARIAN: "#06B6D4", // Cyan
  MAGANG: "#8B5CF6", // Purple
};

export const EmploymentStatusChart: React.FC<EmploymentStatusChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[360px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Status Hubungan Kerja</h3>
            <p className="text-[11px] text-slate-400 font-medium">PKWTT, PKWT, Harian & Magang</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="status"
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
              cursor={{ fill: "rgba(37, 99, 235, 0.04)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs">
                      <div className="text-slate-400">{payload[0].payload.status}</div>
                      <div className="font-bold text-sm text-blue-400 font-mono mt-0.5">
                        {payload[0].value} Karyawan
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-status-${index}`}
                  fill={STATUS_COLORS[entry.status] || "#2563EB"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

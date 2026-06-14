/**
 * Reusable Chart Components
 * Simple SVG-based charts for KPI dashboards
 */

import { cn } from "@/lib/utils";

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
  showArea?: boolean;
}

export function LineChart({ data, color = "text-primary", height = 200, showArea = true }: LineChartProps) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80; // Leave 10% padding
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0" y1={y} x2="100" y2={y}
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        {showArea && (
          <polygon
            points={areaPoints}
            fill="currentColor"
            className={`${color} opacity-20`}
          />
        )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={color}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - min) / range) * 80;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              className="fill-background stroke-current stroke-2"
              style={{ stroke: 'var(--color-primary)' }}
            />
          );
        })}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  horizontal?: boolean;
}

export function BarChart({ data, horizontal = false }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value));

  if (horizontal) {
    return (
      <div className="w-full space-y-3">
        {data.map((item, i) => {
          const width = max > 0 ? (item.value / max) * 100 : 0;
          const colors = ['bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
          const color = item.color || colors[i % colors.length];

          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", color)}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full h-48 flex items-end justify-around gap-2">
      {data.map((item, i) => {
        const height = max > 0 ? (item.value / max) * 100 : 0;
        const colors = ['bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
        const color = item.color || colors[i % colors.length];

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={cn("w-full rounded-t-lg transition-all duration-1000", color)}
              style={{ height: `${height * 0.8}%` }}
            />
            <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider truncate w-full text-center">
              {item.label.slice(0, 8)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  centerContent?: React.ReactNode;
}

export function DonutChart({ data, centerContent }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const circumference = 2 * Math.PI * 40; // r=40

  let currentOffset = 0;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted/30"
        />

        {/* Data segments */}
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const dashArray = (percentage / 100) * circumference;
          const dashOffset = -currentOffset;

          currentOffset += dashArray;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={item.color}
            />
          );
        })}
      </svg>

      {/* Center content */}
      {centerContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export function StatCard({ label, value, change, trend, icon: Icon, color = "text-primary" }: StatCardProps) {
  return (
    <div className="bg-card border-2 border-primary/5 rounded-[2rem] p-6 shadow-xl shadow-primary/5 space-y-4">
      <div className="flex justify-between items-start">
        {Icon && (
          <div className={cn("p-3 rounded-2xl bg-muted", color)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        {change && trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-widest",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-600" :
            trend === 'down' ? "bg-rose-500/10 text-rose-600" :
            "bg-muted text-muted-foreground"
          )}>
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-semibold tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}

interface KPITableProps {
  columns: Array<{ key: string; label: string }>;
  data: Array<Record<string, any>>;
}

export function KPITable({ columns, data }: KPITableProps) {
  return (
    <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/20">
              {columns.map(col => (
                <th key={col.key} className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-8 py-6">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

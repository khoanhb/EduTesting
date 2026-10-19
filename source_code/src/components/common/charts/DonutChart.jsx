import React from 'react';

/**
 * Biểu đồ tròn donut dùng chung cho Dashboard Giảng viên (2.0) và
 * Dashboard Quản trị viên (4.0). Vẽ thuần SVG (stroke-dasharray trên <circle>),
 * không dùng thư viện ngoài.
 *
 * Dữ liệu mỗi phần tử: { id, label, count, percent, color }.
 */
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ items = [], totalLabel = 'Tổng', emptyMessage = 'Chưa có dữ liệu.' }) {
  if (items.length === 0) {
    return <p className="text-xs text-[#94A3B8]">{emptyMessage}</p>;
  }

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center max-w-2xl mx-auto gap-8">
      <div className="relative w-[180px] h-[180px] shrink-0">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="20" />
          {items.map((item, index) => {
            const dash = (item.percent / 100) * CIRCUMFERENCE;
            const accumulatedPercent = items.slice(0, index).reduce((sum, previous) => sum + previous.percent, 0);
            const offset = -(accumulatedPercent / 100) * CIRCUMFERENCE;

            return (
              <circle
                key={item.id}
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-[#0F172A]">{totalCount.toLocaleString('vi-VN')}</span>
          <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide text-center px-3">
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-xs gap-3">
            <span className="flex items-center gap-2.5 text-[#475569] font-medium min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </span>
            <span className="flex items-center gap-3 shrink-0">
              <span className="text-[#0F172A] font-bold">{item.count.toLocaleString('vi-VN')}</span>
              <span className="text-[#94A3B8] font-medium w-9 text-right">{item.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

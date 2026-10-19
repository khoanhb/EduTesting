import React from 'react';

/**
 * Biểu đồ cột phổ điểm 0 - 10, mỗi cột cách nhau 0.5đ (2.6 - FR-09.3).
 *
 * Props:
 *  - distribution: [{ range: '7-7.5', count: number }]
 *
 * Vẽ thuần CSS; màu cột theo mức điểm (Đạt/Khá/Giỏi/Xuất sắc) và có tooltip
 * hiển thị số lượng + tỷ lệ khi rê chuột. Component tự tính tỷ lệ % nên chỉ
 * cần dữ liệu { range, count }.
 */

/** Lấy cận dưới của khoảng điểm, ví dụ '7-7.5' -> 7. */
function getLowerBound(range) {
  const [lower] = String(range).split('-');
  const value = Number(lower);
  return Number.isFinite(value) ? value : 0;
}

/** Màu cột theo mức điểm (thang 10). */
function getBarColor(range) {
  const lower = getLowerBound(range);
  if (lower < 5) return '#EF4444'; // Trượt
  if (lower < 6.5) return '#F59E0B'; // Trung bình
  if (lower < 8) return '#06B6D4'; // Khá
  return '#10B981'; // Giỏi / Xuất sắc
}

export default function ScoreDistributionChart({ distribution = [] }) {
  if (distribution.length === 0) {
    return <p className="text-xs text-[#94A3B8]">Chưa có dữ liệu phổ điểm.</p>;
  }

  const total = distribution.reduce((sum, item) => sum + (item.count || 0), 0);
  const maxCount = Math.max(...distribution.map((item) => item.count || 0), 1);

  return (
    <div>
      <div className="flex items-end gap-1 h-56 border-b border-[#E2E8F0] pb-1">
        {distribution.map((item) => {
          const height = Math.round(((item.count || 0) / maxCount) * 100);
          const percent = total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0;

          return (
            <div key={item.range} className="flex-1 h-full flex flex-col justify-end items-center group relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0F172A] text-white rounded-[8px] px-3 py-2 text-[11px] whitespace-nowrap z-20 shadow-lg">
                <p className="font-bold">Khoảng {item.range}</p>
                <p>{item.count} sinh viên · {percent}%</p>
              </div>

              <span className="text-[10px] font-bold text-[#0F172A] mb-1">{item.count}</span>

              <div
                className="w-full rounded-t-[4px] transition-colors"
                style={{ height: `${Math.max(height, 2)}%`, backgroundColor: getBarColor(item.range) }}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 mt-2">
        {distribution.map((item) => (
          <span key={item.range} className="flex-1 text-center text-[9px] text-[#94A3B8] font-semibold whitespace-nowrap">
            {item.range}
          </span>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Biểu đồ cột dùng chung cho Dashboard Giảng viên (2.0) và Dashboard Quản trị
 * viên (4.0). Component thuần trình bày, mọi nhãn/khóa dữ liệu đều truyền qua
 * props nên không hard-code tên trường của bất kỳ màn hình nào.
 *
 * Ba chế độ hiển thị (tương thích ngược hoàn toàn):
 *
 * 1. Hai chỉ số khác đơn vị (mặc định), cột chính + cột phụ, mỗi cột có thang
 *    đo riêng. Dùng cho "Lượt nộp bài" (số lượng) kèm "Điểm trung bình" (điểm).
 *    Tooltip ghi rõ tên và đơn vị của từng chỉ số để người xem không nhầm rằng
 *    hai cột có thể so sánh trực tiếp với nhau.
 *
 * 2. Một chỉ số duy nhất, truyền `secondaryKey={null}`.
 *
 * 3. Nhiều chuỗi cùng đơn vị, truyền `series=[{ key, label, color, decimals }]`.
 *    Mọi chuỗi dùng CHUNG một thang đo nên có thể so sánh trực tiếp về chiều cao.
 *    Dùng cho breakdown "lượt thi theo Bộ môn".
 */

const DEFAULT_PRIMARY_COLOR = '#06B6D4';
const DEFAULT_SECONDARY_COLOR = '#6366F1';

/** Số hiển thị theo số chữ số thập phân yêu cầu. */
function formatValue(value, decimals) {
  const numeric = Number(value) || 0;
  return decimals > 0
    ? numeric.toFixed(decimals)
    : numeric.toLocaleString('vi-VN');
}

export default function TrendBarChart({
  items = [],
  xKey = 'label',
  /**
   * Khóa chứa nhãn đầy đủ hiển thị trong tooltip. Trục hoành cần nhãn ngắn
   * (12 cột vẫn đọc được) nhưng tooltip cần nhãn đầy đủ kèm năm, nên hai nhãn
   * được tách riêng: `xKey` cho trục, `tooltipLabelKey` cho tooltip.
   */
  tooltipLabelKey = null,
  primaryKey = 'submissions',
  secondaryKey = 'averageScore',
  primaryLabel = 'Lượt nộp bài',
  secondaryLabel = 'Điểm trung bình',
  primaryColor = DEFAULT_PRIMARY_COLOR,
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  series = null,
  secondaryMax = 10,
  primaryDecimals = 0,
  secondaryDecimals = 1,
  emptyMessage = 'Chưa có dữ liệu để vẽ biểu đồ.',
}) {
  if (items.length === 0) {
    return <p className="text-xs text-[#94A3B8]">{emptyMessage}</p>;
  }

  const isSeriesMode = Array.isArray(series) && series.length > 0;
  const hasSecondary = !isSeriesMode && secondaryKey !== null && secondaryKey !== undefined;

  /** Cấu hình các cột cần vẽ cho từng chế độ. */
  const barSeries = isSeriesMode
    ? series.map((entry) => ({
        key: entry.key,
        label: entry.label,
        color: entry.color || DEFAULT_PRIMARY_COLOR,
        decimals: entry.decimals ?? 0,
        scale: 'shared',
      }))
    : hasSecondary
      ? [
          { key: primaryKey, label: primaryLabel, color: primaryColor, decimals: primaryDecimals, scale: 'primary' },
          {
            key: secondaryKey,
            label: secondaryLabel,
            color: secondaryColor,
            decimals: secondaryDecimals,
            scale: 'secondary',
          },
        ]
      : [
          {
            key: primaryKey,
            label: primaryLabel,
            color: primaryColor,
            decimals: primaryDecimals,
            scale: 'shared',
          },
        ];

  // Thang đo của cột chính (hoặc thang chung cho mọi chuỗi cùng đơn vị).
  const sharedMax = Math.max(
    1,
    ...items.flatMap((item) => barSeries.map((entry) => Number(item[entry.key]) || 0))
  );
  const primaryMax = Math.max(1, ...items.map((item) => Number(item[primaryKey]) || 0));
  // Cột phụ luôn vẽ theo thang cố định (mặc định 0–10 điểm) để so sánh giữa các kỳ.
  const secondaryScaleMax = Math.max(
    Number(secondaryMax) || 10,
    ...items.map((item) => Number(item[secondaryKey]) || 0)
  );

  const scaleMaxOf = (entry) => {
    if (entry.scale === 'shared') return sharedMax;
    if (entry.scale === 'secondary') return secondaryScaleMax;
    return primaryMax;
  };

  return (
    <div>
      {/* Chú giải: mỗi chuỗi một nhãn, kèm ghi chú thang đo khi hai cột khác đơn vị. */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-4 text-[11px] font-medium">
        {barSeries.map((entry) => (
          <span key={entry.key} className="flex items-center gap-1.5 text-[#475569]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span>
            {entry.label}
            {entry.scale === 'secondary' && (
              <span className="text-[#94A3B8] font-normal">(thang điểm riêng)</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-end justify-between gap-2 h-52 border-b border-[#E2E8F0] pb-1">
        {items.map((item) => {
          const label = item[xKey];
          const total = item.attempts ?? null;

          return (
            <div
              key={item.id ?? label}
              className="flex-1 h-full flex flex-col justify-end items-center group relative"
            >
              {/* Tooltip: nêu rõ tên chỉ số + giá trị, đủ để hiểu số liệu đang xem. */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0F172A] text-white rounded-[8px] px-3 py-2 text-[11px] whitespace-nowrap z-20 shadow-lg text-left">
                <p className="font-bold mb-0.5">
                  {tooltipLabelKey ? item[tooltipLabelKey] ?? label : label}
                </p>
                {barSeries.map((entry) => (
                  <p key={entry.key}>
                    {entry.label}:{' '}
                    <span className="font-semibold" style={{ color: entry.color }}>
                      {formatValue(item[entry.key], entry.decimals)}
                      {entry.scale === 'secondary' ? ' điểm' : ''}
                    </span>
                  </p>
                ))}
                {isSeriesMode && total !== null && (
                  <p className="mt-0.5 pt-1 border-t border-white/20">
                    Tổng lượt thi:{' '}
                    <span className="font-semibold text-[#67E8F9]">
                      {formatValue(total, 0)}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-end gap-1 w-full justify-center h-full">
                {barSeries.map((entry) => {
                  const value = Number(item[entry.key]) || 0;
                  const height = Math.round((value / scaleMaxOf(entry)) * 100);

                  return (
                    <div
                      key={entry.key}
                      className={`rounded-t-[6px] transition-colors ${barSeries.length > 2 ? 'w-3' : 'w-5'}`}
                      style={{
                        height: `${Math.max(height, value > 0 ? 2 : 0)}%`,
                        backgroundColor: entry.color,
                      }}
                      title={`${label} · ${entry.label}: ${formatValue(value, entry.decimals)}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-2 mt-2">
        {items.map((item) => (
          <span
            key={`label-${item.id ?? item[xKey]}`}
            className="flex-1 text-center text-[10px] text-[#94A3B8] font-medium truncate"
            title={item[xKey]}
          >
            {item[xKey]}
          </span>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Radio } from 'lucide-react';

/**
 * Nút "Giám sát" dùng chung cho Dashboard Giảng viên (2.0), Quản lý đề thi (2.4)
 * và Dashboard Quản trị viên (4.0) - đảm bảo UI/UX đồng nhất 100% giữa các màn hình.
 *
 * Khi nối API: điều hướng sang FR-10 (AntiCheatMonitorPage) kèm examId/roomId.
 */
export default function MonitorExamButton({ onClick, room, label = 'Giám sát' }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(room)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-[11px] font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
    >
      <Radio className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

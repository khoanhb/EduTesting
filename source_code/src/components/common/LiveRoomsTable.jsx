import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';
import MonitorExamButton from '../../pages/teacher/components/MonitorExamButton';

/**
 * Bảng danh sách phòng thi đang diễn ra (dùng chung cho Dashboard Giảng viên 2.0
 * và Dashboard Quản trị viên 4.0). Nhận dữ liệu qua props, không tự gọi API.
 *
 * UI/UX được đồng bộ 100% với bảng ở ExamManagementPage (2.4): cùng cấu trúc cột,
 * cùng kiểu hiển thị phòng thi (văn bản thuần, không badge) và cùng nút "Giám sát".
 *
 * API tương ứng: GET /teacher/live-rooms  |  GET /admin/dashboard (rooms)
 */
export default function LiveRoomsTable({ rooms = [], onMonitor, monitorLabel = 'Giám sát' }) {
  if (rooms.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-[#94A3B8]">
        Hiện không có phòng thi nào đang diễn ra trong các môn học bạn được phân công.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[880px]">
        <thead>
          <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0]">
            <th className="pb-3 pr-3">Môn thi / Kỳ thi</th>
            <th className="pb-3 pr-3">Phòng thi</th>
            <th className="pb-3 pr-3">Giám thị</th>
            <th className="pb-3 pr-3">Khung giờ</th>
            <th className="pb-3 pr-3">Tiến độ thí sinh</th>
            <th className="pb-3 pr-3">Vi phạm</th>
            <th className="pb-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rooms.map((room) => {
            const progressPercent = Math.round((room.online / room.candidates) * 100);

            return (
              <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 pr-3">
                  <div className="font-bold text-[#0F172A]">{room.subjectName}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">Mã kỳ thi: {room.examCode}</div>
                </td>

                <td className="py-3.5 pr-3 text-[#0F172A] font-semibold whitespace-nowrap">
                  {room.room}
                </td>

                <td className="py-3.5 pr-3 text-[#475569]">{room.proctorName}</td>

                <td className="py-3.5 pr-3 text-[#475569] font-medium whitespace-nowrap">{room.timeRange}</td>

                <td className="py-3.5 pr-3">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold mb-1.5 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
                    {room.online}/{room.candidates} đang làm bài
                  </div>
                  <div className="w-32 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06B6D4] rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </td>

                <td className="py-3.5 pr-3">
                  {room.violations > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FEF2F2] text-[#EF4444] rounded text-[11px] font-bold">
                      <ShieldAlert className="w-3 h-3" />
                      {room.violations}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#10B981] font-semibold">Không có</span>
                  )}
                </td>

                <td className="py-3.5 text-right">
                  <MonitorExamButton room={room} onClick={onMonitor} label={monitorLabel} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

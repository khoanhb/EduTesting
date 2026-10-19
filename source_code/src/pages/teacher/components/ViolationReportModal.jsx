import React, { useState } from 'react';
import { X, User, ShieldAlert } from 'lucide-react';

const PENALTY_OPTIONS = [
  'Nhắc nhở, không trừ điểm',
  'Trừ 25% số điểm bài thi',
  'Trừ 50% số điểm bài thi',
  'Hủy toàn bộ kết quả bài thi',
];

/**
 * Modal M.14 Giảng viên/Giám thị lập biên bản vi phạm quy chế thi (2.7 - FR-10.4).
 * Sau khi lưu, nút thao tác trên bảng chuyển thành "Xem biên bản".
 */
export default function ViolationReportModal({ isOpen, onClose, onSubmit, violation }) {
  const [sourceViolation, setSourceViolation] = useState(violation);
  const [penalty, setPenalty] = useState(violation?.report?.penalty ?? PENALTY_OPTIONS[2]);
  const [detail, setDetail] = useState(violation?.report?.detail ?? '');

  // Nạp lại nội dung mặc định mỗi khi mở với một vi phạm khác
  if (sourceViolation !== violation) {
    setSourceViolation(violation);
    if (violation) {
      setPenalty(violation.report?.penalty ?? PENALTY_OPTIONS[2]);
      setDetail(violation.report?.detail ?? '');
    }
  }

  if (!isOpen || !violation) return null;

  const isReadOnly = Boolean(violation.report);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      studentName: violation.studentName,
      studentId: violation.studentId,
      examCode: violation.examCode,
      testCode: violation.report?.testCode ?? '001',
      room: violation.room,
      behavior: `${violation.type} (${violation.occurrences}/${violation.maxOccurrences} lần) - Hệ thống đã khóa bài thi lúc ${violation.lastTime}`,
      penalty,
      detail,
      reportedAt: violation.report?.reportedAt ?? violation.lastTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] shadow-2xl p-6 md:p-8 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          title="Đóng"
          className="absolute top-6 right-6 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-base font-bold text-[#0F172A]">
            {isReadOnly ? 'Biên bản vi phạm quy chế thi' : 'Lập biên bản vi phạm quy chế thi'}
          </h3>
        </div>

        {/* Thông tin thí sinh & ca thi */}
        <div className="text-xs mb-5">
          <span className="font-semibold text-[#475569] block mb-2">Thông tin sinh viên & ca thi:</span>
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:divide-x divide-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#06B6D4] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Thí sinh</div>
                  <div className="font-bold text-[#0F172A]">{violation.studentName}</div>
                </div>
              </div>
              <div className="lg:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Mã số sinh viên</div>
                <div className="font-bold text-[#0F172A]">{violation.studentId}</div>
              </div>
              <div className="lg:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Kỳ thi</div>
                <div className="font-bold text-[#0F172A]">{violation.examCode}</div>
              </div>
              <div className="lg:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Phòng thi</div>
                <div className="font-bold text-[#0F172A]">{violation.room}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hành vi phát hiện tự động */}
        <div className="text-xs mb-4">
          <span className="font-semibold text-[#475569] block mb-1.5">Hành vi phát hiện tự động:</span>
          <div className="p-3 bg-[#FEF2F2] text-[#EF4444] rounded-[8px] border border-[#FCA5A5] font-semibold leading-relaxed">
            {violation.type} ({violation.occurrences}/{violation.maxOccurrences} lần) - lần cuối lúc {violation.lastTime}
          </div>
        </div>

        {/* Nhật ký sự kiện chi tiết */}
        <div className="text-xs mb-4">
          <span className="font-semibold text-[#475569] block mb-1.5">Nhật ký ghi nhận chi tiết:</span>
          <ul className="bg-white border border-[#E2E8F0] rounded-[12px] divide-y divide-[#E2E8F0]">
            {violation.events.map((event) => (
              <li key={`${event.time}-${event.type}`} className="px-3.5 py-2.5 flex items-start gap-3">
                <span className="font-mono font-semibold text-[#0F172A] shrink-0">{event.time}</span>
                <span className="text-[#475569] leading-relaxed">{event.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="text-xs mb-4">
            <label className="font-semibold text-[#475569] block mb-1.5">Hình thức xử lý đề xuất:</label>
            <select
              value={penalty}
              onChange={(event) => setPenalty(event.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-[8px] font-medium transition-colors ${
                isReadOnly ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' : 'bg-white text-[#0F172A] focus:outline-none focus:border-[#06B6D4]'
              }`}
            >
              {PENALTY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
              {isReadOnly && violation.report?.penalty && !PENALTY_OPTIONS.includes(violation.report.penalty) && (
                <option value={violation.report.penalty}>{violation.report.penalty}</option>
              )}
            </select>
          </div>

          <div className="text-xs mb-5">
            <label className="font-semibold text-[#475569] block mb-1.5">Mô tả chi tiết vi phạm:</label>
            <textarea
              rows={4}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              disabled={isReadOnly}
              placeholder="Ghi rõ bối cảnh, mức độ tái phạm và các nhắc nhở đã thực hiện tại phòng thi..."
              className={`w-full px-3.5 py-3 border border-[#E2E8F0] rounded-[12px] leading-relaxed transition-colors ${
                isReadOnly ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' : 'bg-white focus:outline-none focus:border-[#06B6D4]'
              }`}
            ></textarea>
          </div>

          {isReadOnly ? (
            <div className="flex items-start gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[12px] text-[11px] text-[#047857]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Biên bản đã được lập lúc {violation.report?.reportedAt ?? violation.lastTime}. Nội dung chỉ hiển thị để tra cứu.
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
              >
                Lưu biên bản vi phạm
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Rocket, ShieldCheck, Shuffle, FileStack, Info } from 'lucide-react';
import { EXAM_STATUS_LABELS } from '../../../data/teacher';

/**
 * Modal M.13 Xác nhận xuất bản đề thi (2.4).
 * Sau khi xuất bản, hệ thống sinh các mã đề xáo trộn và khóa cấu hình ma trận.
 */
export default function ExamPublishModal({ isOpen, onClose, onConfirm, exam }) {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-[520px] bg-white rounded-[24px] shadow-2xl p-6 md:p-8 border border-[#E2E8F0]">
        <button
          onClick={onClose}
          title="Đóng"
          className="absolute top-6 right-6 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0891B2] mb-4">
          <Rocket className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#0F172A] mb-2">Xuất bản đề thi?</h3>
        <p className="text-xs text-[#475569] leading-relaxed mb-5">
          Đề thi <span className="font-bold text-[#0F172A]">{exam.examCode}</span> - {exam.subjectName} sẽ được
          phát hành cho thí sinh theo khung giờ đã cấu hình. Vui lòng kiểm tra kỹ trước khi xác nhận.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5 text-[11px]">
          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px]">
            <span className="block text-[#94A3B8] mb-0.5">Trạng thái hiện tại</span>
            <span className="font-bold text-[#0F172A]">{EXAM_STATUS_LABELS[exam.status]}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px]">
            <span className="block text-[#94A3B8] mb-0.5">Số câu / Thời lượng</span>
            <span className="font-bold text-[#0F172A]">
              {exam.questionsCount} câu · {exam.durationMinutes} phút
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px]">
            <span className="block text-[#94A3B8] mb-0.5">Số lượt làm bài</span>
            <span className="font-bold text-[#0F172A]">
              {exam.maxAttempts === 1 ? '1 lượt duy nhất' : `Tối đa ${exam.maxAttempts} lượt`}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px]">
            <span className="block text-[#94A3B8] mb-0.5">Khung giờ mở đề</span>
            <span className="font-bold text-[#0F172A]">
              {exam.openTime} - {exam.closeTime}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6 text-[11px] text-[#475569]">
          <p className="flex items-start gap-2">
            <FileStack className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#06B6D4]" />
            Hệ thống sinh mã đề theo cấu hình xáo trộn hiện tại
            {exam.shuffleQuestions && ' (xáo trộn thứ tự câu hỏi)'}
            {exam.shuffleAnswers && ' (đảo vị trí đáp án A–B–C–D)'}.
          </p>
          <p className="flex items-start gap-2">
            <Shuffle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#06B6D4]" />
            Hình thức tạo ma trận: {exam.matrixMode === 'AUTO' ? 'Bốc ngẫu nhiên theo tỷ lệ độ khó' : 'Chọn câu thủ công từ kho'}.
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#06B6D4]" />
            Chống gian lận rời tab: {exam.antiCheat ? 'Đang bật (tối đa 3 lần vi phạm)' : 'Đang tắt'}.
          </p>
          <p className="flex items-start gap-2 text-[#D97706]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Sau khi xuất bản, cấu hình ma trận và đề thi không thể chỉnh sửa.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
          >
            Xuất bản đề thi
          </button>
        </div>
      </div>
    </div>
  );
}

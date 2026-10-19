import React from 'react';
import { ListChecks } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '../../../data/teacher';

const DIFFICULTY_BADGES = {
  EASY: 'bg-[#ECFDF5] text-[#059669]',
  MEDIUM: 'bg-[#FEF3C7] text-[#D97706]',
  HARD: 'bg-[#FEF2F2] text-[#EF4444]',
};

/**
 * Modal xem trước danh sách câu hỏi thực tế có trong một đề thi (FR-07.1).
 * Dữ liệu lấy từ Ngân hàng câu hỏi nên mã câu (questionCode) đồng bộ với
 * màn hình Ma trận đề thi (2.5) và Thống kê & Phân tích (2.6).
 * Tham chiếu thiết kế: design/screenshots/modal-figma/M.12_review-selected-questions.png
 */
export default function ExamQuestionsPreviewModal({ isOpen, exam, onClose }) {
  if (!exam) return null;

  const questions = exam.questions ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Câu hỏi trong đề ${exam.examCode}`}
      description={`${exam.subjectName} · ${questions.length}/${exam.questionsCount} câu · ${exam.durationMinutes} phút`}
      icon={ListChecks}
      tone="primary"
      size="xl"
      footer={
        <div className="flex justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
          >
            Đóng
          </button>
        </div>
      }
    >
      {questions.length === 0 ? (
        <p className="py-10 text-center text-xs text-[#94A3B8]">
          Đề thi chưa có câu hỏi nào được chọn từ ngân hàng.
        </p>
      ) : (
        <div className="border border-[#E2E8F0] rounded-[16px] overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50 uppercase text-[10px] tracking-wider">
                  <th className="py-3 pl-4 pr-2 w-12 text-center">STT</th>
                  <th className="py-3 pr-3">Mã câu hỏi</th>
                  <th className="py-3 pr-4">Nội dung câu hỏi</th>
                  <th className="py-3 pr-3">Loại câu hỏi</th>
                  <th className="py-3 pr-4">Độ khó</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {questions.map((question, index) => (
                  <tr key={`${question.questionCode}-${index}`} className="align-top hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-2 text-center text-[#64748B] font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#0F172A] whitespace-nowrap">
                      {question.questionCode}
                    </td>
                    <td className="py-3 pr-4 text-[#475569] leading-relaxed max-w-[420px]">
                      {question.content}
                    </td>
                    <td className="py-3 pr-3 text-[#475569] whitespace-nowrap">
                      {QUESTION_TYPE_LABELS[question.type] ?? question.type}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${DIFFICULTY_BADGES[question.difficulty]}`}>
                        {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

import React from 'react';
import { Pencil, CheckCircle2, Circle, KeyRound } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import {
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../../data/teacher';

const DIFFICULTY_BADGES = {
  EASY: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-600 border border-amber-200',
  HARD: 'bg-rose-50 text-rose-600 border border-rose-200',
};

/**
 * Modal M.07: Xem chi tiết câu hỏi & Lời giải chi tiết (Read-only Preview)
 * Theo thiết kế: design/screenshots/modal-figma/M.07_preview-question.png
 */
export default function QuestionPreviewModal({
  isOpen,
  onClose,
  question,
  onEdit,
}) {
  if (!question) return null;

  const isEssay = question.type === 'ESSAY';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết câu hỏi & Lời giải"
      size="xl"
      footer={
        <div className="flex justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shadow-sm"
          >
            Lưu thông tin
          </button>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Hàng nhãn phân loại */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
            {question.chapterName || question.chapterId || 'Chương 1'}
          </span>
          <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-200 rounded-md font-semibold text-[11px]">
            {QUESTION_TYPE_LABELS[question.type] || 'Trắc nghiệm'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
              DIFFICULTY_BADGES[question.difficulty] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {DIFFICULTY_LABELS[question.difficulty] || 'Trung bình'}
          </span>
        </div>

        {/* Nội dung câu hỏi */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Câu hỏi</h3>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(question);
                }}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#06B6D4] font-medium text-xs transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            )}
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {question.content}
          </p>
        </div>

        {/* Danh sách phương án trả lời */}
        {!isEssay ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {question.options?.map((opt) => {
              const isCorrect = question.correctAnswers?.includes(opt.key);
              return (
                <div
                  key={opt.key}
                  className={`flex items-center justify-between p-3.5 rounded-[12px] border transition-colors ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs leading-normal">
                      <strong className="mr-1">{opt.key}.</strong>
                      {opt.text}
                    </span>
                  </div>
                  {isCorrect && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shrink-0 ml-2">
                      ĐÚNG
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Cấu hình từ khóa chấm điểm tự luận ngắn */
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[12px] space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <KeyRound className="w-4 h-4 text-[#06B6D4]" />
              <span>Từ khóa chấm điểm tự luận ngắn:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(question.acceptedKeywords || question.correctAnswers || []).map(
                (keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs shadow-2xs"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Giải thích đáp án & Lời giải chi tiết */}
        <div className="p-4 border border-slate-200 rounded-[16px] bg-slate-50/40 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs">
            Giải thích đáp án &amp; Lời giải chi tiết
          </h4>
          <p className="text-slate-600 leading-relaxed text-xs">
            {question.explanation ||
              'Chưa có giải thích chi tiết cho câu hỏi này. Giảng viên có thể bổ sung trong giao diện chỉnh sửa câu hỏi.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import { RefreshCw, Pencil, BookmarkPlus, CheckCircle2, Sparkles, Trash2, Save, X } from 'lucide-react';
import BankCheckbox from './BankCheckbox';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '../../../data/teacher';

const DIFFICULTY_BADGES = {
  EASY: 'bg-[#ECFDF5] text-[#059669]',
  MEDIUM: 'bg-[#FEF3C7] text-[#D97706]',
  HARD: 'bg-[#FEF2F2] text-[#EF4444]',
};

/** Ngưỡng tin cậy: >= 90% xanh lá, >= 75% vàng, còn lại đỏ. */
const getConfidenceTone = (confidence) => {
  if (confidence >= 90) return 'bg-[#ECFDF5] text-[#059669]';
  if (confidence >= 75) return 'bg-[#FEF3C7] text-[#D97706]';
  return 'bg-[#FEF2F2] text-[#EF4444]';
};

/**
 * Thẻ xem trước một câu hỏi do AI sinh ra (2.3 - FR-06.3):
 * checkbox chọn câu · chỉnh sửa trực tiếp tại chỗ · sinh lại · xóa · lưu vào ngân hàng.
 */
export default function AIQuestionPreviewCard({
  question,
  isSaved,
  isSelected,
  onToggleSelect,
  onRegenerate,
  onChange,
  onDelete,
  onSave,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(question);

  const isEssay = question.type === 'ESSAY';
  const isMulti = question.type === 'MCQ_MULTIPLE';

  const startEditing = () => {
    setDraft(question);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(question);
    setIsEditing(false);
  };

  const commitEditing = () => {
    onChange?.(draft);
    setIsEditing(false);
  };

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const updateOptionText = (key, text) =>
    setDraft((current) => ({
      ...current,
      options: current.options.map((option) => (option.key === key ? { ...option, text } : option)),
    }));

  const toggleCorrectAnswer = (key) => {
    setDraft((current) => {
      const hasKey = current.correctAnswers.includes(key);
      if (isMulti) {
        return {
          ...current,
          correctAnswers: hasKey
            ? current.correctAnswers.filter((item) => item !== key)
            : [...current.correctAnswers, key],
        };
      }
      return { ...current, correctAnswers: [key] };
    });
  };

  return (
    <article className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <BankCheckbox
            checked={Boolean(isSelected)}
            onChange={() => onToggleSelect?.(question.id)}
            ariaLabel={`Chọn câu hỏi AI ${question.questionCode}`}
          />
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F1F5F9] text-[#475569] rounded text-[10px] font-semibold">
            {QUESTION_TYPE_LABELS[question.type]}
          </span>
          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${DIFFICULTY_BADGES[question.difficulty]}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${getConfidenceTone(question.confidence)}`}>
            <Sparkles className="w-3 h-3" />
            Độ tin cậy {question.confidence}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#94A3B8] font-medium">{question.chapterName}</span>
          <button
            type="button"
            title="Xóa câu hỏi này khỏi danh sách"
            onClick={() => onDelete?.(question.id)}
            className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {isEditing ? (
        <div className="space-y-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">Nội dung câu hỏi</label>
            <textarea
              rows={3}
              value={draft.content}
              onChange={(event) => updateDraft({ content: event.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">Độ khó</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateDraft({ difficulty: value })}
                  className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border transition-colors cursor-pointer ${
                    draft.difficulty === value
                      ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#0891B2]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isEssay ? (
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Từ khóa chấp nhận (phân tách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={draft.acceptedKeywords.join(', ')}
                onChange={(event) =>
                  updateDraft({
                    acceptedKeywords: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#475569]">
                Phương án trả lời {isMulti ? '(chọn nhiều đáp án đúng)' : '(chọn 1 đáp án đúng)'}
              </label>
              {draft.options.map((option) => {
                const isCorrect = draft.correctAnswers.includes(option.key);
                return (
                  <div key={option.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Đánh dấu đáp án đúng"
                      onClick={() => toggleCorrectAnswer(option.key)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                        isCorrect
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
                          : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#10B981]'
                      }`}
                    >
                      {option.key}
                    </button>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(event) => updateOptionText(option.key, event.target.value)}
                      className="flex-1 px-3 py-2 text-[11px] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">Lời giải chi tiết</label>
            <textarea
              rows={3}
              value={draft.explanation}
              onChange={(event) => updateDraft({ explanation: event.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-bold text-[#0F172A] leading-relaxed mb-3">{question.content}</p>

          {isEssay ? (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold text-[#475569]">Từ khóa chấp nhận:</span>
              {question.acceptedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-[#F0FDFA] border border-[#06B6D4]/40 text-[#0E7490] rounded text-[10px] font-semibold"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <ul className="space-y-2 mb-3">
              {question.options.map((option) => {
                const isCorrect = question.correctAnswers.includes(option.key);
                return (
                  <li
                    key={option.key}
                    className={`flex items-start gap-2 px-3 py-2 border rounded-[8px] text-[11px] ${
                      isCorrect
                        ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] font-semibold'
                        : 'border-[#E2E8F0] text-[#475569]'
                    }`}
                  >
                    <span className="font-bold shrink-0">{option.key}.</span>
                    <span className="flex-1">{option.text}</span>
                    {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px] text-[11px] text-[#475569] leading-relaxed mb-4">
            <span className="font-bold text-[#0F172A]">Giải thích: </span>
            {question.explanation}
          </div>
        </>
      )}

      <footer className="flex flex-wrap items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#475569] text-[11px] font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Hủy
            </button>
            <button
              type="button"
              onClick={commitEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-[11px] font-semibold rounded-[8px] transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu thay đổi
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onRegenerate(question.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#475569] text-[11px] font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sinh lại
            </button>

            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#BAE6FD] text-[#0891B2] text-[11px] font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => onSave(question.id)}
              disabled={isSaved}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-[8px] transition-colors ${
                isSaved
                  ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              {isSaved ? 'Đã lưu' : 'Lưu vào ngân hàng'}
            </button>
          </>
        )}
      </footer>
    </article>
  );
}

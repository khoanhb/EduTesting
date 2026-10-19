import React, { useState } from 'react';
import { Wand2, Loader2, Shuffle, CheckCircle2, Eye, RotateCcw } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { DIFFICULTY_LABELS } from '../../../data/teacher';

/** Số câu hỏi mỗi trang trong kết quả bốc câu (FR-07.2). */
const PAGE_SIZE = 10;

const RATIO_KEYS = ['EASY', 'MEDIUM', 'HARD'];
const RATIO_TONES = {
  EASY: 'bg-[#ECFDF5] text-[#059669]',
  MEDIUM: 'bg-[#FEF3C7] text-[#D97706]',
  HARD: 'bg-[#FEF2F2] text-[#EF4444]',
};

/**
 * Chế độ bốc câu tự động theo tỷ lệ % độ khó (2.5 - FR-07.3).
 * Tổng tỷ lệ phải bằng 100% trước khi bốc ngẫu nhiên.
 */
export default function ExamMatrixAutoBuilder({
  totalQuestions,
  ratio,
  generatedQuestions,
  isGenerating,
  onTotalChange,
  onRatioChange,
  onGenerate,
  onPreviewQuestion,
  onRegenerateQuestion,
}) {
  const ratioSum = RATIO_KEYS.reduce((sum, key) => sum + (Number(ratio[key]) || 0), 0);
  const isRatioValid = ratioSum === 100;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(generatedQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedGenerated = generatedQuestions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-2">Tổng số câu hỏi</label>
          <input
            type="number"
            min={1}
            value={totalQuestions}
            onChange={(event) => onTotalChange(Number(event.target.value) || 0)}
            className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
          />
        </div>

        {RATIO_KEYS.map((key) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-[#475569] mb-2">
              Tỷ lệ {DIFFICULTY_LABELS[key]} (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={ratio[key]}
              onChange={(event) => onRatioChange({ ...ratio, [key]: Number(event.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold ${isRatioValid ? 'text-[#059669]' : 'text-[#EF4444]'}`}>
          Tổng tỷ lệ độ khó: {ratioSum}%
          {!isRatioValid && ' - tổng tỷ lệ phải bằng 100% để bốc đề.'}
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!isRatioValid || isGenerating}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-[8px] transition-colors shadow-sm ${
            !isRatioValid || isGenerating
              ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
              : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang bốc câu hỏi...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              Bốc ngẫu nhiên theo ma trận
            </>
          )}
        </button>
      </div>

      <div className="border border-[#E2E8F0] rounded-[16px] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
            <Shuffle className="w-3.5 h-3.5 text-[#06B6D4]" />
            Kết quả bốc câu ({generatedQuestions.length})
          </h3>
          <span className="text-[10px] text-[#94A3B8] font-medium">
            Hệ thống chọn ngẫu nhiên trong kho theo tỷ lệ đã cấu hình
          </span>
        </div>

        {generatedQuestions.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-[#94A3B8]">
            Chưa bốc câu nào. Nhập tỷ lệ độ khó rồi bấm "Bốc ngẫu nhiên theo ma trận".
          </p>
        ) : (
          <ul className="divide-y divide-[#E2E8F0] max-h-80 overflow-y-auto">
            {pagedGenerated.map((question, index) => (
              <li key={`${question.id}-${index}`} className="py-2.5 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-[#0F172A] leading-snug">{question.content}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{question.code} · {question.chapterName}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${RATIO_TONES[question.difficulty]}`}>
                  {DIFFICULTY_LABELS[question.difficulty]}
                </span>
                <button
                  type="button"
                  onClick={() => onPreviewQuestion?.(question)}
                  title="Xem chi tiết câu hỏi"
                  className="p-1.5 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRegenerateQuestion?.(question.id)}
                  title="Sinh lại câu hỏi này"
                  className="p-1.5 text-[#475569] hover:text-[#0891B2] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {generatedQuestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              totalItems={generatedQuestions.length}
              onPageChange={setPage}
              itemLabel="câu hỏi"
            />
          </div>
        )}
      </div>
    </div>
  );
}

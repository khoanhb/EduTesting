import React, { useMemo, useState } from 'react';
import { Search, Plus, X, Eye } from 'lucide-react';
import CustomDropdown from '../../../components/common/CustomDropdown';
import Pagination from '../../../components/ui/Pagination';
import { mockQuestions, DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '../../../data/teacher';

/** Số câu hỏi mỗi trang trong kho chọn câu (FR-07.2). */
const PAGE_SIZE = 10;

/** Chế độ bốc câu thủ công: chọn từng câu từ kho (2.5 - FR-07.3). */
export default function ExamMatrixManualPicker({ chapters, selectedQuestions, onChange, onPreviewQuestion }) {
  const [keyword, setKeyword] = useState('');
  const [chapterId, setChapterId] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [page, setPage] = useState(1);

  const chapterOptions = [
    { value: 'ALL', label: 'Tất cả chương' },
    ...chapters.map((chapter) => ({ value: chapter.id, label: chapter.name })),
  ];
  const difficultyOptions = [
    { value: 'ALL', label: 'Tất cả độ khó' },
    ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const availableQuestions = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const selectedIds = selectedQuestions.map((question) => question.id);

    return mockQuestions.filter((question) => {
      if (selectedIds.includes(question.id)) return false;
      const matchKeyword =
        search === '' ||
        question.content.toLowerCase().includes(search) ||
        question.code.toLowerCase().includes(search);
      const matchChapter = chapterId === 'ALL' || question.chapterId === chapterId;
      const matchDifficulty = difficulty === 'ALL' || question.difficulty === difficulty;
      return matchKeyword && matchChapter && matchDifficulty;
    });
  }, [keyword, chapterId, difficulty, selectedQuestions]);

  const totalPages = Math.max(1, Math.ceil(availableQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAvailable = availableQuestions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Kho câu hỏi */}
      <div className="border border-[#E2E8F0] rounded-[16px] p-4">
        <h3 className="text-xs font-bold text-[#0F172A] mb-3">
          Kho câu hỏi ({availableQuestions.length})
        </h3>

        <div className="space-y-2 mb-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm nội dung hoặc mã câu"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CustomDropdown
              options={chapterOptions}
              value={chapterId}
              onChange={(value) => {
                setChapterId(value);
                setPage(1);
              }}
              className="w-full"
            />
            <CustomDropdown
              options={difficultyOptions}
              value={difficulty}
              onChange={(value) => {
                setDifficulty(value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>

        <ul className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
          {availableQuestions.length === 0 && (
            <li className="py-6 text-center text-[11px] text-[#94A3B8]">Không còn câu hỏi phù hợp.</li>
          )}
          {pagedAvailable.map((question) => (
            <li key={question.id} className="py-2.5 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#0F172A] leading-snug">{question.content}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">
                  {question.code} · {QUESTION_TYPE_LABELS[question.type]} · {DIFFICULTY_LABELS[question.difficulty]}
                </p>
              </div>
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
                onClick={() => onChange([...selectedQuestions, question])}
                title="Thêm vào đề"
                className="p-1.5 text-[#0891B2] hover:bg-[#E0F2FE] rounded-[8px] transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        {availableQuestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              totalItems={availableQuestions.length}
              onPageChange={setPage}
              itemLabel="câu hỏi"
            />
          </div>
        )}
      </div>

      {/* Câu hỏi đã chọn */}
      <div className="border border-[#06B6D4]/40 bg-[#F0FDFA]/40 rounded-[16px] p-4">
        <h3 className="text-xs font-bold text-[#0F172A] mb-3 flex items-center gap-1.5">
          Câu hỏi trong đề ({selectedQuestions.length})
        </h3>

        <ul className="max-h-80 overflow-y-auto divide-y divide-[#BAE6FD]">
          {selectedQuestions.length === 0 && (
            <li className="py-8 text-center text-[11px] text-[#0891B2]">
              Chưa chọn câu hỏi nào. Bấm dấu + ở cột bên trái để thêm câu vào đề.
            </li>
          )}
          {selectedQuestions.map((question, index) => (
            <li key={question.id} className="py-2.5 flex items-start gap-2">
              <span className="text-[11px] font-bold text-[#0891B2] shrink-0 w-5">{index + 1}.</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#0F172A] leading-snug">{question.content}</p>
                <p className="text-[10px] text-[#0891B2] mt-0.5">
                  {question.code} · {DIFFICULTY_LABELS[question.difficulty]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(selectedQuestions.filter((item) => item.id !== question.id))}
                title="Bỏ khỏi đề"
                className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

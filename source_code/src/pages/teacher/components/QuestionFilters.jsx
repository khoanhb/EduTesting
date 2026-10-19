import React from 'react';
import { Search, Filter } from 'lucide-react';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '../../../data/teacher';

/**
 * Bộ lọc đa cấp cho ngân hàng câu hỏi (2.1):
 * Môn học -> Chương kiến thức -> Loại câu hỏi -> Độ khó + tìm kiếm nội dung.
 */
export default function QuestionFilters({ filters, onChange, subjects, chapters }) {
  const subjectOptions = [
    { value: 'ALL', label: 'Tất cả môn học' },
    ...subjects.map((subject) => ({ value: subject.code, label: `${subject.code} - ${subject.name}` })),
  ];

  const chapterOptions = [
    { value: 'ALL', label: 'Tất cả chương' },
    ...chapters.map((chapter) => ({ value: chapter.id, label: chapter.name })),
  ];

  const typeOptions = [
    { value: 'ALL', label: 'Tất cả loại câu hỏi' },
    ...Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const difficultyOptions = [
    { value: 'ALL', label: 'Tất cả độ khó' },
    ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-[#06B6D4]" />
        <h2 className="text-sm font-bold text-[#0F172A]">Bộ lọc ngân hàng câu hỏi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="relative xl:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung câu hỏi hoặc mã câu"
            value={filters.keyword}
            onChange={(event) => update('keyword', event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors"
          />
        </div>

        <CustomDropdown
          options={subjectOptions}
          value={filters.subjectCode}
          onChange={(value) => onChange({ ...filters, subjectCode: value, chapterId: 'ALL' })}
          className="w-full"
        />
        <CustomDropdown
          options={chapterOptions}
          value={filters.chapterId}
          onChange={(value) => update('chapterId', value)}
          className="w-full"
        />
        <CustomDropdown
          options={typeOptions}
          value={filters.type}
          onChange={(value) => update('type', value)}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <CustomDropdown
          options={difficultyOptions}
          value={filters.difficulty}
          onChange={(value) => update('difficulty', value)}
          className="w-full md:w-60"
        />

        <button
          type="button"
          onClick={() => onChange({ keyword: '', subjectCode: 'ALL', chapterId: 'ALL', type: 'ALL', difficulty: 'ALL' })}
          className="text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
        >
          Xóa toàn bộ bộ lọc
        </button>
      </div>
    </div>
  );
}

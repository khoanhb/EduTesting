import React from 'react';
import { Layers, Tag, FolderTree, FilePlus2, Trash2, CheckSquare } from 'lucide-react';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { DIFFICULTY_LABELS } from '../../../data/teacher';

/**
 * Thanh thao tác hàng loạt trên ngân hàng câu hỏi (2.1):
 * Đổi độ khó · Đổi chương · Đưa vào đề thi · Xóa đã chọn (M.05).
 */
export default function QuestionBulkToolbar({
  selectedCount,
  chapters,
  difficulty,
  chapterId,
  onChangeDifficulty,
  onChangeChapter,
  onAddToExam,
  onDelete,
}) {
  const hasSelection = selectedCount > 0;

  const difficultyOptions = [
    { value: '', label: 'Đổi độ khó...' },
    ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const chapterOptions = [
    { value: '', label: 'Chuyển sang chương...' },
    ...chapters.map((chapter) => ({ value: chapter.id, label: chapter.name })),
  ];

  if (!hasSelection) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[16px] text-[11px] text-[#0369A1] font-medium">
        <CheckSquare className="w-4 h-4 shrink-0" />
        Chọn ít nhất một câu hỏi trong bảng để sử dụng các thao tác hàng loạt.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[16px]">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0369A1]">
        <Layers className="w-4 h-4" />
        Đã chọn {selectedCount} câu hỏi
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <span className="inline-flex items-center gap-1 text-[11px] text-[#475569] font-medium">
          <Tag className="w-3.5 h-3.5" />
        </span>
        <CustomDropdown
          options={difficultyOptions}
          value={difficulty}
          onChange={onChangeDifficulty}
          className="w-44"
        />

        <span className="inline-flex items-center gap-1 text-[11px] text-[#475569] font-medium">
          <FolderTree className="w-3.5 h-3.5" />
        </span>
        <CustomDropdown
          options={chapterOptions}
          value={chapterId}
          onChange={onChangeChapter}
          className="w-56"
        />

        <button
          type="button"
          onClick={onAddToExam}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#BAE6FD] text-[#0891B2] text-[11px] font-semibold rounded-[8px] hover:bg-[#E0F2FE] transition-colors cursor-pointer"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          Đưa vào đề thi
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EF4444] hover:bg-red-600 text-white text-[11px] font-semibold rounded-[8px] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa đã chọn
        </button>
      </div>
    </div>
  );
}

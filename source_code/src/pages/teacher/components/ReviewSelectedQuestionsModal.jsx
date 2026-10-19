import React, { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import {
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../../data/teacher';
import cn from '../../../utils/cn';

const DIFFICULTY_BADGES = {
  EASY: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  HARD: 'bg-rose-50 text-rose-600 border border-rose-200',
};

/**
 * Modal M.12: Đánh giá tiến độ & xem trước các câu hỏi đã chọn vào đề
 * Theo thiết kế: design/screenshots/modal-figma/M.12_review-selected-questions.png
 */
export default function ReviewSelectedQuestionsModal({
  isOpen,
  onClose,
  selectedQuestions = [],
  totalTarget = 40,
  onRemoveQuestion,
  onPreviewQuestion,
}) {
  const [selectedInModal, setSelectedInModal] = useState([]);

  const currentCount = selectedQuestions.length;
  const remainingCount = Math.max(0, totalTarget - currentCount);
  const progressPercent = Math.min(100, Math.round((currentCount / totalTarget) * 100));

  // Thống kê phân bổ độ khó
  const easyCount = selectedQuestions.filter((q) => q.difficulty === 'EASY').length;
  const mediumCount = selectedQuestions.filter((q) => q.difficulty === 'MEDIUM').length;
  const hardCount = selectedQuestions.filter((q) => q.difficulty === 'HARD').length;

  const easyPercent = currentCount > 0 ? Math.round((easyCount / currentCount) * 100) : 0;
  const mediumPercent = currentCount > 0 ? Math.round((mediumCount / currentCount) * 100) : 0;
  const hardPercent = currentCount > 0 ? Math.round((hardCount / currentCount) * 100) : 0;

  const isAllSelected =
    selectedQuestions.length > 0 && selectedInModal.length === selectedQuestions.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedInModal([]);
    } else {
      setSelectedInModal(selectedQuestions.map((q) => q.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedInModal((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedInModal.length === 0) return;
    selectedInModal.forEach((id) => onRemoveQuestion(id));
    setSelectedInModal([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="2xl"
      footer={
        <div className="flex justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-10 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Khung Tiến độ chọn câu hỏi */}
        <div className="p-5 border border-slate-200 rounded-[20px] bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Tiến độ chọn câu hỏi</h3>

          {/* Thanh progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#06B6D4] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#06B6D4]">
              {currentCount} / {totalTarget} câu đã chọn
            </span>
            <span className="text-slate-500 font-normal">
              {remainingCount > 0 ? `Còn thiếu ${remainingCount} câu` : 'Đã đủ số lượng câu hỏi'}
            </span>
          </div>

          {/* Khung Phân bổ độ khó hiện tại */}
          <div className="p-4 bg-slate-50/80 rounded-[14px] border border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              PHÂN BỔ ĐỘ KHÓ HIỆN TẠI
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-20 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 text-center">
                  Dễ
                </span>
                <span className="font-bold text-slate-800">
                  {easyCount} câu ({easyPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 text-center">
                  Trung bình
                </span>
                <span className="font-bold text-slate-800">
                  {mediumCount} câu ({mediumPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 text-center">
                  Khó
                </span>
                <span className="font-bold text-slate-800">
                  {hardCount} câu ({hardPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Khung Danh sách câu hỏi đã chọn */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Danh sách đã chọn ({currentCount})
            </h4>

            {selectedInModal.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[8px] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Xóa đã chọn ({selectedInModal.length})
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-[16px] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[#94A3B8] font-semibold border-b border-slate-200 bg-slate-50/60 uppercase text-[10px] tracking-wider">
                  <th className="py-3 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#06B6D4] rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 pr-2 w-10 text-center">STT</th>
                  <th className="py-3 pr-4">NỘI DUNG CÂU HỎI</th>
                  <th className="py-3 pr-3">CHƯƠNG</th>
                  <th className="py-3 pr-3">LOẠI CÂU HỎI</th>
                  <th className="py-3 pr-3">ĐỘ KHÓ</th>
                  <th className="py-3 pr-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Chưa chọn câu hỏi nào vào đề thi.
                    </td>
                  </tr>
                ) : (
                  selectedQuestions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50/60 transition-colors align-middle">
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedInModal.includes(q.id)}
                          onChange={() => toggleSelectOne(q.id)}
                          className="w-4 h-4 accent-[#06B6D4] rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 pr-2 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-900 max-w-[260px] leading-relaxed">
                        {q.content}
                      </td>
                      <td className="py-3 pr-3 text-slate-600 whitespace-nowrap">
                        {q.chapterName || q.chapterId}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap text-slate-600">
                        {QUESTION_TYPE_LABELS[q.type] || q.type}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded text-[10px] font-bold',
                            DIFFICULTY_BADGES[q.difficulty]
                          )}
                        >
                          {DIFFICULTY_LABELS[q.difficulty] || q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Xem chi tiết"
                            onClick={() => onPreviewQuestion(q)}
                            className="p-1.5 text-slate-500 hover:text-[#06B6D4] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Xóa khỏi đề"
                            onClick={() => onRemoveQuestion(q.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

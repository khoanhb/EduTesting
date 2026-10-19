import React, { useState } from 'react';
import { FilePlus2, Layers } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Dropdown from '../../../components/ui/Dropdown';
import { EXAM_STATUS_LABELS } from '../../../data/teacher';

/**
 * Modal M.11: Đưa các câu hỏi đã chọn vào một đề thi (FR-05.5).
 * Tham chiếu: design/screenshots/modal-figma/M.11_include-in-exam.png
 *
 * Chỉ cho phép thêm vào các đề thi còn soạn được (Bản nháp / Sắp diễn ra).
 */
const EDITABLE_STATUSES = ['DRAFT', 'UPCOMING'];

export default function QuestionIncludeExamModal(props) {
  return props.isOpen ? <QuestionIncludeExamForm {...props} /> : null;
}

function QuestionIncludeExamForm({
  isOpen,
  onClose,
  selectedCount = 0,
  exams = [],
  onConfirm,
}) {
  const options = exams
    .filter((exam) => EDITABLE_STATUSES.includes(exam.status))
    .map((exam) => ({
      value: exam.id,
      label: `${exam.examCode} - ${exam.subjectName}`,
      description: EXAM_STATUS_LABELS[exam.status],
    }));

  const [examId, setExamId] = useState(options[0]?.value ?? '');

  const selectedExamId = options.some((option) => option.value === examId) ? examId : (options[0]?.value ?? '');
  const targetExam = exams.find((exam) => exam.id === selectedExamId) ?? null;
  const canConfirm = Boolean(targetExam) && selectedCount > 0;

  const handleConfirm = () => {
    if (!canConfirm || !onConfirm) return;
    onConfirm(targetExam);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đưa câu hỏi vào đề thi"
      icon={FilePlus2}
      tone="primary"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-borderLine bg-white text-textSub text-xs font-semibold rounded-btn hover:bg-canvas transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-btn transition-colors shadow-sm ${
              canConfirm
                ? 'bg-primary hover:bg-primary-hover text-white cursor-pointer'
                : 'bg-disabled text-textMuted cursor-not-allowed'
            }`}
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            Thêm vào đề thi
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center gap-2 p-3.5 bg-primary-light/60 border border-primary-ring rounded-widget text-primary">
          <Layers className="w-4 h-4 shrink-0" />
          <span className="font-semibold">
            Đã chọn {selectedCount} câu hỏi
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMain mb-1.5">
            Chọn đề thi nhận câu hỏi
          </label>
          <Dropdown
            options={options}
            value={selectedExamId}
            onChange={setExamId}
            placeholder="-- Chọn đề thi --"
            emptyMessage="Không có đề thi nào đang ở trạng thái Bản nháp / Sắp diễn ra."
            size="md"
          />
        </div>

        {targetExam && (
          <div className="p-3.5 bg-canvas border border-borderLine rounded-widget text-textSub leading-relaxed">
            <p className="font-semibold text-textMain">{targetExam.subjectName}</p>
            <p className="mt-0.5">
              {targetExam.category} · {targetExam.semester} · {targetExam.questionsCount} câu hiện tại
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

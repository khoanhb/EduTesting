import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Pencil, Trash2, Database, Layers3, Eye } from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/ui/Pagination';
import BankCheckbox from './components/BankCheckbox';
import QuestionFilters from './components/QuestionFilters';
import QuestionBulkToolbar from './components/QuestionBulkToolbar';
import QuestionPreviewModal from './components/QuestionPreviewModal';
import QuestionIncludeExamModal from './components/QuestionIncludeExamModal';
import {
  mockQuestions,
  mockSubjects,
  mockExams,
  mockTeacherUser,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../data/teacher';

const EMPTY_FILTERS = {
  keyword: '',
  subjectCode: 'ALL',
  chapterId: 'ALL',
  type: 'ALL',
  difficulty: 'ALL',
};

/** Số câu hỏi hiển thị trên mỗi trang (FR-05.8). */
const PAGE_SIZE = 10;

const DIFFICULTY_BADGES = {
  EASY: 'bg-[#ECFDF5] text-[#059669]',
  MEDIUM: 'bg-[#FEF3C7] text-[#D97706]',
  HARD: 'bg-[#FEF2F2] text-[#EF4444]',
};

export default function QuestionBankPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(mockQuestions);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDifficulty, setBulkDifficulty] = useState('');
  const [bulkChapterId, setBulkChapterId] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [isIncludeOpen, setIsIncludeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Danh sách chương tương ứng môn đang chọn (dùng cho cả bộ lọc và thao tác hàng loạt)
  const chapters = useMemo(() => {
    if (filters.subjectCode === 'ALL') {
      return mockSubjects.flatMap((subject) => subject.chapters);
    }
    return mockSubjects.find((subject) => subject.code === filters.subjectCode)?.chapters ?? [];
  }, [filters.subjectCode]);

  const filteredQuestions = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return questions.filter((question) => {
      const matchKeyword =
        keyword === '' ||
        question.content.toLowerCase().includes(keyword) ||
        question.questionCode.toLowerCase().includes(keyword);
      const matchSubject = filters.subjectCode === 'ALL' || question.subjectCode === filters.subjectCode;
      const matchChapter = filters.chapterId === 'ALL' || question.chapterId === filters.chapterId;
      const matchType = filters.type === 'ALL' || question.type === filters.type;
      const matchDifficulty = filters.difficulty === 'ALL' || question.difficulty === filters.difficulty;

      return matchKeyword && matchSubject && matchChapter && matchType && matchDifficulty;
    });
  }, [questions, filters]);

  // Phân trang (FR-05.8)
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(
    () => filteredQuestions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredQuestions, safePage]
  );

  const isAllSelected = filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredQuestions.map((question) => question.id));
  };

  const toggleSelectOne = (questionId) => {
    setSelectedIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setBulkDifficulty('');
    setBulkChapterId('');
  };

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const handleBulkDifficulty = (difficulty) => {
    if (!difficulty) return;
    setBulkDifficulty('');
    setQuestions((current) =>
      current.map((question) =>
        selectedIds.includes(question.id) ? { ...question, difficulty } : question
      )
    );
    showToast(`Đã đổi độ khó ${selectedIds.length} câu hỏi sang "${DIFFICULTY_LABELS[difficulty]}".`);
  };

  /**
   * Ràng buộc nghiệp vụ "Chuyển sang chương":
   * bắt buộc đã chọn Môn học và chương đích phải thuộc đúng môn học hiện tại.
   */
  const handleBulkChapter = (chapterId) => {
    if (!chapterId) return;

    if (filters.subjectCode === 'ALL') {
      showToast(
        'Vui lòng chọn Môn học trước khi chuyển câu hỏi sang chương khác để tránh sai lệch dữ liệu.',
        'warning'
      );
      setBulkChapterId('');
      return;
    }

    const currentSubject = mockSubjects.find((subject) => subject.code === filters.subjectCode);
    const targetChapter = currentSubject?.chapters.find((chapter) => chapter.id === chapterId);

    if (!targetChapter) {
      showToast(
        `Chương được chọn không thuộc môn học "${currentSubject?.name ?? filters.subjectCode}". Vui lòng chọn chương phù hợp với môn học hiện tại.`,
        'warning'
      );
      setBulkChapterId('');
      return;
    }

    const mismatchedCount = questions.filter(
      (question) =>
        selectedIds.includes(question.id) && question.subjectCode !== filters.subjectCode
    ).length;

    if (mismatchedCount > 0) {
      showToast(
        `Có ${mismatchedCount} câu hỏi đã chọn không thuộc môn "${currentSubject?.name}". Vui lòng bỏ chọn các câu này trước khi chuyển chương.`,
        'warning'
      );
      setBulkChapterId('');
      return;
    }

    setBulkChapterId('');
    setQuestions((current) =>
      current.map((question) =>
        selectedIds.includes(question.id)
          ? { ...question, chapterId, chapterName: targetChapter.name }
          : question
      )
    );
    showToast(`Đã chuyển ${selectedIds.length} câu hỏi sang "${targetChapter.name}".`);
  };

  const handleDeleteSelected = () => {
    setQuestions((current) => current.filter((question) => !selectedIds.includes(question.id)));
    showToast(`Đã xóa ${selectedIds.length} câu hỏi khỏi ngân hàng.`);
    clearSelection();
  };

  const handleAddToExam = () => {
    if (selectedIds.length === 0) return;
    setIsIncludeOpen(true);
  };

  const handleConfirmIncludeExam = (exam) => {
    showToast(`Đã thêm ${selectedIds.length} câu hỏi vào đề thi ${exam.examCode}.`);
    setIsIncludeOpen(false);
    clearSelection();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Ngân hàng câu hỏi" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Ngân hàng câu hỏi</h1>
              <p className="text-xs text-[#475569] mt-1">
                Quản lý {questions.length} câu hỏi theo môn học, chương kiến thức và độ khó.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/questions/ai')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#BAE6FD] text-[#0891B2] text-xs font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sinh câu hỏi bằng AI
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/questions/add')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tạo câu hỏi thủ công
              </button>
            </div>
          </div>

          <QuestionFilters
            filters={filters}
            onChange={handleFilterChange}
            subjects={mockSubjects}
            chapters={chapters}
          />

          <QuestionBulkToolbar
            selectedCount={selectedIds.length}
            chapters={chapters}
            difficulty={bulkDifficulty}
            chapterId={bulkChapterId}
            onChangeDifficulty={handleBulkDifficulty}
            onChangeChapter={handleBulkChapter}
            onAddToExam={handleAddToExam}
            onDelete={() => setIsDeleteOpen(true)}
          />

          <section className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Danh sách câu hỏi
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                <Layers3 className="w-3.5 h-3.5" />
                Hiển thị {filteredQuestions.length} / {questions.length} câu
              </span>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-[#94A3B8]">Không tìm thấy câu hỏi nào khớp bộ lọc hiện tại.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[1120px]">
                  <thead>
                    <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50/60">
                      <th className="py-3 pl-6 pr-3 w-10">
                        <BankCheckbox
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          ariaLabel="Chọn tất cả câu hỏi"
                        />
                      </th>
                      <th className="py-3 pr-3 w-12 text-center">STT</th>
                      <th className="py-3 pr-3">Mã câu hỏi</th>
                      <th className="py-3 pr-4">Nội dung câu hỏi</th>
                      <th className="py-3 pr-3">Chương</th>
                      <th className="py-3 pr-3">Môn học</th>
                      <th className="py-3 pr-3">Loại câu hỏi</th>
                      <th className="py-3 pr-3">Độ khó</th>
                      <th className="py-3 pr-3 text-center">Đã dùng</th>
                      <th className="py-3 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedQuestions.map((question, index) => {
                      const stt = (safePage - 1) * PAGE_SIZE + index + 1;

                      return (
                        <tr key={question.id} className="hover:bg-slate-50/70 transition-colors align-top">
                          <td className="py-3.5 pl-6 pr-3">
                            <BankCheckbox
                              checked={selectedIds.includes(question.id)}
                              onChange={() => toggleSelectOne(question.id)}
                              ariaLabel={`Chọn câu hỏi ${question.questionCode}`}
                            />
                          </td>

                          <td className="py-3.5 pr-3 text-center text-[#64748B] font-medium">
                            {stt}
                          </td>

                          <td className="py-3.5 pr-3 font-bold text-[#0F172A] whitespace-nowrap">
                            {question.questionCode}
                          </td>

                          <td className="py-3.5 pr-4 text-[#475569] leading-relaxed max-w-[360px]">
                            {question.content}
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569] max-w-[220px]">
                            {question.chapterName}
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569] max-w-[200px]">
                            {question.subjectName}
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569] max-w-[200px]">
                              {QUESTION_TYPE_LABELS[question.type]}
                          </td>

                          <td className="py-3.5 pr-3">
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${DIFFICULTY_BADGES[question.difficulty]}`}>
                              {DIFFICULTY_LABELS[question.difficulty]}
                            </span>
                          </td>

                          <td className="py-3.5 pr-3 text-center text-[#475569] font-semibold">
                            {question.usageCount}
                          </td>

                          <td className="py-3.5 pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                title="Xem nhanh câu hỏi"
                                onClick={() => setPreviewQuestion(question)}
                                className="p-2 text-[#475569] hover:text-[#0891B2] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Chỉnh sửa câu hỏi"
                                onClick={() => navigate(`/teacher/questions/add?edit=${question.id}`)}
                                className="p-2 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Xóa câu hỏi"
                                onClick={() => {
                                  setSelectedIds([question.id]);
                                  setIsDeleteOpen(true);
                                }}
                                className="p-2 text-[#475569] hover:text-[#EF4444] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredQuestions.length > 0 && (
              <div className="px-6 py-4 border-t border-[#E2E8F0]">
                <Pagination
                  page={safePage}
                  pageSize={PAGE_SIZE}
                  totalItems={filteredQuestions.length}
                  onPageChange={setCurrentPage}
                  itemLabel="câu hỏi"
                />
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modal M.07 Xem chi tiết câu hỏi (read-only preview) */}
      <QuestionPreviewModal
        isOpen={Boolean(previewQuestion)}
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        onEdit={(question) => navigate(`/teacher/questions/add?edit=${question.id}`)}
      />

      {/* Modal M.11 Đưa câu hỏi đã chọn vào đề thi */}
      <QuestionIncludeExamModal
        isOpen={isIncludeOpen}
        selectedCount={selectedIds.length}
        exams={mockExams}
        onClose={() => setIsIncludeOpen(false)}
        onConfirm={handleConfirmIncludeExam}
      />

      {/* Modal M.05 Xác nhận xóa câu hỏi đã chọn */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Xóa câu hỏi đã chọn?"
        description={`Bạn đang chuẩn bị xóa ${selectedIds.length} câu hỏi khỏi ngân hàng. Dữ liệu này không thể khôi phục và các đề thi đang tham chiếu sẽ bị ảnh hưởng.`}
      />
    </div>
  );
}

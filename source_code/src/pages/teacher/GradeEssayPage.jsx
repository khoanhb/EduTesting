import React, { useMemo, useState } from 'react';
import {
  PenLine,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Save,
  ChevronRight,
  Sparkles,
  KeyRound,
  Info,
  RefreshCw,
  CaseSensitive,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import Pagination from '../../components/ui/Pagination';
import {
  ESSAY_CASE_RULE_LABELS,
  ESSAY_SCORING_RULE_LABELS,
  ESSAY_PAGE_SIZE,
  MATCH_RESULT_LABELS,
  QUICK_GRADE_OPTIONS,
  matchEssayAnswer,
  mockEssaySubmissions,
  mockExams,
  mockTeacherUser,
} from '../../data/teacher';

const GRADE_TONES = {
  success: 'border-[#10B981] bg-[#ECFDF5] text-[#047857]',
  warning: 'border-[#F59E0B] bg-[#FEF3C7] text-[#B45309]',
  danger: 'border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C]',
};

/** Màu nhãn kết quả đối soát từ khóa (FR-08.2). */
const MATCH_RESULT_TONES = {
  MATCHED_ALL: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  MATCHED_PARTIAL: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  NOT_MATCHED: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]',
};

/**
 * Những đề thi có bài tự luận cần chấm VÀ thuộc môn học giảng viên được phân
 * công (ràng buộc phân quyền FR-08.1).
 */
const EXAM_OPTIONS = [
  ...new Set(
    mockEssaySubmissions
      .filter((submission) => mockTeacherUser.managedSubjects.includes(submission.subjectCode))
      .map((submission) => submission.examId)
  ),
].map((examId) => {
  const exam = mockExams.find((item) => item.id === examId);
  return { value: examId, label: `${exam.examCode} - ${exam.subjectName}` };
});

/** Bài tự luận trong phạm vi phân công của giảng viên đang đăng nhập. */
const SCOPED_SUBMISSIONS = mockEssaySubmissions.filter((submission) =>
  mockTeacherUser.managedSubjects.includes(submission.subjectCode)
);

export default function GradeEssayPage() {
  const [examId, setExamId] = useState(EXAM_OPTIONS[0]?.value ?? '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [questionFilter, setQuestionFilter] = useState('ALL');
  const [submissions, setSubmissions] = useState(SCOPED_SUBMISSIONS);
  const [selectedId, setSelectedId] = useState(
    SCOPED_SUBMISSIONS.find((submission) => submission.status === 'PENDING')?.id ?? null
  );
  const [draftScore, setDraftScore] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const examSubmissions = useMemo(
    () => submissions.filter((submission) => submission.examId === examId),
    [submissions, examId]
  );

  const questionOptions = useMemo(() => {
    const unique = new Map();
    examSubmissions.forEach((submission) => {
      if (!unique.has(submission.questionCode)) unique.set(submission.questionCode, submission.questionContent);
    });
    return [
      { value: 'ALL', label: 'Tất cả câu hỏi' },
      ...Array.from(unique.entries()).map(([value, label]) => ({ value, label: `${value} - ${label}` })),
    ];
  }, [examSubmissions]);

  const countByStatus = (status) =>
    examSubmissions.filter((submission) => submission.status === status).length;

  const pendingCount = countByStatus('PENDING');
  const autoGradedCount = countByStatus('AUTO_GRADED');
  const gradedCount = countByStatus('GRADED');

  /** Pills lọc theo trạng thái chấm (FR-08.2) - khớp đúng status của từng bài. */
  const STATUS_PILLS = [
    { value: 'ALL', label: `Tất cả (${examSubmissions.length})` },
    { value: 'PENDING', label: `Chờ chấm tay (${pendingCount})` },
    { value: 'AUTO_GRADED', label: `Đã chấm tự động (${autoGradedCount})` },
    { value: 'GRADED', label: `Đã chấm (${gradedCount})` },
  ];

  const filteredSubmissions = useMemo(
    () =>
      examSubmissions.filter((submission) => {
        const matchStatus = statusFilter === 'ALL' || submission.status === statusFilter;
        const matchQuestion = questionFilter === 'ALL' || submission.questionCode === questionFilter;
        return matchStatus && matchQuestion;
      }),
    [examSubmissions, statusFilter, questionFilter]
  );

  /** Phân trang danh sách bài tự luận: 10 bài mỗi trang (FR-08). */
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ESSAY_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSubmissions = filteredSubmissions.slice(
    (safePage - 1) * ESSAY_PAGE_SIZE,
    safePage * ESSAY_PAGE_SIZE
  );

  const selected =
    filteredSubmissions.find((submission) => submission.id === selectedId) ?? filteredSubmissions[0] ?? null;

  /** Nạp điểm / nhận xét đã có của một bài vào khung chấm bên phải. */
  const loadDraftFrom = (submission) => {
    if (!submission) {
      setDraftScore('');
      setTeacherNote('');
      return;
    }
    setDraftScore(
      submission.gradedScore === null || submission.gradedScore === undefined
        ? ''
        : String(submission.gradedScore)
    );
    setTeacherNote(submission.teacherComment ?? '');
    setOverrideScore('');
  };

  /** Chọn mức điểm nhanh (Đúng 100% / Đúng 1 phần 50% / Sai 0đ) - chưa ghi vào dữ liệu. */
  const handleQuickGrade = (option) => {
    if (!selected) return;
    setDraftScore(String(Number((selected.maxScore * option.ratio).toFixed(2))));
  };

  /** Ghi đè điểm thủ công ngoài 3 mức chấm nhanh. */
  const handleOverrideGrade = () => {
    if (!selected || overrideScore === '') return;

    const gradedScore = Math.min(Number(overrideScore), selected.maxScore);
    setDraftScore(String(gradedScore));
    showToast(`Đã chọn ${gradedScore}/${selected.maxScore} điểm. Bấm "Lưu điểm câu này" để hoàn tất.`);
  };

  /**
   * Đối soát lại câu trả lời bằng chính bộ từ khóa hiện tại của câu hỏi
   * (PUT /exams/{id}/essays/{id}/recheck). Dùng khi giảng viên vừa sửa từ khóa
   * hoặc đổi tùy chọn chấm và muốn hệ thống tính lại gợi ý.
   */
  const handleRecheckMatch = () => {
    if (!selected) return;

    const match = matchEssayAnswer(selected.studentAnswer, selected);

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === selected.id
          ? {
              ...submission,
              matchResult: match.matchResult,
              matchedKeywords: match.matchedKeywords,
              aiSuggestedScore: match.aiSuggestedScore,
              aiLabel: match.aiLabel,
            }
          : submission
      )
    );

    showToast(`Đã đối soát lại: ${MATCH_RESULT_LABELS[match.matchResult]}.`);
  };

  /** Lưu điểm + nhận xét của câu đang chấm (FR-08.3). */
  const handleSaveGrade = () => {
    if (!selected || draftScore === '') {
      showToast('Vui lòng chọn mức điểm hoặc nhập điểm trước khi lưu.');
      return;
    }

    const gradedScore = Math.min(Number(draftScore), selected.maxScore);
    const comment = teacherNote.trim() === '' ? null : teacherNote.trim();

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === selected.id
          ? { ...submission, gradedScore, teacherComment: comment, status: 'GRADED' }
          : submission
      )
    );
    showToast(`Đã lưu ${gradedScore}/${selected.maxScore} điểm cho câu ${selected.questionCode}.`);
  };

  const handleNext = () => {
    const currentIndex = examSubmissions.findIndex((submission) => submission.id === selected?.id);
    const nextPending = examSubmissions
      .slice(currentIndex + 1)
      .concat(examSubmissions.slice(0, currentIndex + 1))
      .find((submission) => submission.status === 'PENDING');

    if (!nextPending) {
      showToast('Đã chấm xong toàn bộ câu tự luận của đề thi này.');
      return;
    }
    setSelectedId(nextPending.id);
    loadDraftFrom(nextPending);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Chấm bài tự luận" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Chấm điểm tự luận ngắn</h1>
              <p className="text-xs text-[#475569] mt-1">
                Đối soát các câu trả lời chưa khớp đủ từ khóa của môn bạn phụ trách. Còn {pendingCount} câu
                chờ chấm tay, {autoGradedCount} câu hệ thống đã chấm tự động.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CustomDropdown
                options={EXAM_OPTIONS}
                value={examId}
                onChange={(value) => {
                  setExamId(value);
                  setQuestionFilter('ALL');
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className="w-72"
              />
              <CustomDropdown
                options={questionOptions}
                value={questionFilter}
                onChange={(value) => {
                  setQuestionFilter(value);
                  setCurrentPage(1);
                }}
                className="w-72"
              />
            </div>
          </div>

          {/* Pills lọc theo trạng thái chấm (FR-08.2) */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                onClick={() => {
                  setStatusFilter(pill.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === pill.value
                    ? 'bg-[#06B6D4] text-white'
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E0F2FE]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Danh sách câu tự luận cần chấm */}
            <section className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-[#06B6D4]" />
                  <h2 className="text-sm font-bold text-[#0F172A]">Danh sách câu tự luận</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#475569]">
                  {filteredSubmissions.length} câu · trang {safePage}/{totalPages}
                </span>
              </div>

              <ul className="divide-y divide-[#E2E8F0] max-h-[560px] overflow-y-auto">
                {paginatedSubmissions.map((submission) => {
                  const isSelected = selected?.id === submission.id;
                  const isGraded = submission.status !== 'PENDING';

                  return (
                    <li key={submission.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(submission.id);
                          loadDraftFrom(submission);
                        }}
                        className={`w-full px-6 py-4 text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#E0F2FE]/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="text-xs font-bold text-[#0F172A]">{submission.studentName}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isGraded ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'
                            }`}
                          >
                            {isGraded ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
                            {isGraded ? `${submission.gradedScore}/${submission.maxScore}đ` : 'Chờ chấm'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569]">
                          {submission.studentId} · Lớp {submission.className}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
                          Câu {submission.questionCode}: {submission.questionContent}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {filteredSubmissions.length > 0 && (
                <div className="px-6 py-4 border-t border-[#E2E8F0]">
                  <Pagination
                    page={safePage}
                    pageSize={ESSAY_PAGE_SIZE}
                    totalItems={filteredSubmissions.length}
                    onPageChange={setCurrentPage}
                    itemLabel="bài tự luận"
                  />
                </div>
              )}
            </section>

            {/* Khung chấm điểm */}
            <section className="xl:col-span-7 space-y-5">
              {!selected ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center text-xs text-[#94A3B8]">
                  Không còn câu tự luận nào cần chấm cho đề thi này.
                </div>
              ) : (
                <>
                  <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-[#0F172A]">
                          {selected.studentName} - {selected.studentId}
                        </h2>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          Lớp {selected.className} · Câu {selected.questionCode} · Điểm tối đa {selected.maxScore}đ
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded text-[10px] font-semibold ${MATCH_RESULT_TONES[selected.matchResult]}`}
                        >
                          <KeyRound className="w-3 h-3" />
                          {MATCH_RESULT_LABELS[selected.matchResult]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] text-[#475569] rounded text-[10px] font-semibold">
                          <Info className="w-3 h-3" />
                          {selected.allowPartialKeywordScore
                            ? ESSAY_SCORING_RULE_LABELS.PARTIAL_KEYWORD_SCORE
                            : ESSAY_SCORING_RULE_LABELS.ALL_KEYWORDS_REQUIRED}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] text-[#475569] rounded text-[10px] font-semibold">
                          <CaseSensitive className="w-3 h-3" />
                          {selected.isCaseSensitive
                            ? ESSAY_CASE_RULE_LABELS.SENSITIVE
                            : ESSAY_CASE_RULE_LABELS.INSENSITIVE}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px]">
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase mb-1">Nội dung câu hỏi</p>
                      <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">{selected.questionContent}</p>
                    </div>

                    <div className="p-4 bg-white border border-[#E2E8F0] rounded-[16px]">
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase mb-1">Câu trả lời của thí sinh</p>
                      <p className="text-xs font-bold text-[#0F172A] leading-relaxed">{selected.studentAnswer}</p>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-[10px] text-[#94A3B8] font-semibold uppercase">
                          Từ khóa chuẩn đối soát ({selected.matchedKeywords.length}/{selected.acceptedKeywords.length} khớp)
                        </p>
                        <button
                          type="button"
                          onClick={handleRecheckMatch}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Đối soát lại
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.acceptedKeywords.map((keyword) => {
                          const isMatched = selected.matchedKeywords.includes(keyword);
                          return (
                            <span
                              key={keyword}
                              title={isMatched ? 'Thí sinh đã nêu từ khóa này' : 'Thí sinh chưa nêu từ khóa này'}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-[8px] text-[11px] font-semibold ${
                                isMatched
                                  ? 'bg-[#F0FDFA] border-[#06B6D4]/40 text-[#0E7490]'
                                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] line-through'
                              }`}
                            >
                              {isMatched ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {keyword}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3.5 bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[12px] text-[11px] text-[#0369A1]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p>
                        <span className="font-bold">Gợi ý của AI: </span>
                        {selected.aiLabel} - đề xuất {selected.aiSuggestedScore}/{selected.maxScore} điểm.
                      </p>
                    </div>
                  </div>

                  {/* Chấm nhanh 3 mức + ghi đè điểm */}
                  <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-bold text-[#0F172A]">Chấm điểm câu này</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {QUICK_GRADE_OPTIONS.map((option) => {
                        const isActive =
                          draftScore !== '' &&
                          Number(draftScore) === Number((selected.maxScore * option.ratio).toFixed(2));

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleQuickGrade(option)}
                            className={`flex flex-col items-center justify-center gap-1.5 py-4 border-2 rounded-[16px] text-xs font-bold transition-colors cursor-pointer ${
                              isActive
                                ? GRADE_TONES[option.tone]
                                : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                            }`}
                          >
                            {option.value === 'ZERO' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {option.label}
                            <span className="text-[10px] font-semibold opacity-70">
                              = {Number((selected.maxScore * option.ratio).toFixed(2))}đ
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-[#475569] mb-2">
                          Hoặc ghi đè điểm thủ công (tối đa {selected.maxScore}đ)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={selected.maxScore}
                          step={0.25}
                          value={overrideScore}
                          onChange={(event) => setOverrideScore(event.target.value)}
                          placeholder={`Nhập điểm 0 - ${selected.maxScore}`}
                          className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleOverrideGrade}
                        disabled={overrideScore === ''}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-[8px] transition-colors ${
                          overrideScore === ''
                            ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
                            : 'bg-white border border-[#06B6D4] text-[#0891B2] hover:bg-[#E0F2FE]/50 cursor-pointer'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Ghi đè điểm
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-2">
                        Nhận xét gửi tới thí sinh (tuỳ chọn)
                      </label>
                      <textarea
                        rows={3}
                        value={teacherNote}
                        onChange={(event) => setTeacherNote(event.target.value)}
                        placeholder="Nhận xét này sẽ hiển thị ở khối 'Nhận xét của GV' trong màn hình xem lại bài làm."
                        className="w-full px-3.5 py-3 text-xs border border-[#E2E8F0] rounded-[12px] leading-relaxed focus:outline-none focus:border-[#06B6D4]"
                      ></textarea>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#475569]">
                        <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Trạng thái:{' '}
                        {selected.status === 'PENDING'
                          ? 'Chờ chấm tay'
                          : selected.status === 'AUTO_GRADED'
                            ? 'Đã chấm tự động'
                            : 'Đã chấm'}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSaveGrade}
                          disabled={draftScore === ''}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-[8px] transition-colors shadow-sm ${
                            draftScore === ''
                              ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
                              : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          Lưu điểm câu này
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Câu tiếp theo
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

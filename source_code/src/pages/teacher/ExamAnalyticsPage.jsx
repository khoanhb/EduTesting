import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Award,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  ClipboardList,
  Eye,
  FileWarning,
  Filter,
  Search,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import ScoreDistributionChart from './components/ScoreDistributionChart';
import ViewOfficialRecordModal from '../../components/exam/ViewOfficialRecordModal';
import {
  mockExams,
  mockExamAnalytics,
  mockTeacherUser,
  mockViolations,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../data/teacher';

import { exportTable } from '../../utils/tabularFiles';
import { SCORE_COLUMNS } from '../../utils/adminFileData';

/** Thứ tự hiển thị độ khó trong khối phân tích độ khó đề thi. */
const DIFFICULTY_ORDER = ['EASY', 'MEDIUM', 'HARD'];

const TABS = [
  { value: 'ANALYSIS', label: 'Phân tích chất lượng đề', icon: BarChart3 },
  { value: 'SCORES', label: 'Bảng điểm danh sách lớp', icon: ClipboardList },
];

/**
 * Đề thi vừa có dữ liệu phân tích VỪA thuộc môn học giảng viên được phân công.
 * Ràng buộc này bảo đảm giảng viên không xem được thống kê của môn không phụ
 * trách (FR-02, FR-09.1).
 */
const ANALYZABLE_EXAMS = mockExams.filter(
  (exam) =>
    mockExamAnalytics[exam.id] && mockTeacherUser.managedSubjects.includes(exam.subjectCode)
);

/** Tất cả học kỳ xuất hiện trong dữ liệu đề thi. */
const SEMESTER_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả học kỳ' },
  ...Array.from(new Set(ANALYZABLE_EXAMS.map((exam) => exam.semester))).map((semester) => ({
    value: semester,
    label: semester,
  })),
];

export default function ExamAnalyticsPage() {
  const [semester, setSemester] = useState('ALL');
  const [subjectCode, setSubjectCode] = useState('ALL');
  const [examId, setExamId] = useState(ANALYZABLE_EXAMS[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState('ANALYSIS');
  const [keyword, setKeyword] = useState('');
  const [reviewStudent, setReviewStudent] = useState(null);
  const [recordStudent, setRecordStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [toastType, setToastType] = useState('success');
  const [fileBusy, setFileBusy] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Đề thi khả dụng sau khi lọc theo Học kỳ / Môn học (FR-09.1)
  const examOptions = useMemo(
    () =>
      ANALYZABLE_EXAMS.filter((exam) => {
        const matchSemester = semester === 'ALL' || exam.semester === semester;
        const matchSubject = subjectCode === 'ALL' || exam.subjectCode === subjectCode;
        return matchSemester && matchSubject;
      }),
    [semester, subjectCode]
  );

  const subjectFilterOptions = useMemo(() => {
    const unique = new Map();
    ANALYZABLE_EXAMS.forEach((exam) => {
      if (!unique.has(exam.subjectCode)) unique.set(exam.subjectCode, exam.subjectName);
    });
    return [
      { value: 'ALL', label: 'Tất cả môn học' },
      ...Array.from(unique.entries()).map(([value, label]) => ({ value, label: `${value} - ${label}` })),
    ];
  }, []);

  // Đổi bộ lọc có thể làm đề thi đang chọn không còn khả dụng, tự chọn đề đầu tiên
  const effectiveExamId = examOptions.some((exam) => exam.id === examId)
    ? examId
    : examOptions[0]?.id ?? '';

  const analytics = mockExamAnalytics[effectiveExamId];

  /**
   * Phân bổ độ khó của đề đang chọn, suy trực tiếp từ chính bảng phân tích
   * từng câu nên tổng ba mức luôn khớp số câu của đề.
   */
  const difficultySummary = useMemo(() => {
    if (!analytics) return [];
    const total = analytics.questionAnalysis.length;
    return DIFFICULTY_ORDER.map((level) => {
      const count = analytics.questionAnalysis.filter(
        (question) => question.difficulty === level
      ).length;
      return {
        id: level,
        label: DIFFICULTY_LABELS[level],
        count,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    });
  }, [analytics]);

  /**
   * Biên bản vi phạm thật của thí sinh đang xem, tra theo MSSV trong nhật ký
   * gian lận — không dựng biên bản giả tại trang (FR-09.5).
   */
  const recordViolation = useMemo(
    () =>
      recordStudent
        ? mockViolations.find((violation) => violation.studentId === recordStudent.studentId
          && violation.examCode === analytics?.examCode && violation.report) ?? null
        : null,
    [recordStudent, analytics?.examCode]
  );

  const statCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        id: 'avg',
        label: 'Điểm trung bình',
        value: Number(analytics.avgScore).toFixed(2),
        icon: TrendingUp,
        tone: 'bg-[#E0F2FE] text-[#0891B2]',
      },
      {
        id: 'median',
        label: 'Trung vị',
        value: Number(analytics.median).toFixed(2),
        icon: Target,
        tone: 'bg-[#EEF2FF] text-[#4F46E5]',
      },
      {
        id: 'range',
        label: 'Cao nhất / Thấp nhất',
        value: `${analytics.highestScore} / ${analytics.lowestScore}`,
        icon: Award,
        tone: 'bg-[#ECFDF5] text-[#059669]',
      },
      {
        id: 'pass',
        label: 'Tỷ lệ đạt (>= 5.0)',
        value: `${analytics.passRate}%`,
        icon: Users,
        tone: 'bg-[#FEF3C7] text-[#D97706]',
      },
    ];
  }, [analytics]);

  const filteredStudents = useMemo(() => {
    if (!analytics) return [];
    const search = keyword.trim().toLowerCase();
    if (search === '') return analytics.studentScores;
    return analytics.studentScores.filter(
      (student) =>
        student.name.toLowerCase().includes(search) ||
        student.studentId.toLowerCase().includes(search)
    );
  }, [analytics, keyword]);

  const handleExportFile = async (format) => {
    if (fileBusy) return;
    setFileBusy(true);
    try {
      const rows = filteredStudents.map((student) => ({ ...student, examCode: analytics.examCode }));
      await exportTable(SCORE_COLUMNS, rows, 'bang-diem-' + (analytics?.examCode ?? 'ky-thi'), format);
      showToast('Đã tạo file bảng điểm theo kỳ thi và bộ lọc hiện tại.');
    } catch (error) {
      showToast(error.message || 'Không xuất được file.', 'error');
    } finally {
      setFileBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Thống kê & Phân tích" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Thống kê & phân tích chất lượng đề thi</h1>
              <p className="text-xs text-[#475569] mt-1">
                {analytics
                  ? `${analytics.subjectName} · Đã nộp ${analytics.submitted}/${analytics.totalStudents} bài`
                  : 'Chọn đề thi để xem thống kê'}
              </p>
            </div>

            <Dropdown
              disabled={fileBusy}
              placeholder={
                <span className="inline-flex items-center gap-2 text-[#0891B2] font-semibold">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Xuất dữ liệu
                </span>
              }
              options={[
                { value: 'xlsx', label: 'Tải Excel (.xlsx)' },
                { value: 'csv', label: 'Tải CSV (.csv)' },
              ]}
              onChange={handleExportFile}
              className="w-fit min-w-0"
              triggerClassName="!h-[38px] !border-[#BAE6FD] !rounded-[8px]"
            />
          </div>

          {/* Bộ lọc Học kỳ / Môn học / Kỳ thi (FR-09.1) */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Bộ lọc thống kê &amp; phân tích</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CustomDropdown
                options={SEMESTER_FILTER_OPTIONS}
                value={semester}
                onChange={setSemester}
                className="w-full"
              />
              <CustomDropdown
                options={subjectFilterOptions}
                value={subjectCode}
                onChange={setSubjectCode}
                className="w-full"
              />
              <CustomDropdown
                options={examOptions.map((exam) => ({
                  value: exam.id,
                  label: `${exam.examCode} - ${exam.subjectName}`,
                }))}
                value={effectiveExamId}
                onChange={setExamId}
                className="w-full"
              />
            </div>
          </section>

          {!analytics ? (
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center text-xs text-[#94A3B8]">
              Chưa có dữ liệu thống kê cho đề thi này.
            </div>
          ) : (
            <>
{/* 4 thẻ chỉ số học vụ (FR-09.2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.id} className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
                      <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 ${card.tone}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{card.label}</p>
                      <p className="text-xl font-extrabold text-[#0F172A]">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Tab chuyển đổi 2 trạng thái (FR-09.5) */}
              <div className="flex items-center gap-1 bg-white rounded-[23px] p-1 w-fit">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[24px] text-xs font-semibold transition-colors cursor-pointer ${
                        activeTab === tab.value ? 'bg-[#06B6D4] text-white' : 'text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Phân tích chất lượng đề */}
              {activeTab === 'ANALYSIS' && (
                <div className="space-y-6">
                  <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-[#0F172A] mb-6">
                      Phổ điểm
                    </h2>
                    <ScoreDistributionChart distribution={analytics.scoreDistribution} />
                  </section>

                  <section className="bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[24px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-4 h-4 text-[#0891B2]" />
                      <h2 className="text-sm font-bold text-[#0F172A]">AI Insights - Đánh giá chất lượng đề</h2>
                    </div>
                    <ul className="space-y-3">
                      {analytics.aiInsights.map((insight) => (
                        <li key={insight.id} className="flex items-start gap-2.5 text-xs text-[#0C4A6E] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2] shrink-0 mt-1.5"></span>
                          {insight.text}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E2E8F0]">
                      <h2 className="text-sm font-bold text-[#0F172A]">Phân tích độ khó & độ phân hóa từng câu hỏi</h2>
                    </div>

                    {/* Tổng hợp độ khó: đếm trực tiếp từ bảng phân tích từng câu bên dưới */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-5 border-b border-[#E2E8F0] bg-slate-50/40">
                      {difficultySummary.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px]"
                        >
                          <span className="text-[11px] font-semibold text-[#475569]">{item.label}</span>
                          <span className="text-[11px] text-[#0F172A]">
                            <span className="font-extrabold">{item.count}</span> câu
                            <span className="text-[#94A3B8]"> · {item.percent}%</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs min-w-[1080px]">
                        <thead>
                          <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50/60">
                            <th className="py-3 pl-6 pr-3 w-16 text-center">Câu số</th>
                            <th className="py-3 pr-3">Mã câu hỏi</th>
                            <th className="py-3 pr-4">Nội dung câu hỏi</th>
                            <th className="py-3 pr-3">Loại câu hỏi</th>
                            <th className="py-3 pr-3">Độ khó</th>
                            <th className="py-3 pr-3 text-center">Tỷ lệ làm đúng</th>
                            <th className="py-3 pr-6">Nhận xét</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {analytics.questionAnalysis.map((question) => (
                            <tr key={question.questionNo} className="hover:bg-slate-50/70 transition-colors align-top">
                              <td className="py-3.5 pl-6 pr-3 text-center font-bold text-[#0F172A]">
                                {question.questionNo}
                              </td>
                              <td className="py-3.5 pr-3 font-bold text-[#0F172A] whitespace-nowrap">
                                {question.questionCode}
                              </td>
                              <td className="py-3.5 pr-4 text-[#475569] leading-relaxed max-w-[380px]">
                                {question.content}
                              </td>
                              <td className="py-3.5 pr-3 text-[#475569]">
                                {QUESTION_TYPE_LABELS[question.type] || question.type}
                              </td>
                              <td className="py-3.5 pr-3 text-[#475569]">
                                {DIFFICULTY_LABELS[question.difficulty] || question.difficulty}
                              </td>
                              <td className="py-3.5 pr-3 text-center">
                                <span className={`font-bold ${question.correctRate < 40 ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>
                                  {question.correctRate}%
                                </span>
                              </td>
                              {/* Nhận xét hiển thị dạng văn bản tự nhiên */}
                              <td className="py-3.5 pr-6 text-[11px] text-[#475569] leading-relaxed max-w-[320px]">
                                {question.remark ?? 'Đạt yêu cầu phân hóa.'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* Tab 2: Bảng điểm danh sách lớp */}
              {activeTab === 'SCORES' && (
                <section className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#E2E8F0]">
                    <h2 className="text-sm font-bold text-[#0F172A]">Bảng điểm danh sách lớp</h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={keyword}
                          onChange={(event) => setKeyword(event.target.value)}
                          placeholder="Tìm theo họ tên, MSSV"
                          className="w-64 pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#475569]">
                        {filteredStudents.length} / {analytics.totalStudents} thí sinh
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[1000px]">
                      <thead>
                        <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50/60">
                          <th className="py-3 pl-6 pr-3 w-12 text-center">STT</th>
                          <th className="py-3 pr-3">MSSV</th>
                          <th className="py-3 pr-3">Họ và tên</th>
                          <th className="py-3 pr-3">Lớp sinh hoạt</th>
                          <th className="py-3 pr-3 text-center">Điểm TN</th>
                          <th className="py-3 pr-3 text-center">Điểm TL</th>
                          <th className="py-3 pr-3 text-center">Tổng điểm</th>
                          <th className="py-3 pr-3">Trạng thái</th>
                          <th className="py-3 pr-6 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredStudents.map((student, index) => (
                          <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 pl-6 pr-3 text-center text-[#64748B] font-medium">{index + 1}</td>
                            <td className="py-3.5 pr-3 font-bold text-[#0F172A]">{student.studentId}</td>
                            <td className="py-3.5 pr-3 text-[#0F172A] font-medium">{student.name}</td>
                            <td className="py-3.5 pr-3 text-[#475569]">{student.class}</td>
                            <td className="py-3.5 pr-3 text-center text-[#475569] font-semibold">
                              {Number(student.mcqScore).toFixed(2)}
                            </td>
                            <td className="py-3.5 pr-3 text-center text-[#475569] font-semibold">
                              {Number(student.essayScore).toFixed(2)}
                            </td>
                            <td className="py-3.5 pr-3 text-center">
                              <span className={`font-bold ${student.totalScore >= 5 ? 'text-[#0F172A]' : 'text-[#EF4444]'}`}>
                                {Number(student.totalScore).toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3.5 pr-3">
                              <span
                                className={`inline-block px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                                  student.isSuspended
                                    ? 'bg-[#FEF2F2] text-[#EF4444]'
                                    : 'bg-[#ECFDF5] text-[#059669]'
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="py-3.5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                {student.isSuspended && (
                                  <button
                                    type="button"
                                    onClick={() => setRecordStudent(student)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#ef4444] hover:bg-red-600 rounded-[8px] transition-colors cursor-pointer"
                                  >
                                    <FileWarning className="w-3.5 h-3.5" />
                                    Xem biên bản
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title="Xem nhanh bài làm"
                                  onClick={() => setReviewStudent(student)}
                                  className="p-2 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal xem nhanh bài làm của một thí sinh */}
      <Modal
        isOpen={Boolean(reviewStudent)}
        onClose={() => setReviewStudent(null)}
        title="Chi tiết bài nộp của thí sinh"
        icon={Eye}
        tone="primary"
        size="lg"
      >
        {reviewStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-canvas border border-borderLine rounded-widget">
              <p className="font-bold text-textMain">{reviewStudent.name}</p>
              <p className="text-textSub mt-0.5">
                {reviewStudent.studentId} · Lớp {reviewStudent.class}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 border border-borderLine rounded-widget text-center">
                <p className="text-[10px] text-textMuted uppercase">Điểm trắc nghiệm</p>
                <p className="text-lg font-extrabold text-textMain">{Number(reviewStudent.mcqScore).toFixed(2)}</p>
              </div>
              <div className="p-3.5 border border-borderLine rounded-widget text-center">
                <p className="text-[10px] text-textMuted uppercase">Điểm tự luận</p>
                <p className="text-lg font-extrabold text-textMain">{Number(reviewStudent.essayScore).toFixed(2)}</p>
              </div>
              <div className="p-3.5 border border-borderLine rounded-widget text-center">
                <p className="text-[10px] text-textMuted uppercase">Tổng điểm</p>
                <p className="text-lg font-extrabold text-[#06B6D4]">{Number(reviewStudent.totalScore).toFixed(2)}</p>
              </div>
              <div className="p-3.5 border border-borderLine rounded-widget text-center">
                <p className="text-[10px] text-textMuted uppercase">Đúng / Sai / Bỏ qua</p>
                <p className="text-sm font-bold text-textMain">
                  <span className="text-[#10B981]">{reviewStudent.correct}</span> /{' '}
                  <span className="text-[#EF4444]">{reviewStudent.wrong}</span> /{' '}
                  <span className="text-[#D97706]">{reviewStudent.unanswered}</span>
                </p>
              </div>
            </div>

            {reviewStudent.isSuspended && (
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-widget text-[#B91C1C] font-medium">
                Thí sinh bị đình chỉ thi - điểm số đã được xử lý theo biên bản vi phạm.
              </div>
            )}

            {/* Chi tiết từng câu: dùng mã câu + nội dung thật từ Ngân hàng câu hỏi */}
            <div className="border border-borderLine rounded-widget overflow-hidden">
              <div className="px-4 py-3 bg-canvas border-b border-borderLine">
                <p className="font-bold text-textMain">Chi tiết từng câu trả lời</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-left text-textMuted font-semibold bg-slate-50 border-b border-borderLine">
                      <th className="py-2.5 pl-4 pr-2 w-10 text-center">#</th>
                      <th className="py-2.5 pr-3">Mã câu</th>
                      <th className="py-2.5 pr-4">Nội dung câu hỏi</th>
                      <th className="py-2.5 pr-3">Trả lời</th>
                      <th className="py-2.5 pr-4 text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderLine">
                    {reviewStudent.answers.map((answer) => (
                      <tr key={answer.questionNo} className="align-top">
                        <td className="py-2.5 pl-4 pr-2 text-center text-textSub">{answer.questionNo}</td>
                        <td className="py-2.5 pr-3 font-bold text-textMain whitespace-nowrap">
                          {answer.questionCode}
                        </td>
                        <td className="py-2.5 pr-4 text-textSub leading-relaxed max-w-[280px]">
                          {answer.content}
                        </td>
                        <td className="py-2.5 pr-3 text-textSub">{answer.studentAnswer || 'Bỏ qua'}</td>
                        <td className="py-2.5 pr-4 text-center whitespace-nowrap">
                          {answer.isUnanswered ? (
                            <span className="text-[#D97706] font-semibold">Bỏ qua</span>
                          ) : answer.isCorrect ? (
                            <span className="text-[#059669] font-semibold">Đúng</span>
                          ) : (
                            <span className="text-[#EF4444] font-semibold">Sai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal M.08 Xem biên bản vi phạm (read-only) */}
      <ViewOfficialRecordModal
        isOpen={Boolean(recordStudent && recordViolation?.report)}
        onClose={() => setRecordStudent(null)}
        record={recordViolation?.report ?? null}
      />
      <Modal isOpen={Boolean(recordStudent && !recordViolation?.report)}
        onClose={() => setRecordStudent(null)} title="Biên bản vi phạm">
        <p>Chưa có biên bản vi phạm cho sinh viên trong kỳ thi này.</p>
      </Modal>
    </div>
  );
}

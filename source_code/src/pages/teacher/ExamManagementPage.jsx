import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Rocket,
  BarChart3,
  Pencil,
  Trash2,
  Eye,
  PenLine,
  ListChecks,
  Info,
  Database,
  Layers3,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import CustomDropdown from '../../components/common/CustomDropdown';
import Pagination from '../../components/ui/Pagination';
import ExamPublishModal from './components/ExamPublishModal';
import ExamQuestionsPreviewModal from './components/ExamQuestionsPreviewModal';
import MonitorExamButton from './components/MonitorExamButton';
import {
  mockExams,
  mockSubjects,
  mockTeacherUser,
  EXAM_STATUS_LABELS,
  EXAM_STATUS_BADGES,
  EXAM_CATEGORIES,
} from '../../data/teacher';

/** Số đề thi hiển thị mỗi trang (FR-07.1). */
const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  keyword: '',
  dateFrom: '',
  dateTo: '',
  semester: 'ALL',
  category: 'ALL',
  subjectCode: 'ALL',
  status: 'ALL',
};

/** Pills lọc nhanh theo khoảng thời gian (FR-07.1). */
const TIME_PILLS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'TODAY', label: 'Hôm nay' },
  { value: 'WEEK', label: 'Tuần này' },
  { value: 'MONTH', label: 'Tháng này' },
];

const SEMESTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả học kỳ' },
  { value: 'HK1/2025-2026', label: 'HK1/2025-2026' },
  { value: 'HK2/2025-2026', label: 'HK2/2025-2026' },
  { value: 'HK3/2025-2026', label: 'HK Hè/2025-2026' },
];

/** Parse chuỗi 'dd/MM/yyyy HH:mm' thành Date để lọc theo thời gian. */
function parseExamDate(value) {
  if (!value) return null;
  const [datePart, timePart = ''] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  if (!day || !month || !year) return null;
  const [hour = 0, minute = 0] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function isSameDay(a, b) {
  return (
    Boolean(a) &&
    Boolean(b) &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Định dạng Date thành chuỗi 'yyyy-mm-dd' để so sánh khoảng ngày. */
function toIsoDate(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Đầu tuần (Thứ 2) của một mốc thời gian. */
function startOfWeek(date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export default function ExamManagementPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState(mockExams);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [timePill, setTimePill] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [publishTarget, setPublishTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const now = useMemo(() => new Date(), []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredExams = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return exams.filter((exam) => {
      const roomsText = (exam.rooms ?? []).join(' ').toLowerCase();
      const matchKeyword =
        keyword === '' ||
        exam.examCode.toLowerCase().includes(keyword) ||
        exam.subjectName.toLowerCase().includes(keyword) ||
        exam.category.toLowerCase().includes(keyword) ||
        roomsText.includes(keyword);

      const matchSemester = filters.semester === 'ALL' || exam.semester === filters.semester;
      const matchCategory = filters.category === 'ALL' || exam.category === filters.category;
      const matchSubject = filters.subjectCode === 'ALL' || exam.subjectCode === filters.subjectCode;
      const matchStatus = filters.status === 'ALL' || exam.status === filters.status;

      const open = parseExamDate(exam.openTime);
      const close = parseExamDate(exam.closeTime) ?? open;
      const openIso = toIsoDate(open);
      const closeIso = toIsoDate(close);

      // Lọc theo KHOẢNG thời gian mở đề: đề mở nhiều ngày vẫn khớp nếu giao với [Từ ngày, Đến ngày].
      const matchFromDate = !filters.dateFrom || (closeIso !== null && closeIso >= filters.dateFrom);
      const matchToDate = !filters.dateTo || (openIso !== null && openIso <= filters.dateTo);
      const matchDate = matchFromDate && matchToDate;

      let matchPill = true;
      if (timePill === 'TODAY') matchPill = isSameDay(open, now);
      else if (timePill === 'WEEK') matchPill = Boolean(open) && open >= weekStart && open < weekEnd;
      else if (timePill === 'MONTH') {
        matchPill = Boolean(open) && open.getFullYear() === now.getFullYear() && open.getMonth() === now.getMonth();
      }

      return matchKeyword && matchSemester && matchCategory && matchSubject && matchStatus && matchDate && matchPill;
    });
  }, [exams, filters, timePill, now]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedExams = filteredExams.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const subjectOptions = [
    { value: 'ALL', label: 'Tất cả môn học' },
    ...mockSubjects.map((subject) => ({ value: subject.code, label: `${subject.code} - ${subject.name}` })),
  ];

  const categoryOptions = [{ value: 'ALL', label: 'Tất cả loại kỳ thi' }, ...EXAM_CATEGORIES];

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    ...Object.entries(EXAM_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const updateFilter = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setCurrentPage(1);
  };

  const handlePublish = () => {
    setExams((current) =>
      current.map((exam) =>
        exam.id === publishTarget.id
          ? { ...exam, status: 'ONGOING', testCodeCount: exam.testCodeCount || 4 }
          : exam
      )
    );
    showToast('Xuất bản đề thi thành công!');
    setPublishTarget(null);
  };

  const handleDelete = () => {
    setExams((current) => current.filter((exam) => exam.id !== deleteTarget.id));
    showToast('Đã xóa đề thi khỏi hệ thống.');
    setDeleteTarget(null);
  };
return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Quản lý đề thi" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Quản lý đề thi</h1>
              <p className="text-xs text-[#475569] mt-1">
                Theo dõi {exams.length} đề thi trong học kỳ, cấu hình ma trận và xuất bản phòng thi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/teacher/exams/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo đề thi mới
            </button>
          </div>

          {/* Bộ lọc */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Bộ lọc đề thi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative xl:col-span-2 flex flex-col justify-end">
                <span className="absolute bottom-0 left-0 h-[38px] pl-3.5 flex items-center text-[#94A3B8] pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo kỳ thi, phòng thi, môn học"
                  value={filters.keyword}
                  onChange={(event) => updateFilter({ keyword: event.target.value })}
                  className="w-full h-[38px] pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-[8px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors"
                />
              </div>

              {/* Lọc theo khoảng thời gian mở đề: Từ ngày - Đến ngày */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                    Khung giờ mở đề từ
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => updateFilter({ dateFrom: event.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs text-[#475569] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    min={filters.dateFrom || undefined}
                    onChange={(event) => updateFilter({ dateTo: event.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs text-[#475569] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <CustomDropdown options={SEMESTER_OPTIONS} value={filters.semester} onChange={(value) => updateFilter({ semester: value })} className="w-full" />
              <CustomDropdown options={categoryOptions} value={filters.category} onChange={(value) => updateFilter({ category: value })} className="w-full" />
              <CustomDropdown options={subjectOptions} value={filters.subjectCode} onChange={(value) => updateFilter({ subjectCode: value })} className="w-full" />
              <CustomDropdown options={statusOptions} value={filters.status} onChange={(value) => updateFilter({ status: value })} className="w-full" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {TIME_PILLS.map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => {
                      setTimePill(pill.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                      timePill === pill.value
                        ? 'bg-[#06B6D4] text-white'
                        : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E0F2FE]'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setTimePill('ALL');
                  setCurrentPage(1);
                }}
                className="text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          </section>

          {/* Bảng đề thi */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-[#0F172A]">Danh sách đề thi</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                <Layers3 className="w-3.5 h-3.5" />
                Hiển thị {filteredExams.length} / {exams.length} đề thi
              </span>
            </div>

            {filteredExams.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#94A3B8]">
                Không tìm thấy đề thi nào khớp bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[1120px]">
                  <thead>
                    <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50/60">
                      <th className="py-3 pl-6 pr-3 w-12 text-center">STT</th>
                      <th className="py-3 pr-3">Kỳ thi</th>
                      <th className="py-3 pr-3">Loại kỳ thi</th>
                      <th className="py-3 pr-3">Phòng thi</th>
                      <th className="py-3 pr-3">Môn học</th>
                      <th className="py-3 pr-3 text-center">Thời lượng</th>
                      <th className="py-3 pr-3">Khung giờ mở đề</th>
                      <th className="py-3 pr-3">Tiến độ bài nộp</th>
                      <th className="py-3 pr-3">Trạng thái</th>
                      <th className="py-3 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedExams.map((exam, index) => {
                      const stt = (safePage - 1) * PAGE_SIZE + index + 1;
                      const isDraft = exam.status === 'DRAFT';
                      const isUpcoming = exam.status === 'UPCOMING';
                      const isOngoing = exam.status === 'ONGOING';
                      const isClosed = exam.status === 'CLOSED';
                      const isPending = exam.status === 'PENDING_GRADING';

                      // Đề chưa mở thì chưa có tiến độ bài nộp.
                      const hasOpened = !isDraft && !isUpcoming;
                      const submittedCount = Number(exam.submittedCount) || 0;
                      const candidateCount = Number(exam.candidateCount) || 0;
                      const progressPercent =
                        candidateCount > 0 ? Math.round((submittedCount / candidateCount) * 100) : 0;

                      return (
                        <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors align-top">
                          <td className="py-3.5 pl-6 pr-3 text-center text-[#64748B] font-medium">
                            {stt}
                          </td>

                          <td className="py-3.5 pr-3">
                            <div className="font-bold text-[#0F172A] whitespace-nowrap">{exam.examCode}</div>
                            <div className="text-[10px] text-[#94A3B8] mt-0.5">{exam.semester}</div>
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569] whitespace-nowrap">{exam.category}</td>

                          <td className="py-3.5 pr-3 text-[#475569]">
                            {exam.rooms && exam.rooms.length > 0 ? exam.rooms.join(', ') : '-'}
                          </td>

                          <td className="py-3.5 pr-3 text-[#0F172A] font-semibold max-w-[200px]">
                            {exam.subjectName}
                          </td>

                          <td className="py-3.5 pr-3 text-center text-[#475569] font-semibold whitespace-nowrap">
                            {exam.durationMinutes} phút
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569] whitespace-nowrap">
                            {exam.openTime} - {exam.closeTime}
                          </td>

                          {/* Cột Tiến độ bài nộp - đồng bộ với Dashboard Giảng viên */}
                          <td className="py-3.5 pr-3 min-w-[120px]">
                            {hasOpened ? (
                              <>
                                <div className="text-[#0F172A] font-semibold whitespace-nowrap">
                                  {submittedCount}/{candidateCount} SV
                                </div>
                                <div className="w-24 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden mt-1.5">
                                  <div
                                    className="h-full bg-[#06B6D4] rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                </div>
                              </>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8]">Chưa mở đề</span>
                            )}
                          </td>

                          <td className="py-3.5 pr-3">
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${EXAM_STATUS_BADGES[exam.status]}`}>
                              {EXAM_STATUS_LABELS[exam.status]}
                            </span>
                          </td>

                          <td className="py-3.5 pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              {isOngoing && (
                                <MonitorExamButton
                                  onClick={() => navigate(`/teacher/anti-cheat?examId=${exam.id}`)}
                                />
                              )}

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => navigate('/teacher/grade-essay')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white text-[11px] font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer whitespace-nowrap"                                >
                                  <PenLine className="w-3.5 h-3.5" />
                                  Chấm bài
                                </button>
                              )}

                              <button
                                type="button"
                                title="Xem trước danh sách câu hỏi trong đề"
                                onClick={() => setPreviewTarget(exam)}
                                className="p-2 text-[#475569] hover:text-[#0891B2] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                              >
                                <ListChecks className="w-3.5 h-3.5" />
                              </button>

                              {isDraft && (
                                <button
                                  type="button"
                                  title="Xuất bản đề thi"
                                  onClick={() => setPublishTarget(exam)}
                                  className="p-2 text-[#0891B2] hover:bg-[#E0F2FE] rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <Rocket className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isClosed && (
                                <button
                                  type="button"
                                  title="Thống kê & phân tích"
                                  onClick={() => navigate('/teacher/analytics')}
                                  className="p-2 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <BarChart3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {(isDraft || isUpcoming) && (
                                <button
                                  type="button"
                                  title="Chỉnh sửa cấu hình đề thi"
                                  onClick={() => navigate('/teacher/exams/create')}
                                  className="p-2 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {(isOngoing || isClosed || isPending) && (
                                <button
                                  type="button"
                                  title="Xem cấu hình đề thi (chỉ đọc)"
                                  onClick={() => navigate(`/teacher/exams/create?mode=view&id=${exam.id}`)}
                                  className="p-2 text-[#475569] hover:text-[#06B6D4] hover:bg-[#E0F2FE]/50 rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {(isDraft || isUpcoming) && (
                                <button
                                  type="button"
                                  title="Xóa đề thi"
                                  onClick={() => setDeleteTarget(exam)}
                                  className="p-2 text-[#475569] hover:text-[#EF4444] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {hasOpened && (
                                <span
                                  title="Đề thi đã mở hoặc đã kết thúc nên không thể chỉnh sửa cấu hình hay xóa để bảo toàn dữ liệu bài thi."
                                  className="p-2 text-[#94A3B8] cursor-help"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredExams.length > 0 && (
              <div className="px-6 py-4 border-t border-[#E2E8F0]">
                <Pagination
                  page={safePage}
                  pageSize={PAGE_SIZE}
                  totalItems={filteredExams.length}
                  onPageChange={setCurrentPage}
                  itemLabel="đề thi"
                />
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modal M.18 Xác nhận xuất bản đề thi */}
      <ExamPublishModal
        isOpen={Boolean(publishTarget)}
        exam={publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={handlePublish}
      />

      {/* Modal M.06 Xác nhận xóa đề thi */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa đề thi này?"
        description={
          deleteTarget
            ? `Đề thi ${deleteTarget.examCode} (${deleteTarget.subjectName}) sẽ bị gỡ bỏ cùng toàn bộ mã đề và điểm thi liên quan. Hành động này không thể hoàn tác.`
            : ''
        }
      />

      {/* Modal M.12 Xem trước danh sách câu hỏi trong đề */}
      <ExamQuestionsPreviewModal
        isOpen={Boolean(previewTarget)}
        exam={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}

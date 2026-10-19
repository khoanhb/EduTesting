import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  ListChecks,
  Wand2,
  Rocket,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import ExamMatrixManualPicker from './components/ExamMatrixManualPicker';
import ExamMatrixAutoBuilder from './components/ExamMatrixAutoBuilder';
import ReviewSelectedQuestionsModal from './components/ReviewSelectedQuestionsModal';
import QuestionPreviewModal from './components/QuestionPreviewModal';
import { mockLabRooms, getRoomById, ONLINE_ROOM_ID } from '../../data/shared/organization';
import {
  getExamById,
  mockSubjects,
  mockQuestions,
  mockTeacherUser,
  ALLOWED_ATTEMPT_OPTIONS,
  EXAM_CATEGORIES,
} from '../../data/teacher';

const MATRIX_MODES = [
  { value: 'MANUAL', label: 'Thủ công', icon: ListChecks, hint: 'Chọn từng câu hỏi từ kho' },
  { value: 'AUTO', label: 'Tự động', icon: Wand2, hint: 'Bốc ngẫu nhiên theo tỷ lệ độ khó' },
];

const SEMESTER_OPTIONS = [
  { value: 'HK2/2025-2026', label: 'HK2/2025-2026' },
  { value: 'HK1/2025-2026', label: 'HK1/2025-2026' },
  { value: 'HK3/2025-2026', label: 'HK Hè/2025-2026' },
];

/**
 * Hình thức thi (FR-07.2).
 * Chọn "Phòng máy" thì phải chỉ định cụ thể từng phòng LAB-01…LAB-05; chọn
 * "Thi trực tuyến" thì phòng thi luôn là ONLINE. Danh mục phòng lấy từ nguồn
 * sự thật duy nhất `mockRooms` nên mã phòng lưu vào đề thi trùng với mã phòng
 * hiển thị ở Phòng thi đang diễn ra và Bàn giám sát gian lận.
 */
const ROOM_TYPE_OPTIONS = [
  { value: 'LAB', label: 'Phòng máy (LAB)' },
  { value: 'ONLINE', label: 'Thi trực tuyến (Online)' },
];

/** Quy chế mặc định (FR-07.2 - có thể tự chỉnh sửa). */
const DEFAULT_RULES_TEXT =
  'Sinh viên không được sử dụng tài liệu ngoài. Hệ thống sẽ ghi nhận và cảnh báo nếu phát hiện thoát trình duyệt hoặc rời khỏi màn hình làm bài.';

/** Loại kỳ thi chính thức bắt buộc 1 lượt và bật cảnh báo gian lận. */
const OFFICIAL_CATEGORIES = ['Giữa kỳ', 'Cuối kỳ'];

/** Số mã đề tối đa được sinh thêm (FR-07.2 - Cài đặt bảo mật). */
const MAX_TEST_CODES = 10;

/** Cấu hình bảo mật & trải nghiệm thi (FR-07.2). */
const SECURITY_SETTINGS = [
  {
    key: 'shuffleQuestions',
    label: 'Xáo trộn thứ tự câu hỏi',
    hint: 'Mỗi mã đề có thứ tự câu hỏi khác nhau.',
  },
  {
    key: 'shuffleAnswers',
    label: 'Xáo trộn thứ tự đáp án',
    hint: 'Đảo vị trí đáp án A–B–C–D giữa các mã đề.',
  },
  {
    key: 'antiCheat',
    label: 'Bật cảnh báo gian lận rời tab',
    hint: 'Ghi nhận chuyển tab / mất focus / thu nhỏ màn hình; đình chỉ ở lần thứ 3.',
    requiredForOfficial: true,
  },
  {
    key: 'showScoreImmediately',
    label: 'Công bố điểm số ngay sau khi nộp',
    hint: 'Tắt nếu giảng viên cần đối soát tự luận trước khi trả điểm.',
  },
  {
    key: 'allowReview',
    label: 'Cho phép xem lại bài làm & đáp án chi tiết',
    hint: 'Bật để thí sinh xem chi tiết đáp án ở màn hình 3.4.',
  },
];

function ToggleSwitch({ checked, onChange, label, hint, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-full flex items-start justify-between gap-4 px-4 py-3 border border-[#E2E8F0] rounded-[12px] bg-white transition-colors text-left ${
        disabled ? 'opacity-70 cursor-not-allowed' : 'hover:border-[#06B6D4] cursor-pointer'
      }`}
    >
      <span>
        <span className="block text-xs font-semibold text-[#0F172A]">{label}</span>
        <span className="block text-[11px] text-[#94A3B8] mt-0.5">{hint}</span>
      </span>
      <span className={`w-9 h-5 rounded-full shrink-0 relative transition-colors ${checked ? 'bg-[#06B6D4]' : 'bg-[#CBD5E1]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}></span>
      </span>
    </button>
  );
}

export default function CreateExamMatrixPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /**
   * FR-07.1: nút "xem cấu hình đề thi" của đề đã xuất bản mở lại trang này ở
   * chế độ chỉ đọc (?mode=view) - toàn bộ biểu mẫu bị khóa, chỉ còn nút Đóng.
   */
  const isReadOnly = searchParams.get('mode') === 'view';

  /**
   * Đề thi đang được xem/sửa, tra theo `?exam=<mã hoặc id>` (FR-07.1 - nút
   * "xem cấu hình đề thi"). Không truyền tham số thì biểu mẫu mở ở chế độ tạo
   * mới với giá trị mặc định.
   */
  const preloadedExam = getExamById(searchParams.get('exam') ?? '') ?? null;

  /** Hình thức thi suy ra từ danh sách phòng đã lưu của đề thi. */
  const initialRoomType =
    preloadedExam && preloadedExam.rooms.includes(ONLINE_ROOM_ID) ? 'ONLINE' : 'LAB';

  // 1. Thông tin chung của kỳ thi
  const [examName, setExamName] = useState(
    preloadedExam
      ? `${preloadedExam.category} - ${preloadedExam.subjectName}`
      : 'Kiểm tra giữa kỳ - Hệ cơ sở dữ liệu'
  );
  const [examCode, setExamCode] = useState(preloadedExam?.examCode ?? 'CSDL_GK_02');
  const [category, setCategory] = useState(preloadedExam?.category ?? 'Giữa kỳ');
  const [subjectCode, setSubjectCode] = useState(
    preloadedExam?.subjectCode ?? mockSubjects[0].code
  );
  const [semester, setSemester] = useState(preloadedExam?.semester ?? 'HK2/2025-2026');
  const [roomType, setRoomType] = useState(initialRoomType);
  // Danh sách phòng thi cụ thể của đề (mảng mã phòng canonical).
  const [rooms, setRooms] = useState(preloadedExam?.rooms ?? ['LAB-04', 'LAB-05']);
  const [rulesText, setRulesText] = useState(DEFAULT_RULES_TEXT);

  // 2. Thời gian & lượt làm bài
  const [durationMinutes, setDurationMinutes] = useState(preloadedExam?.durationMinutes ?? 45);
  const [openTime, setOpenTime] = useState(preloadedExam?.openAt ?? '2026-05-13T08:00');
  const [closeTime, setCloseTime] = useState(preloadedExam?.closeAt ?? '2026-05-13T11:30');
  const [maxAttempts, setMaxAttempts] = useState(preloadedExam?.maxAttempts ?? 1);

  // 3. Ma trận đề
  const [matrixMode, setMatrixMode] = useState(preloadedExam?.matrixMode ?? 'MANUAL');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [autoTotal, setAutoTotal] = useState(preloadedExam?.questionsCount ?? 20);
  const [autoRatio, setAutoRatio] = useState({ EASY: 40, MEDIUM: 40, HARD: 20 });
  const [autoGenerated, setAutoGenerated] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 4. Cấu hình bảo mật
  const [settings, setSettings] = useState({
    shuffleQuestions: preloadedExam?.shuffleQuestions ?? true,
    shuffleAnswers: preloadedExam?.shuffleAnswers ?? true,
    antiCheat: preloadedExam?.antiCheat ?? true,
    showScoreImmediately: preloadedExam?.showScoreImmediately ?? true,
    allowReview: preloadedExam?.allowReview ?? true,
  });
  const [testCodeCount, setTestCodeCount] = useState(preloadedExam?.testCodeCount || 4);

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);

  const isOfficialExam = OFFICIAL_CATEGORIES.includes(category);

  const subjects = useMemo(
    () => mockSubjects.filter((subject) => mockTeacherUser.managedSubjects.includes(subject.code)),
    []
  );
  const chapters = useMemo(
    () => mockSubjects.find((subject) => subject.code === subjectCode)?.chapters ?? [],
    [subjectCode]
  );

  const subjectOptions = subjects.map((subject) => ({
    value: subject.code,
    label: `${subject.code} - ${subject.name}`,
  }));
  const attemptOptions = ALLOWED_ATTEMPT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  /** Danh mục phòng máy canonical để chọn khi hình thức thi là phòng máy. */
  const labRoomOptions = mockLabRooms;

  /**
   * Phòng thi thực sự lưu vào đề thi: thi trực tuyến luôn là đúng một phòng
   * ONLINE, thi tại phòng máy là danh sách các phòng LAB giảng viên đã chọn.
   */
  const resolvedRooms = roomType === 'ONLINE' ? [ONLINE_ROOM_ID] : rooms;

  const roomSummary = resolvedRooms
    .map((roomId) => getRoomById(roomId)?.name ?? roomId)
    .join(', ');

  const activeQuestions = matrixMode === 'MANUAL' ? selectedQuestions : autoGenerated;
  const questionCount = activeQuestions.length;
  const difficultyBreakdown = useMemo(
    () => ({
      EASY: activeQuestions.filter((q) => q.difficulty === 'EASY').length,
      MEDIUM: activeQuestions.filter((q) => q.difficulty === 'MEDIUM').length,
      HARD: activeQuestions.filter((q) => q.difficulty === 'HARD').length,
    }),
    [activeQuestions]
  );

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /** Chữ ký cấu hình: thay đổi bất kỳ trường nào cũng kích hoạt lưu nháp tự động. */
  const autoSaveSignature = JSON.stringify({
    examName,
    examCode,
    category,
    subjectCode,
    semester,
    roomType,
    rooms: resolvedRooms,
    rulesText,
    durationMinutes,
    openTime,
    closeTime,
    maxAttempts,
    matrixMode,
    autoTotal,
    autoRatio,
    selectedIds: selectedQuestions.map((question) => question.id),
    autoIds: autoGenerated.map((question) => question.id),
    settings,
    testCodeCount,
  });

  const isFirstAutoSave = useRef(true);

  /**
   * FR-07.2: tự động lưu bản nháp sau 1.2s kể từ thao tác chỉnh sửa cuối cùng.
   * Không áp dụng ở chế độ chỉ đọc (?mode=view).
   */
  useEffect(() => {
    if (isReadOnly) return undefined;
    if (isFirstAutoSave.current) {
      isFirstAutoSave.current = false;
      return undefined;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      setAutoSaveStatus('saved');
      setLastAutoSavedAt(new Date());
    }, 1200);

    return () => clearTimeout(timer);
  }, [autoSaveSignature, isReadOnly]);

  // Ràng buộc nghiệp vụ: kỳ thi chính thức bắt buộc 1 lượt + bật cảnh báo gian lận.
  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    if (OFFICIAL_CATEGORIES.includes(nextCategory)) {
      setMaxAttempts(1);
      setSettings((current) => ({ ...current, antiCheat: true }));
    }
  };

  const handleToggleSetting = (key) => {
    if (key === 'antiCheat' && isOfficialExam) return; // bắt buộc bật với Giữa kỳ / Cuối kỳ
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  /** Đổi hình thức thi thì đặt lại danh sách phòng cho khớp hình thức mới. */
  const handleRoomTypeChange = (nextRoomType) => {
    setRoomType(nextRoomType);
    setRooms(nextRoomType === 'ONLINE' ? [ONLINE_ROOM_ID] : ['LAB-04', 'LAB-05']);
  };

  /** Bật/tắt một phòng máy trong danh sách phòng của đề thi. */
  const handleToggleRoom = (roomId) => {
    setRooms((current) =>
      current.includes(roomId)
        ? current.filter((item) => item !== roomId)
        : [...current, roomId]
    );
  };

  /**
   * Payload cấu hình đề thi gửi lên Backend (POST /exams). `rooms` là mảng mã
   * phòng canonical nên phòng thi lưu xuống trùng với phòng hiển thị ở bảng
   * giám sát và bảng điểm.
   */
  const buildExamPayload = () => ({
    examCode,
    examName,
    category,
    subjectCode,
    semester,
    durationMinutes,
    openTime,
    closeTime,
    maxAttempts,
    roomType,
    rooms: resolvedRooms,
    rulesText,
    matrixMode,
    testCodeCount,
    settings,
    questionCodes: activeQuestions.map((question) => question.questionCode ?? question.id),
  });

  /** POST /exams/generate-matrix - bốc câu theo tỷ lệ độ khó. */
  const handleGenerateMatrix = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const pool = mockQuestions.filter((question) => question.subjectCode === subjectCode);
      const picked = Array.from({ length: autoTotal }).map((_, index) => {
        const source = pool[index % Math.max(pool.length, 1)] || mockQuestions[index % mockQuestions.length];
        const cycle = Math.floor(index / Math.max(pool.length, 1));
        return { ...source, difficulty: cycle === 0 ? 'EASY' : cycle === 1 ? 'MEDIUM' : 'HARD' };
      });

      setAutoGenerated(picked);
      setIsGenerating(false);
      showToast(`Đã bốc ${picked.length} câu hỏi theo ma trận độ khó.`);
    }, 1200);
  };

  /** Sinh lại một câu trong kết quả bốc tự động (FR-07.2). */
  const handleRegenerateQuestion = (questionId) => {
    setAutoGenerated((current) => {
      const pool = mockQuestions.filter((question) => question.subjectCode === subjectCode);
      if (pool.length === 0) return current;
      const replacement = pool[Math.floor(Math.random() * pool.length)];
      return current.map((item) =>
        item.id === questionId
          ? { ...replacement, id: `${replacement.id}-${Date.now()}`, difficulty: item.difficulty }
          : item
      );
    });
    showToast('Đã sinh lại câu hỏi.');
  };

  const handleRemoveSelected = (questionId) => {
    setSelectedQuestions((current) => current.filter((item) => item.id !== questionId));
  };

  const handleSaveDraft = () => {
    // POST /exams với trạng thái DRAFT
    buildExamPayload();
    showToast('Đã lưu bản nháp cấu hình đề thi.');
    setTimeout(() => navigate('/teacher/exams'), 900);
  };

  const handlePublish = () => {
    // Ràng buộc FR-07.2: thi tại phòng máy phải chỉ định ít nhất một phòng cụ thể.
    if (roomType === 'LAB' && resolvedRooms.length === 0) {
      showToast('Vui lòng chọn ít nhất một phòng thi trước khi xuất bản.');
      return;
    }

    // POST /exams rồi PATCH /exams/{id}/publish
    buildExamPayload();
    showToast(`Đã lưu & xuất bản đề thi với ${testCodeCount} mã đề tại ${roomSummary}.`);
    setTimeout(() => navigate('/teacher/exams'), 900);
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

        <main className="flex-1 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/exams')}
                title="Quay lại quản lý đề thi"
                className="p-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">
                  {isReadOnly ? 'Xem cấu hình đề thi' : 'Tạo đề thi & cấu hình ma trận'}
                </h1>
                <p className="text-xs text-[#475569] mt-1">
                  {isReadOnly
                    ? `Đề thi ${examCode} đã được xuất bản nên chỉ có thể xem, không thể chỉnh sửa cấu hình.`
                    : 'Thiết lập thông tin kỳ thi, chọn ma trận câu hỏi và cấu hình bảo mật phòng thi.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Trạng thái tự động lưu bản nháp (FR-07.2) */}
              {!isReadOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold text-[#475569]">
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" />
                      Đang tự động lưu...
                    </>
                  ) : autoSaveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      Đã tự động lưu lúc{' '}
                      {lastAutoSavedAt ? lastAutoSavedAt.toLocaleTimeString('vi-VN') : ''}
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Bản nháp được lưu tự động
                    </>
                  )}
                </span>
              )}

              {isReadOnly ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#06B6D4] bg-white text-[#0891B2] text-xs font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Xem câu đã chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/teacher/exams')}
                    className="px-5 py-2.5 border border-[#E2E8F0] bg-white text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/teacher/exams')}
                    className="px-5 py-2.5 border border-[#E2E8F0] bg-white text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#06B6D4] bg-white text-[#0891B2] text-xs font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu bản nháp
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Lưu & Xuất bản đề thi
                  </button>
                </>
              )}
            </div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); handleSaveDraft(); }}>
            {/* Ở chế độ chỉ đọc, fieldset disabled khóa toàn bộ input/button con. */}
            <fieldset disabled={isReadOnly} className="space-y-6">
            {/* 1. Thông tin kỳ thi */}
            <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0F172A]">1. Thông tin kỳ thi</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="xl:col-span-2">
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Tên bài thi *</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(event) => setExamName(event.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Mã kỳ thi *</label>
                  <input
                    type="text"
                    required
                    value={examCode}
                    onChange={(event) => setExamCode(event.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Loại kỳ thi</label>
                  <CustomDropdown options={EXAM_CATEGORIES} value={category} onChange={handleCategoryChange} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Môn học</label>
                  <CustomDropdown
                    options={subjectOptions}
                    value={subjectCode}
                    onChange={(value) => {
                      setSubjectCode(value);
                      setSelectedQuestions([]);
                      setAutoGenerated([]);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Học kỳ</label>
                  <CustomDropdown options={SEMESTER_OPTIONS} value={semester} onChange={setSemester} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Hình thức thi</label>
                  <CustomDropdown options={ROOM_TYPE_OPTIONS} value={roomType} onChange={handleRoomTypeChange} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">
                    <span className="inline-flex items-center gap-1.5">Số lượt làm bài</span>
                  </label>
                  <CustomDropdown options={attemptOptions} value={maxAttempts} onChange={setMaxAttempts} className="w-full" />
                </div>
              </div>

              {/* Phòng thi: bắt buộc chỉ định phòng cụ thể khi thi tại phòng máy */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-2">Phòng thi</label>
                {roomType === 'ONLINE' ? (
                  <p className="text-[11px] text-[#475569] px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px]">
                    Thí sinh làm bài trực tuyến trên thiết bị cá nhân (phòng{' '}
                    <span className="font-semibold">ONLINE</span>).
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {labRoomOptions.map((room) => {
                        const isSelected = rooms.includes(room.id);
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleToggleRoom(room.id)}
                            className={`px-3.5 py-2 text-[11px] font-semibold border rounded-[8px] transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-[#06B6D4] bg-[#E0F2FE]/60 text-[#0369A1]'
                                : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                            }`}
                          >
                            {room.name}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-2">
                      Đã chọn {resolvedRooms.length} phòng: {roomSummary || 'chưa chọn phòng nào'}
                    </p>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-semibold text-[#475569]">Quy chế & Hướng dẫn làm bài thi</label>
                </div>
                <textarea
                  rows={3}
                  value={rulesText}
                  onChange={(event) => setRulesText(event.target.value)}
                  className="w-full px-3.5 py-3 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] resize-y leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Thời gian bắt đầu mở đề</label>
                  <input
                    type="datetime-local"
                    required
                    value={openTime}
                    onChange={(event) => setOpenTime(event.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Thời gian khóa đề thi</label>
                  <input
                    type="datetime-local"
                    required
                    value={closeTime}
                    onChange={(event) => setCloseTime(event.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">
                    <span className="inline-flex items-center gap-1.5">Thời lượng (phút)</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={durationMinutes}
                    onChange={(event) => setDurationMinutes(Number(event.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {isOfficialExam
                      ? 'Kỳ thi chính thức bắt buộc 1 lượt làm bài và luôn bật cảnh báo gian lận.'
                      : 'Bài điểm quá trình / Ôn tập cho phép không giới hạn lượt làm bài.'}
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Ma trận đề thi */}
            <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#0F172A]">2. Ma trận đề thi</h2>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-semibold text-[#475569]">
                    Đã chọn {questionCount} câu
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Xem trước câu đã chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MATRIX_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = matrixMode === mode.value;

                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setMatrixMode(mode.value)}
                      className={`flex items-start gap-3 p-4 border rounded-[16px] text-left transition-colors cursor-pointer ${
                        isActive ? 'border-[#06B6D4] bg-[#F0FDFA]' : 'border-[#E2E8F0] bg-white hover:border-[#06B6D4]'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 ${isActive ? 'bg-[#06B6D4] text-white' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-[#0F172A]">{mode.label}</span>
                        <span className="block text-[11px] text-[#94A3B8] mt-0.5">{mode.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {matrixMode === 'MANUAL' ? (
                <ExamMatrixManualPicker
                  chapters={chapters}
                  selectedQuestions={selectedQuestions}
                  onChange={setSelectedQuestions}
                  onPreviewQuestion={setPreviewQuestion}
                />
              ) : (
                <ExamMatrixAutoBuilder
                  totalQuestions={autoTotal}
                  ratio={autoRatio}
                  generatedQuestions={autoGenerated}
                  isGenerating={isGenerating}
                  onTotalChange={setAutoTotal}
                  onRatioChange={setAutoRatio}
                  onGenerate={handleGenerateMatrix}
                  onPreviewQuestion={setPreviewQuestion}
                  onRegenerateQuestion={handleRegenerateQuestion}
                />
              )}

              <div className="flex flex-wrap items-center gap-3 p-3.5 bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[12px]">
                <span className="text-[11px] font-semibold text-[#0369A1]">
                  Tiến độ: {questionCount} câu đã chọn
                </span>
                <span className="text-[11px] text-[#0369A1]">
                  Dễ {difficultyBreakdown.EASY} · Trung bình {difficultyBreakdown.MEDIUM} · Khó {difficultyBreakdown.HARD}
                </span>
                {selectedQuestions.length > 0 && matrixMode === 'MANUAL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedQuestions([])}
                    className="ml-auto text-[11px] font-semibold text-[#EF4444] hover:underline cursor-pointer"
                  >
                    Xóa câu đã chọn
                  </button>
                )}
              </div>
            </section>
{/* 3. Cài đặt bảo mật & cảnh báo gian lận */}
            <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0F172A]">3. Cài đặt bảo mật & cảnh báo gian lận</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-2">
                  Sinh thêm mã đề (số lượng mã đề cần sinh)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={MAX_TEST_CODES}
                    value={testCodeCount}
                    onChange={(event) =>
                      setTestCodeCount(Math.min(MAX_TEST_CODES, Math.max(1, Number(event.target.value) || 1)))
                    }
                    className="w-32 px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                  />
                  <span className="text-[11px] text-[#94A3B8]">
                    Mã đề 001 … {String(testCodeCount).padStart(3, '0')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {SECURITY_SETTINGS.map((setting) => {
                  const isForced = setting.key === 'antiCheat' && isOfficialExam;
                  return (
                    <ToggleSwitch
                      key={setting.key}
                      label={isForced ? `${setting.label} (bắt buộc với Giữa kỳ/Cuối kỳ)` : setting.label}
                      hint={setting.hint}
                      checked={settings[setting.key]}
                      onChange={() => handleToggleSetting(setting.key)}
                      disabled={isForced}
                    />
                  );
                })}
              </div>

              {!isReadOnly && (
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/teacher/exams')}
                    className="px-5 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#06B6D4] bg-white text-[#0891B2] text-xs font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu bản nháp
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Lưu & Xuất bản đề thi
                  </button>
                </div>
              )}
            </section>
            </fieldset>
          </form>
        </main>
      </div>

      {/* Modal M.12 Đánh giá tiến độ & xem trước câu đã chọn */}
      <ReviewSelectedQuestionsModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        selectedQuestions={matrixMode === 'MANUAL' ? selectedQuestions : autoGenerated}
        totalTarget={autoTotal}
        onRemoveQuestion={handleRemoveSelected}
        onPreviewQuestion={setPreviewQuestion}
      />

      {/* Modal M.07 Xem chi tiết câu hỏi */}
      <QuestionPreviewModal
        isOpen={Boolean(previewQuestion)}
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        onEdit={(question) => navigate(`/teacher/questions/add?edit=${question.id}`)}
      />
    </div>
  );
}

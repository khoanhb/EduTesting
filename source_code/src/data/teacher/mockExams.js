/**
 * src/data/teacher/mockExams.js
 *
 * Quản lý đề thi & kỳ thi là nguồn dữ liệu dùng chung cho:
 *   - Quản lý đề thi (2.4), Tạo đề thi & ma trận (2.5)
 *   - Thống kê & Phân tích (2.6), Chấm tự luận (2.8)
 *   - Dashboard Giảng viên (2.0) và Bàn giám sát gian lận (2.7)
 *   - Dashboard Quản trị viên (4.0) lượt thi theo tháng / theo Bộ môn
 *
 * Trạng thái theo FR-07.1:
 *   DRAFT            Bản nháp (chưa xuất bản)
 *   UPCOMING         Sắp diễn ra (đã xuất bản, chưa đến giờ mở)
 *   ONGOING          Đang diễn ra
 *   PENDING_GRADING  Chờ chấm tay (có câu tự luận chưa chấm xong)
 *   CLOSED           Đã kết thúc (đã chấm xong hoàn toàn)
 *
 * Mỗi đề thi mang đồng thời:
 *   - `openTime` / `closeTime` : chuỗi hiển thị 'dd/MM/yyyy HH:mm' (FR-07.1)
 *   - `openAt` / `closeAt`     : mốc ISO dùng để tổng hợp số liệu theo tháng/ngày
 *   - `rooms`                  : LUÔN là mảng phòng thi canonical (['LAB-01'] / ['ONLINE'])
 *   - `departmentId`           : quan hệ Bộ môn suy ra từ môn học (breakdown FR-02)
 *
 * Khi nối API: GET /exams | POST /exams | PATCH /exams/{id}/publish
 */

import { getQuestionsBySubject, mockQuestionBank } from './mockQuestions';
import { getSubjectById } from './mockSubjects';
import { getDepartmentName, mockTeachers } from '../shared/organization';
import { SEMESTER_IDS } from '../shared/semesters';

/** Nhãn hiển thị trạng thái đề thi (dùng cho bảng danh sách + bộ lọc). */
export const EXAM_STATUS_LABELS = {
  DRAFT: 'Bản nháp',
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  PENDING_GRADING: 'Chờ chấm tay',
  CLOSED: 'Đã kết thúc',
};

/** Badge color map tương ứng theo status. */
export const EXAM_STATUS_BADGES = {
  DRAFT: 'bg-[#F1F5F9] text-[#475569]',
  UPCOMING: 'bg-[#E0F2FE] text-[#0891B2]',
  ONGOING: 'bg-[#FEF3C7] text-[#D97706]',
  PENDING_GRADING: 'bg-[#FEF2F2] text-[#EF4444]',
  CLOSED: 'bg-[#ECFDF5] text-[#059669]',
};

/** Loại kỳ thi hợp lệ. */
export const EXAM_CATEGORIES = [
  { value: 'Giữa kỳ', label: 'Giữa kỳ' },
  { value: 'Cuối kỳ', label: 'Cuối kỳ' },
  { value: 'Quá trình', label: 'Điểm quá trình' },
  { value: 'Ôn tập', label: 'Ôn tập' },
];

/**
 * Các học kỳ có dữ liệu đề thi (dùng cho bộ lọc FR-07.1 / FR-09.1).
 * Học kỳ đang diễn ra được công bố duy nhất một lần ở `mockSubjects.js`
 * (`CURRENT_SEMESTER`) để tránh trùng tên export khi gom qua barrel.
 */
/**
 * Danh mục học kỳ dùng cho bộ lọc đề thi.
 * Lấy từ nguồn sự thật duy nhất `shared/semesters.js` để nhãn và thứ tự học kỳ
 * không lệch với Dashboard Quản trị viên hay Dashboard Giảng viên.
 */
export const EXAM_SEMESTERS = SEMESTER_IDS;

/**
 * Nguồn thô của đề thi. `rooms` ở đây đã là mảng phòng canonical; không tồn tại
 * giá trị dạng chuỗi 'LAB', hình thức phòng máy luôn được cụ thể hóa thành
 * LAB-01 … LAB-05, còn thi trực tuyến là ['ONLINE'].
 */
const rawExams = [
  {
    id: 'EX_3001',
    examCode: 'CSDL_GK_01',
    subjectCode: '502051',
    category: 'Giữa kỳ',
    semester: 'HK2/2025-2026',
    status: 'ONGOING',
    durationMinutes: 45,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    openTime: '13/05/2026 08:00',
    closeTime: '13/05/2026 11:30',
    openAt: '2026-05-13T08:00',
    closeAt: '2026-05-13T11:30',
    rooms: ['LAB-04', 'LAB-05'],
    roomCapacity: { 'LAB-04': 45, 'LAB-05': 45 },
    candidateCount: 82,
    submittedCount: 61,
    avgScore: 6.8,
    passRate: 72,
    testCodeCount: 4,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982', 'GV2026_1692'],
    createdBy: 'GV2026_0982',
    createdAt: '05/05/2026',
  },
  {
    id: 'EX_3002',
    examCode: 'CSDL_ONTAP_C3',
    subjectCode: '502051',
    category: 'Ôn tập',
    semester: 'HK2/2025-2026',
    status: 'ONGOING',
    durationMinutes: 45,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '13/05/2026 08:00',
    closeTime: '18/05/2026 11:30',
    openAt: '2026-05-13T08:00',
    closeAt: '2026-05-18T11:30',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 150 },
    candidateCount: 140,
    submittedCount: 96,
    avgScore: 7.4,
    passRate: 81,
    testCodeCount: 6,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '04/05/2026',
  },
  {
    id: 'EX_3003',
    examCode: 'TCMT_QT02_01',
    subjectCode: '501042',
    category: 'Quá trình',
    semester: 'HK2/2025-2026',
    // UPCOMING: đã xuất bản, chưa đến giờ mở (FR-07.1 - icon bút + thùng rác)
    status: 'UPCOMING',
    durationMinutes: 60,
    questionsCount: 50,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    openTime: '20/05/2026 14:00',
    closeTime: '20/05/2026 15:30',
    openAt: '2026-05-20T14:00',
    closeAt: '2026-05-20T15:30',
    rooms: ['LAB-01', 'LAB-02'],
    roomCapacity: { 'LAB-01': 50, 'LAB-02': 45 },
    candidateCount: 95,
    submittedCount: 0,
    avgScore: null,
    passRate: null,
    testCodeCount: 4,
    shuffleQuestions: true,
    shuffleAnswers: false,
    antiCheat: true,
    showScoreImmediately: false,
    allowReview: false,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '12/05/2026',
  },
  {
    id: 'EX_3004',
    examCode: 'LTW_GK_01',
    subjectCode: '503120',
    category: 'Giữa kỳ',
    semester: 'HK2/2025-2026',
    status: 'CLOSED',
    durationMinutes: 60,
    questionsCount: 30,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'AUTO',
    openTime: '06/05/2026 09:00',
    closeTime: '06/05/2026 10:00',
    openAt: '2026-05-06T09:00',
    closeAt: '2026-05-06T10:00',
    rooms: ['LAB-03'],
    roomCapacity: { 'LAB-03': 45 },
    candidateCount: 68,
    submittedCount: 68,
    avgScore: 7.1,
    passRate: 78,
    testCodeCount: 3,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_1692'],
    createdBy: 'GV2026_1692',
    createdAt: '28/04/2026',
  },
  {
    id: 'EX_3005',
    examCode: 'ATTT_CK_02',
    subjectCode: '504210',
    category: 'Cuối kỳ',
    // Tháng 6/2026 nằm trong khung HK3 (hè) T5 đến T8/2026, không thuộc HK2.
    semester: 'HK3/2025-2026',
    status: 'DRAFT',
    durationMinutes: 75,
    questionsCount: 50,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    openTime: '05/06/2026 08:00',
    closeTime: '05/06/2026 09:15',
    openAt: '2026-06-05T08:00',
    closeAt: '2026-06-05T09:15',
    rooms: [],
    roomCapacity: {},
    candidateCount: 120,
    submittedCount: 0,
    avgScore: null,
    passRate: null,
    testCodeCount: 0,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: false,
    allowReview: true,
    proctors: [],
    createdBy: 'GV2026_0871',
    createdAt: '22/05/2026',
  },
  {
    id: 'EX_3006',
    examCode: 'AI_QT01_01',
    subjectCode: '500510',
    category: 'Quá trình',
    semester: 'HK2/2025-2026',
    status: 'CLOSED',
    durationMinutes: 45,
    questionsCount: 30,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '28/04/2026 13:00',
    closeTime: '02/05/2026 17:00',
    openAt: '2026-04-28T13:00',
    closeAt: '2026-05-02T17:00',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 120 },
    candidateCount: 110,
    submittedCount: 104,
    avgScore: 6.2,
    passRate: 64,
    testCodeCount: 5,
    shuffleQuestions: false,
    shuffleAnswers: true,
    antiCheat: false,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '20/04/2026',
  },
  {
    id: 'EX_3007',
    examCode: 'LTW_CK_01',
    subjectCode: '503120',
    category: 'Ôn tập',
    semester: 'HK2/2025-2026',
    // PENDING_GRADING: đã kết thúc, còn câu tự luận ngắn chưa chấm tay xong
    status: 'PENDING_GRADING',
    durationMinutes: 45,
    questionsCount: 35,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '10/05/2026 00:01',
    closeTime: '12/05/2026 23:59',
    openAt: '2026-05-10T00:01',
    closeAt: '2026-05-12T23:59',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 80 },
    candidateCount: 72,
    submittedCount: 69,
    avgScore: null,
    passRate: null,
    testCodeCount: 3,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: false,
    showScoreImmediately: false,
    allowReview: false,
    proctors: ['GV2026_1692'],
    createdBy: 'GV2026_1692',
    createdAt: '05/05/2026',
  },
  {
    // Đề thi thuộc HỌC KỲ TRƯỚC : kiểm chứng bộ lọc Học kỳ ở FR-07.1 & FR-09.1
    // và là mốc so sánh "so với kỳ trước" của Dashboard Giảng viên.
    id: 'EX_3008',
    examCode: 'CSDL_CK_HK1',
    subjectCode: '502051',
    category: 'Cuối kỳ',
    semester: 'HK1/2025-2026',
    status: 'CLOSED',
    durationMinutes: 90,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    // Tháng 10/2025 nằm trong khung HK1/2025-2026 (T8 đến T12/2025) nên đề thi này
    // khớp với học kỳ đã khai báo và rơi đúng vào trục tháng của HK1.
    openTime: '15/10/2025 08:00',
    closeTime: '15/10/2025 09:30',
    openAt: '2025-10-15T08:00',
    closeAt: '2025-10-15T09:30',
    rooms: ['LAB-01'],
    roomCapacity: { 'LAB-01': 90 },
    candidateCount: 88,
    submittedCount: 88,
    avgScore: 6.4,
    passRate: 68,
    testCodeCount: 4,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '25/09/2025',
  },
  {
    id: 'EX_3011',
    examCode: 'CSDL_ONTAP_C9',
    subjectCode: '502051',
    category: 'Giữa kỳ',
    semester: 'HK2/2025-2026',
    status: 'CLOSED',
    durationMinutes: 45,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '08/05/2026 08:00',
    closeTime: '08/05/2026 11:30',
    openAt: '2026-05-08T08:00',
    closeAt: '2026-05-08T11:30',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 150 },
    candidateCount: 140,
    submittedCount: 118,
    avgScore: 7.0,
    passRate: 76,
    testCodeCount: 6,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '02/05/2026',
  },
  {
    id: 'EX_3009',
    examCode: 'CSDL_ONTAP_C10',
    subjectCode: '502051',
    category: 'Ôn tập',
    semester: 'HK2/2025-2026',
    status: 'ONGOING',
    durationMinutes: 45,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '13/05/2026 08:00',
    closeTime: '18/05/2026 11:30',
    openAt: '2026-05-13T08:00',
    closeAt: '2026-05-18T11:30',
    rooms: ['LAB-04'],
    roomCapacity: { 'LAB-04': 45 },
    candidateCount: 45,
    submittedCount: 12,
    avgScore: null,
    passRate: null,
    testCodeCount: 3,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '06/05/2026',
  },
  {
    id: 'EX_3010',
    examCode: 'TCMT_QT01_01',
    subjectCode: '501042',
    category: 'Quá trình',
    semester: 'HK2/2025-2026',
    status: 'UPCOMING',
    durationMinutes: 60,
    questionsCount: 50,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    openTime: '13/05/2026 14:00',
    closeTime: '13/05/2026 15:30',
    openAt: '2026-05-13T14:00',
    closeAt: '2026-05-13T15:30',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 100 },
    candidateCount: 95,
    submittedCount: 0,
    avgScore: null,
    passRate: null,
    testCodeCount: 2,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: false,
    allowReview: false,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '06/05/2026',
  },
  // Hai đề đã có lịch sử của sinh viên mặc định; thống kê chỉ phản ánh mẫu này.
  {
    id: 'EX_3012',
    examCode: 'CSDL_QT02_01',
    subjectCode: '502051',
    category: 'Quá trình',
    semester: 'HK2/2025-2026',
    status: 'CLOSED',
    durationMinutes: 60,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 1,
    matrixMode: 'MANUAL',
    openTime: '09/05/2026 11:45',
    closeTime: '09/05/2026 12:45',
    openAt: '2026-05-09T11:45',
    closeAt: '2026-05-09T12:45',
    rooms: ['LAB-04'],
    roomCapacity: { 'LAB-04': 45 },
    candidateCount: 1,
    submittedCount: 1,
    avgScore: 9.5,
    passRate: 100,
    testCodeCount: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: true,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '08/05/2026',
  },
  {
    id: 'EX_3013',
    examCode: 'CSDL_ONTAP_C6',
    subjectCode: '502051',
    category: 'Ôn tập',
    semester: 'HK1/2025-2026',
    status: 'CLOSED',
    durationMinutes: 45,
    questionsCount: 40,
    totalPoints: 10,
    maxAttempts: 3,
    matrixMode: 'AUTO',
    openTime: '07/12/2025 22:25',
    closeTime: '08/12/2025 01:00',
    openAt: '2025-12-07T22:25',
    closeAt: '2025-12-08T01:00',
    rooms: ['ONLINE'],
    roomCapacity: { ONLINE: 150 },
    candidateCount: 1,
    submittedCount: 1,
    avgScore: 9.0,
    passRate: 100,
    testCodeCount: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    antiCheat: true,
    showScoreImmediately: true,
    allowReview: false,
    proctors: ['GV2026_0982'],
    createdBy: 'GV2026_0982',
    createdAt: '06/12/2025',
  },
];

/**
 * Dựng danh sách câu hỏi thực tế có trong đề thi (Modal xem trước ở màn hình 2.4).
 * Khi nối API: GET /exams/{id}/questions
 */
function buildExamQuestions(exam) {
  const subjectPool = getQuestionsBySubject(exam.subjectCode);
  const pool = subjectPool.length > 0 ? subjectPool : mockQuestionBank;
  const total = Number(exam.questionsCount) || 0;
  if (total === 0 || pool.length === 0) return [];

  return Array.from({ length: Math.min(total, pool.length) }, (_, index) => {
    const question = pool[index % pool.length];
    return {
      questionCode: question.questionCode,
      content: question.content,
      type: question.type,
      difficulty: question.difficulty,
      chapterName: question.chapterName,
    };
  });
}

/**
 * Bổ sung quan hệ suy ra cho mỗi đề thi:
 *   - subjectName / departmentId / departmentName : từ môn học canonical
 *   - proctorNames : tên giám thị hiển thị (không hiển thị mã kỹ thuật cho người dùng)
 *   - questions    : danh sách câu hỏi xem trước
 * KHÔNG tự sinh `examCode` mới ở tầng trang.
 */
const decorateExam = (exam) => {
  const subject = getSubjectById(exam.subjectCode);

  return {
    ...exam,
    subjectName: subject?.name ?? exam.subjectCode,
    departmentId: subject?.departmentId ?? null,
    departmentName: subject ? getDepartmentName(subject.departmentId) : '',
    proctorNames: exam.proctors.map((teacherId) => {
      const teacher = mockTeachers.find((item) => item.teacherId === teacherId);
      return teacher ? `${teacher.degree} ${teacher.name}` : teacherId;
    }),
    questions: buildExamQuestions(exam),
  };
};

/** Danh sách đề thi canonical đã gắn quan hệ môn học / bộ môn / giảng viên. */
export const mockExams = rawExams.map(decorateExam);

/** Số lượt làm bài hợp lệ (FR-07.2). Giá trị 0 = không giới hạn. */
export const ALLOWED_ATTEMPT_OPTIONS = [
  { value: 1, label: '1 lượt' },
  { value: 2, label: '2 lượt' },
  { value: 3, label: '3 lượt' },
  { value: 0, label: 'Không giới hạn' },
];

/** Nhãn hiển thị số lượt làm bài của một đề thi. */
export function formatAttemptsLabel(maxAttempts) {
  if (maxAttempts === 0) return 'Không giới hạn';
  return maxAttempts === 1 ? '1 lượt' : `Tối đa ${maxAttempts} lượt`;
}

/* ================================ TRA CỨU ================================= */

/** Tra cứu đề thi theo id hoặc mã kỳ thi. */
export const getExamById = (key) =>
  mockExams.find((exam) => exam.id === key || exam.examCode === key) || null;

/** Đề thi theo học kỳ (bỏ qua học kỳ nếu `semester` là 'ALL'). */
export const getExamsBySemester = (semester) =>
  !semester || semester === 'ALL'
    ? mockExams
    : mockExams.filter((exam) => exam.semester === semester);

/** Đề thi thuộc phạm vi phân công của một giảng viên (giám thị hoặc người tạo). */
export const getExamsByTeacher = (teacherId) =>
  mockExams.filter(
    (exam) => exam.proctors.includes(teacherId) || exam.createdBy === teacherId
  );

/** Đề thi đang mở phòng thi (FR-02.2 / FR-10). */
/**
 * "Bây giờ" của bộ dữ liệu mẫu.
 *
 * Khối "Phòng thi đang diễn ra" phải phản ánh THỜI ĐIỂM HIỆN TẠI chứ không phải
 * học kỳ đang chọn. Vì dữ liệu mẫu là một ảnh chụp tại một ca thi cụ thể (tháng
 * 5/2026) còn đồng hồ máy có thể đang ở thời điểm khác, mốc tham chiếu được neo
 * vào chính ca thi đang mở của dữ liệu: lấy thời điểm mở muộn nhất trong các đề
 * đang diễn ra. Khi nối Backend thật, chỉ cần đổi mặc định của `getLiveExamsAt`
 * về `new Date()`.
 */
export const DEMO_REFERENCE_NOW = (() => {
  const openTimes = mockExams
    .filter((exam) => exam.status === 'ONGOING' && exam.openAt)
    .map((exam) => new Date(exam.openAt).getTime())
    .filter((value) => !Number.isNaN(value));

  return openTimes.length > 0 ? new Date(Math.max(...openTimes)) : new Date();
})();

/** Đề thi đang thực sự diễn ra tại một thời điểm (dựa trên khung mở/đóng đề). */
export function getLiveExamsAt(referenceDate = DEMO_REFERENCE_NOW) {
  const at =
    referenceDate instanceof Date ? referenceDate.getTime() : new Date(referenceDate).getTime();
  if (Number.isNaN(at)) return [];

  return mockExams.filter((exam) => {
    const open = exam.openAt ? new Date(exam.openAt).getTime() : Number.NaN;
    const close = exam.closeAt ? new Date(exam.closeAt).getTime() : Number.NaN;

    return !Number.isNaN(open) && !Number.isNaN(close) && at >= open && at <= close;
  });
}

/** Đề thi đang diễn ra ngay lúc này (theo mốc tham chiếu của hệ thống). */
export const getOngoingExams = () => {
  const liveExams = getLiveExamsAt(DEMO_REFERENCE_NOW);
  if (liveExams.length > 0) return liveExams;

  // Đích lùi: nếu bộ dữ liệu mẫu không có đề nào phủ mốc tham chiếu thì vẫn dùng
  // đúng những đề được đánh dấu đang diễn ra để màn hình giám sát không trắng.
  return mockExams.filter((exam) => exam.status === 'ONGOING');
};

/** Đề thi đã có kết quả để thống kê (FR-09). */
export const getAnalyzableExams = () => mockExams.filter((exam) => exam.avgScore !== null);

/**
 * Khóa tháng của một đề thi theo mốc mở đề, dạng 'yyyy-MM'.
 * Dùng để tổng hợp "lượt thi toàn khoa theo tháng" ở Dashboard Quản trị viên.
 */
export const getExamMonthKey = (exam) => (exam.openAt ? exam.openAt.slice(0, 7) : null);

/** Nhãn tháng hiển thị tiếng Việt: '2026-05' đến 'T5/2026'. */
export const getMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return `T${Number(month)}/${year}`;
};

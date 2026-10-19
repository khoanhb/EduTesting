/**
 * src/data/student/mockStudentExams.js
 *
 * Danh sách ca thi của Sinh viên (màn hình 3.0 StudentExamsPage).
 *
 * Status hợp lệ: 'ACTIVE' | 'UPCOMING'
 * Khi nối API: thay bằng GET /student/exams
 */
import { getExamById } from '../teacher/mockExams';

export const mockStudentExams = [
  {
    id: 'CSDL_ONTAP_C3',
    examCode: 'CSDL_ONTAP_C3',
    testCode: '001',
    subjectCode: '502051',
    subjectName: 'Hệ cơ sở dữ liệu - Ôn tập',
    semester: 'HK2/2025-2026',
    room: 'ONLINE',
    type: 'ONLINE',
    questionsCount: 40,
    durationMinutes: 45,
    openTime: '08:00 - 11:30 | 13/05/2026 - 18/05/2026',
    status: 'ACTIVE',
    currentAttempt: 1,
    maxAttempts: 3,
    scale: 10,
    config: {
      showScoreImmediately: true,
      allowReview: true,
    },
    lastResult: {
      score: 8.5,
      correctCount: 34,
      wrongCount: 4,
      unansweredCount: 2,
      durationSpent: '38:25',
      submittedAt: '09:45:20 - 13/05/2026',
      isSuspended: false,
    },
  },
  {
    id: 'CSDL_ONTAP_C10',
    examCode: 'CSDL_ONTAP_C10',
    testCode: '001',
    subjectCode: '502051',
    subjectName: 'Hệ cơ sở dữ liệu - Ôn tập',
    semester: 'HK2/2025-2026',
    room: 'LAB-04',
    type: 'LAB',
    questionsCount: 40,
    durationMinutes: 45,
    openTime: '08:00 - 11:30 | 13/05/2026 - 18/05/2026',
    status: 'ACTIVE',
    currentAttempt: 1,
    maxAttempts: 3,
    scale: 10,
    config: {
      showScoreImmediately: true,
      allowReview: true,
    },
    lastResult: {
      score: 8.5,
      correctCount: 34,
      wrongCount: 4,
      unansweredCount: 2,
      durationSpent: '38:25',
      submittedAt: '09:45:20 - 13/05/2026',
      isSuspended: true,
      suspendReason: 'Đình chỉ - Trừ 50% số điểm bài thi',
    },
  },
  {
    id: 'TCMT_QT02_01',
    examCode: 'TCMT_QT02_01',
    testCode: '002',
    subjectCode: '501042',
    subjectName: 'Tổ chức máy tính - Quá trình 2',
    semester: 'HK2/2025-2026',
    room: 'LAB-01',
    type: 'LAB',
    questionsCount: 50,
    durationMinutes: 60,
    openTime: '14:00 - 15:30 | 20/05/2026',
    status: 'UPCOMING',
    currentAttempt: 1,
    maxAttempts: 1,
    scale: 10,
    config: {
      showScoreImmediately: false,
      allowReview: false,
    },
  },
  {
    id: 'TCMT_QT01_01',
    examCode: 'TCMT_QT01_01',
    testCode: '001',
    subjectCode: '501042',
    subjectName: 'Tổ chức máy tính - Quá trình 1',
    semester: 'HK2/2025-2026',
    room: 'ONLINE',
    type: 'ONLINE',
    questionsCount: 50,
    durationMinutes: 60,
    openTime: '14:00 - 15:30 | 13/05/2026',
    status: 'UPCOMING',
    currentAttempt: 1,
    maxAttempts: 1,
    scale: 10,
    config: {
      showScoreImmediately: false,
      allowReview: false,
    },
  },
];

export function advanceStudentExamAttempt(id) {
  const index = mockStudentExams.findIndex((exam) => exam.id === id);
  if (index < 0) return false;
  const exam = mockStudentExams[index];
  if (!canRetakeStudentExam(exam)) return false;
  const currentAttempt = exam.currentAttempt ?? 1;
  mockStudentExams[index] = { ...exam, currentAttempt: currentAttempt + 1, lastResult: null };
  return true;
}

export function getStudentExamConfig(exam) {
  const canonical = getExamById(exam.examCode);
  return {
    ...exam.config,
    showScoreImmediately: canonical?.showScoreImmediately ?? exam.config?.showScoreImmediately ?? false,
    allowReview: canonical?.allowReview ?? exam.config?.allowReview ?? false,
    antiCheat: canonical?.antiCheat ?? exam.config?.antiCheat ?? true,
  };
}

// currentAttempt là số thứ tự lượt hiện tại (bắt đầu từ 1); 0 lượt tối đa = không giới hạn.
export function canEnterStudentExam(exam) {
  if (!exam || exam.status !== 'ACTIVE') return false;
  const attempt = exam.currentAttempt ?? 1;
  const maximum = exam.maxAttempts ?? 1;
  return Number.isInteger(attempt) && attempt >= 1
    && Number.isInteger(maximum) && (maximum === 0 || attempt <= maximum);
}

export function getStudentExamResult(exam) {
  return exam?.lastResult ?? null;
}
// Chỉ bắt đầu lượt kế tiếp khi lượt hiện tại đã có kết quả và đề còn được mở.
export function canRetakeStudentExam(exam) {
  if (!canEnterStudentExam(exam) || !getStudentExamResult(exam)) return false;
  return exam.maxAttempts === 0 || (exam.currentAttempt ?? 1) < (exam.maxAttempts ?? 1);
}

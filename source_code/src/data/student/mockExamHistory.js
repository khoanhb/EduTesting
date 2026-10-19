/**
 * src/data/student/mockExamHistory.js
 *
 * Lịch sử bài thi của Sinh viên (màn hình 3.5 ExamHistoryPage).
 * Bao gồm các lượt thi, điểm số và biên bản vi phạm nếu có.
 *
 * Khi nối API: thay bằng GET /student/exam-history
 */
import { getExamById } from '../teacher/mockExams';

export function getHistoryExamConfig(exam) {
  const canonical = getExamById(exam.examCode);
  return {
    showScoreImmediately: canonical?.showScoreImmediately ?? exam.config?.showScoreImmediately ?? false,
    allowReview: canonical?.allowReview ?? exam.config?.allowReview ?? exam.canReview ?? false,
  };
}

export const mockHistoryExams = [
  {
    id: 'CSDL_ONTAP_C9',
    category: 'Giữa kỳ',
    examCode: 'CSDL_ONTAP_C9',
    subjectCode: '502051',
    subjectName: 'Hệ cơ sở dữ liệu - Ôn tập',
    semester: 'HK2/2025-2026',
    room: 'ONLINE',
    questionsCount: 40,
    durationMinutes: 45,
    submittedAt: '11:26 08/05/2026',
    attempt: '2/3',
    maxAttempts: 3,
    score: 9.0,
    scale: 10,
    status: 'Hoàn thành',
    canReview: true,
    scorePublished: true,
    attemptsList: [
      {
        attemptNumber: '1/3',
        examCode: 'CSDL_ONTAP_C9',
        subjectName: 'Hệ cơ sở dữ liệu',
        submittedAt: '10:16 08/05/2026',
        score: 4.25,
        status: 'Đình chỉ',
        isSuspended: true,
        report: {
          studentName: 'Nguyễn Văn A',
          studentId: '52000000',
          examCode: 'CSDL_ONTAP_C9',
          testCode: '001',
          room: 'ONLINE',
          behavior:
            'Chuyển tab / Thoát toàn màn hình (3/3 lần) - Hệ thống đã khóa bài thi lúc 10:16:45',
          penalty: 'Trừ 50% số điểm bài thi',
          detail:
            'Thí sinh cố ý thu nhỏ màn hình trình duyệt để mở tài liệu, đã nhắc nhở trực tiếp tại phòng thi nhưng tái phạm.',
        },
      },
      {
        attemptNumber: '2/3',
        examCode: 'CSDL_ONTAP_C9',
        subjectName: 'Hệ cơ sở dữ liệu',
        submittedAt: '11:26 08/05/2026',
        score: 9.0,
        status: 'Hoàn thành',
        isSuspended: false,
      },
    ],
  },
  {
    id: 'CSDL_QT02_01',
    category: 'Quá trình',
    examCode: 'CSDL_QT02_01',
    /**
     * Mã môn canonical của "Hệ cơ sở dữ liệu" (xem mockSubjects.js).
     * Trước đây trường này ghi 501042 - mã của môn "Tổ chức máy tính", nên đề
     * thi CSDL lại trỏ sang một môn khác bộ môn.
     */
    subjectCode: '502051',
    subjectName: 'Hệ cơ sở dữ liệu - Quá trình 2',
    semester: 'HK2/2025-2026',
    room: 'LAB-04',
    questionsCount: 40,
    durationMinutes: 60,
    submittedAt: '12:45 09/05/2026',
    attempt: '1/1',
    maxAttempts: 1,
    score: 9.5,
    scale: 10,
    status: 'Hoàn thành',
    canReview: true,
    scorePublished: true,
    attemptsList: [
      {
        attemptNumber: '1/1',
        examCode: 'CSDL_QT02_01',
        subjectName: 'Hệ cơ sở dữ liệu',
        submittedAt: '12:45 09/05/2026',
        score: 9.5,
        status: 'Hoàn thành',
        isSuspended: false,
      },
    ],
  },
  {
    id: 'CSDL_ONTAP_C6',
    category: 'Ôn tập',
    examCode: 'CSDL_ONTAP_C6',
    /** 503022 không tồn tại trong danh mục môn học; mã đúng của CSDL là 502051. */
    subjectCode: '502051',
    subjectName: 'Hệ cơ sở dữ liệu',
    semester: 'HK1/2025-2026',
    room: 'ONLINE',
    questionsCount: 40,
    durationMinutes: 45,
    submittedAt: '00:41 08/12/2025',
    attempt: '2/3',
    maxAttempts: 3,
    score: 9.0,
    scale: 10,
    status: 'Hoàn thành',
    canReview: false,
    scorePublished: true,
    attemptsList: [
      {
        attemptNumber: '1/3',
        examCode: 'CSDL_ONTAP_C6',
        subjectName: 'Hệ cơ sở dữ liệu',
        submittedAt: '23:10 07/12/2025',
        score: 6.5,
        status: 'Hoàn thành',
        isSuspended: false,
      },
      {
        attemptNumber: '2/3',
        examCode: 'CSDL_ONTAP_C6',
        subjectName: 'Hệ cơ sở dữ liệu',
        submittedAt: '00:41 08/12/2025',
        score: 9.0,
        status: 'Hoàn thành',
        isSuspended: false,
      },
    ],
  },
];

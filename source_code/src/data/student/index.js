/**
 * src/data/student/index.js
 *
 * Barrel export tập trung mock data phân hệ Sinh viên (Giai đoạn 2).
 *
 * Quy ước: các trang Sinh viên import từ đây, ví dụ:
 *   import { mockStudentExams, mockQuestionsData } from '../../data/student';
 *
 * Hồ sơ sinh viên đang đăng nhập nằm ở src/data/shared/authAccounts.js.
 */

/* Danh sách ca thi được giao (màn hình 3.0) */
export * from './mockStudentExams';

/* Bộ câu hỏi phòng thi + đáp án làm bài (màn hình 3.2) */
export * from './mockExamRoom';

/* Lịch sử lượt thi & biên bản vi phạm (màn hình 3.5) */
export * from './mockExamHistory';

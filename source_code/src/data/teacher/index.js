/**
 * src/data/teacher/index.js
 *
 * Barrel export mock data phân hệ Giảng viên (Giai đoạn 3).
 *
 * Quy ước: mọi trang/component thuộc phân hệ Giảng viên import từ đây,
 * ví dụ: `import { mockQuestions, mockSubjects } from '../../data/teacher';`
 *
 * Toàn bộ shape dữ liệu ở đây đã được đối chiếu với
 * docs/functional-requirements.md (FR-05 -> FR-10) và design/screen-list.md,
 * đồng thời dùng chung nguồn cơ cấu tổ chức tại src/data/shared/organization.js.
 */

/* Hồ sơ giảng viên đang đăng nhập + phạm vi phân công môn học */
export * from './mockTeacherUser';

/* Danh mục Khoa / Bộ môn / môn học / chương kiến thức */
export * from './mockSubjects';

/* Ngân hàng câu hỏi + cấu hình và kết quả sinh câu hỏi AI */
export * from './mockQuestions';

/* Quản lý đề thi & kỳ thi (5 trạng thái theo FR-07.1) */
export * from './mockExams';

/* Phòng thi trực tiếp + nhật ký vi phạm gian lận */
export * from './mockAntiCheat';

/* Chấm tự luận ngắn + thống kê phân tích chất lượng đề thi */
export * from './mockGrading';

/* Tổng quan dashboard giảng viên */
export * from './mockDashboard';

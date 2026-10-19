/**
 * src/data/admin/index.js
 *
 * Barrel export mock data phân hệ Quản trị viên (Giai đoạn 4).
 *
 * Toàn bộ dữ liệu dưới đây được SUY RA từ mô hình miền canonical
 * (src/data/shared/organization.js + src/data/teacher/*), nên không tồn tại
 * tập dữ liệu riêng nào khiến Dashboard, Quản lý người dùng và Quản lý môn học
 * hiển thị lệch nhau.
 *
 * Quy ước: các trang admin import từ đây, ví dụ:
 *   import { mockAdminSubjectList, mockTeachersList } from '../../data/admin';
 */

/* Dashboard Quản trị viên (4.0 - FR-02) */
export * from './mockAdminDashboard';

/* Quản lý người dùng & tài khoản (4.1 - FR-03) */
export * from './mockAdminUsers';

/* Quản lý môn học & chủ đề kiến thức (4.2 - FR-04) */
export * from './mockAdminSubjects';

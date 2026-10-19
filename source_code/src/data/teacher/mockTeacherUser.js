/**
 * src/data/teacher/mockTeacherUser.js
 *
 * Hồ sơ Giảng viên đang đăng nhập + phạm vi phân công môn học.
 *
 * Đây KHÔNG phải một tài khoản riêng của phân hệ Giảng viên: hồ sơ được suy ra
 * từ danh sách người dùng canonical (src/data/shared/organization.js), nên luôn
 * khớp với Quản lý người dùng (FR-03.1) và danh sách Giảng viên phụ trách môn
 * học (FR-04.5).
 *
 * `managedSubjects` là ràng buộc phân quyền dữ liệu của Teacher Dashboard,
 * Bàn giám sát gian lận và màn hình chấm bài tự luận (FR-02, FR-07, FR-10).
 *
 * Khi nối API: GET /users/profile (role = TEACHER)
 */

import {
  getDepartmentName,
  getTeacherByCode,
  getTeacherDisplayName,
} from '../shared/organization';
import { DEFAULT_TEACHER_ID, mockCurrentUser } from '../shared/authAccounts';

const teacher = getTeacherByCode(DEFAULT_TEACHER_ID);

export const mockTeacherUser = {
  id: teacher.teacherId,
  role: 'TEACHER',
  name: teacher.name,
  /** Tên hiển thị kèm học vị, ví dụ 'ThS. Nguyễn Văn B' (dùng cho Sidebar/Header). */
  displayName: getTeacherDisplayName(teacher.teacherId),
  title: teacher.degree,
  degree: teacher.academicTitle,
  position: teacher.academicTitle,
  email: teacher.email,
  phone: teacher.phone,
  facultyId: teacher.facultyId,
  faculty: mockCurrentUser.teacher.faculty,
  departmentId: teacher.departmentId,
  department: getDepartmentName(teacher.departmentId),
  avatar: mockCurrentUser.teacher.avatar,
  /** Phạm vi phân công: giáo viên này chỉ thấy dữ liệu của các môn dưới đây. */
  managedSubjects: teacher.managedSubjectCodes,
};

export { getTeacherDisplayName };

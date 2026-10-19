/**
 * src/data/shared/authAccounts.js
 *
 * Tài khoản đăng nhập mẫu & hồ sơ người dùng đang đăng nhập.
 *
 * Quy tắc nhận diện vai trò (context.md §3, docs/functional-requirements.md FR-01.1):
 *   - Mã số thuần số (52000000)       Sinh viên   /student/exams
 *   - Mã số bắt đầu bằng 'GV'         Giảng viên  /teacher/dashboard
 *   - Mã số bắt đầu bằng 'admin'      Quản trị    /admin/dashboard
 *
 * Ba hồ sơ dưới đây được SUY RA từ danh sách người dùng canonical
 * (src/data/shared/organization.js) nên luôn khớp với Quản lý người dùng,
 * Dashboard và Lớp điểm: không tồn tại tài khoản "chỉ để đăng nhập".
 *
 * Khi nối API: POST /auth/login  và  GET /users/profile
 */

import {
  FACULTY_CNTT,
  getDepartmentName,
  getStudentByCode,
  getTeacherByCode,
  mockDepartments,
  mockFaculties,
} from './organization';

/** Mã định danh tài khoản đăng nhập mặc định của từng vai trò. */
export const DEFAULT_STUDENT_ID = '52000000';
export const DEFAULT_TEACHER_ID = 'GV2026_0982';
export const DEFAULT_ADMIN_ID = 'admin';

/** Mật khẩu mặc định khi Admin đặt lại tài khoản: [Mã định danh]@123 (FR-03.3). */
export const DEFAULT_PASSWORD_SUFFIX = '@123';

export const buildDefaultPassword = (identifier) => `${identifier}${DEFAULT_PASSWORD_SUFFIX}`;

export const mockAuthAccounts = [
  {
    identifier: DEFAULT_STUDENT_ID,
    password: buildDefaultPassword(DEFAULT_STUDENT_ID),
    role: 'STUDENT',
    displayName: getStudentByCode(DEFAULT_STUDENT_ID)?.name ?? '',
    redirect: '/student/exams',
  },
  {
    identifier: DEFAULT_TEACHER_ID,
    password: buildDefaultPassword(DEFAULT_TEACHER_ID),
    role: 'TEACHER',
    displayName: getTeacherByCode(DEFAULT_TEACHER_ID)?.name ?? '',
    redirect: '/teacher/dashboard',
  },
  {
    identifier: DEFAULT_ADMIN_ID,
    password: buildDefaultPassword(DEFAULT_ADMIN_ID),
    role: 'ADMIN',
    displayName: 'Quản trị viên',
    redirect: '/admin/dashboard',
  },
];

/** Chính sách mật khẩu hiển thị ở các biểu mẫu đổi mật khẩu. */
export const mockPasswordPolicy = {
  minLength: 8,
  message: 'Mật khẩu gồm ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
};

/** Cấu hình khôi phục mật khẩu qua OTP (FR-01.2 - modal M.04). */
export const mockPasswordRecovery = {
  otpLength: 6,
  resendCooldownSeconds: 60,
  emailHint: 'e.g. 52000000@student.tdtu.edu.vn',
};

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

/** Hồ sơ Sinh viên đang đăng nhập (màn hình 1.2). */
function buildStudentProfile() {
  const student = getStudentByCode(DEFAULT_STUDENT_ID);

  return {
    id: student.studentId,
    role: 'STUDENT',
    title: 'Sinh viên chính quy',
    name: student.name,
    email: student.email,
    classId: student.classId,
    class: student.className,
    className: student.className,
    /**
     * `major` (Ngành học) và `department` (Bộ môn) là HAI NHÃN của CÙNG một đơn
     * vị trong `mockDepartments`. Hệ thống không còn khái niệm khóa học (cohort).
     */
    major: student.majorName,
    departmentId: student.departmentId,
    department: getDepartmentName(student.departmentId),
    facultyId: FACULTY_CNTT,
    faculty: mockFaculties[0].name,
    phone: '0901234567',
    avatar: DEFAULT_AVATAR,
  };
}

/** Hồ sơ Giảng viên đang đăng nhập (màn hình 1.1). */
function buildTeacherProfile() {
  const teacher = getTeacherByCode(DEFAULT_TEACHER_ID);

  return {
    id: teacher.teacherId,
    role: 'TEACHER',
    title: teacher.degree,
    degree: teacher.degree,
    academicTitle: teacher.academicTitle,
    position: teacher.academicTitle,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    departmentId: teacher.departmentId,
    department: getDepartmentName(teacher.departmentId),
    facultyId: teacher.facultyId,
    faculty: mockFaculties[0].name,
    managedSubjectCodes: teacher.managedSubjectCodes,
    avatar: DEFAULT_AVATAR,
  };
}

/** Hồ sơ Quản trị viên đang đăng nhập (FR-01.3: Admin không chỉnh sửa thông tin). */
function buildAdminProfile() {
  return {
    id: DEFAULT_ADMIN_ID,
    role: 'ADMIN',
    title: 'Quản trị hệ thống',
    name: 'Quản trị viên',
    email: 'admin@tdtu.edu.vn',
    facultyId: FACULTY_CNTT,
    faculty: mockFaculties[0].name,
    departmentIds: mockDepartments.map((department) => department.id),
    phone: '028 3775 5052',
    avatar: DEFAULT_AVATAR,
  };
}

/** Hồ sơ 3 vai trò đang đăng nhập (dùng cho LoginPage và các trang Profile). */
export const mockCurrentUser = {
  student: buildStudentProfile(),
  teacher: buildTeacherProfile(),
  admin: buildAdminProfile(),
};

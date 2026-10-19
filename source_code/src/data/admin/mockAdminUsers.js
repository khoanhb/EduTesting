/**
 * src/data/admin/mockAdminUsers.js
 *
 * Dữ liệu cho màn hình 4.1 Quản lý người dùng & tài khoản (FR-03).
 *
 * KHÔNG có danh sách tài khoản riêng cho phân hệ Quản trị: mọi bản ghi đều lấy
 * từ nguồn sự thật duy nhất `src/data/shared/organization.js`, nên cùng một
 * người dùng hiển thị nhất quán giữa Quản lý người dùng, Dashboard, lớp điểm,
 * giám thị phòng thi và biên bản vi phạm.
 *
 * Cấu trúc tổ chức hiện tại: 01 Khoa Công nghệ thông tin và 03 Bộ môn
 * (Công nghệ phần mềm, Khoa học máy tính, Mạng máy tính & truyền thông dữ liệu).
 *
 * NGÀNH HỌC = BỘ MÔN: với Sinh viên, đơn vị đó hiển thị là "Ngành học"; với
 * Giảng viên, cùng đơn vị đó hiển thị là "Bộ môn". Cả hai đều lọc trên cùng
 * khóa `departmentId`, nên chỉ có một danh mục và không thể lệch nhau.
 * Sinh viên còn được xác định bởi LỚP SINH HOẠT; hệ thống không dùng "khóa học".
 *
 * Khi nối API: GET /users?role=STUDENT|TEACHER
 */

import {
  getClassesByDepartment,
  getDepartmentName,
  getMajorName,
  mockClasses,
  mockDepartments,
  mockFaculties,
  mockMajors,
  mockStudents,
  mockTeachers,
} from '../shared/organization';

/* ============================ DANH MỤC TRA CỨU ============================ */

export const mockAdminFaculties = mockFaculties;
export const mockAdminDepartments = mockDepartments;
export const mockAdminClasses = mockClasses;

/**
 * Góc nhìn "Ngành học" của CÙNG danh mục đơn vị (xem `mockMajors` trong
 * organization.js). Giữ ở đây để các biểu mẫu của phân hệ Quản trị dùng chung
 * một nguồn, không tự khai báo lại danh sách ngành.
 */
export const mockAdminMajors = mockMajors;

/** Nhãn trạng thái tài khoản (FR-03.1: Hoạt động / Đang khóa). */
export const USER_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đang khóa',
};

/** Nhãn vai trò tài khoản. */
export const USER_ROLE_LABELS = {
  STUDENT: 'Sinh viên',
  TEACHER: 'Giảng viên',
};

/* ============================== SINH VIÊN ================================= */

/**
 * Danh sách tài khoản Sinh viên (tab "Sinh viên" của FR-03.1).
 * `major` là nhãn Ngành học của đơn vị mà lớp sinh hoạt trực thuộc, cùng một
 * đơn vị với `department` của Giảng viên.
 */
export const mockStudentsList = mockStudents.map((student) => ({
  id: student.id,
  role: 'STUDENT',
  studentId: student.studentId,
  name: student.name,
  email: student.email,
  classId: student.classId,
  class: student.className,
  majorId: student.departmentId,
  major: student.majorName,
  facultyId: student.facultyId,
  faculty: mockFaculties[0].name,
  departmentId: student.departmentId,
  department: getDepartmentName(student.departmentId),
  status: student.status,
}));

/* ============================== GIẢNG VIÊN ================================ */

/** Danh sách tài khoản Giảng viên (tab "Giảng viên" của FR-03.1). */
export const mockTeachersList = mockTeachers.map((teacher) => ({
  id: teacher.id,
  role: 'TEACHER',
  teacherId: teacher.teacherId,
  name: teacher.name,
  email: teacher.email,
  degree: teacher.degree,
  position: teacher.position,
  academicTitle: teacher.academicTitle,
  facultyId: teacher.facultyId,
  faculty: mockFaculties[0].name,
  departmentId: teacher.departmentId,
  department: getDepartmentName(teacher.departmentId),
  /** Phạm vi phân công: ràng buộc Phân quyền tại FR-03.4. */
  managedSubjectCodes: teacher.managedSubjectCodes,
  status: teacher.status,
}));

/* ================================ TRA CỨU ================================= */

/** Tra cứu một tài khoản bất kỳ theo id nội bộ. */
export const getAdminUserById = (id) =>
  [...mockStudentsList, ...mockTeachersList].find((user) => user.id === id) || null;

/** Phạm vi phân công của giảng viên, dạng danh sách mã môn để hiển thị. */
export const getTeacherScopeText = (teacher) =>
  teacher.managedSubjectCodes && teacher.managedSubjectCodes.length > 0
    ? teacher.managedSubjectCodes.join(', ')
    : 'Chưa phân công môn học';

/* ============================ BỘ LỌC DÙNG CHUNG ========================== */

/**
 * Giá trị đại diện cho "không lọc theo tiêu chí này".
 *
 * Đây là sentinel của giao diện, KHÔNG nằm trong danh mục dữ liệu thật: nhờ vậy
 * bảng lọc vẫn có lựa chọn "Tất cả" mà không phải chèn một bản ghi Bộ môn / Lớp
 * giả vào danh mục canonical.
 */
export const FILTER_ALL = 'ALL';

/**
 * Tuỳ chọn lọc theo BỘ MÔN (nhãn dành cho Giảng viên của `mockDepartments`).
 * Dùng chung danh mục với `buildMajorFilterOptions`, chỉ khác nhãn hiển thị.
 */
export const buildDepartmentFilterOptions = (allLabel = 'Tất cả bộ môn') => [
  { value: FILTER_ALL, label: allLabel },
  ...mockDepartments.map((department) => ({
    value: department.id,
    label: department.name,
  })),
];

/**
 * Tuỳ chọn lọc theo NGÀNH HỌC (nhãn dành cho Sinh viên của `mockDepartments`).
 * Giá trị là `departmentId`: cùng khóa với lọc Bộ môn của Giảng viên.
 */
export const buildMajorFilterOptions = (allLabel = 'Tất cả ngành học') => [
  { value: FILTER_ALL, label: allLabel },
  ...mockDepartments.map((department) => ({
    value: department.id,
    label: getMajorName(department.id),
  })),
];

/**
 * Tuỳ chọn lọc theo LỚP SINH HOẠT, PHỤ THUỘC vào Ngành học đang chọn: chỉ liệt
 * kê các lớp thuộc ngành đó. Khi ngành là "Tất cả" thì trả về toàn bộ lớp.
 */
export const buildClassFilterOptions = (departmentId = FILTER_ALL, allLabel = 'Tất cả lớp') => [
  { value: FILTER_ALL, label: allLabel },
  ...getClassesByDepartment(departmentId).map((classItem) => ({
    value: classItem.id,
    label: classItem.name,
  })),
];

/** Tuỳ chọn lọc theo trạng thái tài khoản (FR-03.1). */
export const USER_STATUS_FILTER_OPTIONS = [
  { value: FILTER_ALL, label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: USER_STATUS_LABELS.ACTIVE },
  { value: 'LOCKED', label: USER_STATUS_LABELS.LOCKED },
];

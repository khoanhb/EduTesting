/**
 * Nhận diện vai trò người dùng từ mã định danh theo quy tắc tại context.md §3.
 * Hệ thống chỉ có MỘT biểu mẫu đăng nhập (1.0_DangNhap) cho cả ba vai trò.
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};

/** Đường dẫn mặc định sau khi đăng nhập thành công, theo từng vai trò. */
export const ROLE_HOME_ROUTES = {
  [ROLES.STUDENT]: '/student/exams',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};

/** Nhãn hiển thị của vai trò, dùng cho gợi ý ngay dưới ô nhập mã định danh. */
export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Sinh viên',
  [ROLES.TEACHER]: 'Giảng viên',
  [ROLES.ADMIN]: 'Quản trị viên',
};

/**
 * Phân tích mã định danh:
 *  - Bắt đầu bằng 'admin'             Quản trị viên
 *  - Bắt đầu bằng 'GV' (không phân biệt hoa thường)  Giảng viên
 *  - Chỉ gồm chữ số                   Sinh viên
 *
 * @param {string} identifier
 * @returns {'STUDENT'|'TEACHER'|'ADMIN'|null} null khi không khớp quy tắc nào
 */
export function detectRole(identifier) {
  const value = (identifier || '').trim();
  if (!value) return null;

  if (value.toLowerCase().startsWith('admin')) return ROLES.ADMIN;
  if (value.toUpperCase().startsWith('GV')) return ROLES.TEACHER;
  if (/^\d+$/.test(value)) return ROLES.STUDENT;

  return null;
}

/**
 * Kiểm tra mật khẩu có đạt chính sách tối thiểu hay không:
 * ít nhất 8 ký tự, có chữ hoa, chữ thường và chữ số.
 *
 * @param {string} password
 * @returns {{ isValid: boolean, failures: string[] }}
 */
export function validatePasswordStrength(password) {
  const value = password || '';
  const failures = [];

  if (value.length < 8) failures.push('Tối thiểu 8 ký tự');
  if (!/[A-Z]/.test(value)) failures.push('Có ít nhất 1 chữ hoa');
  if (!/[a-z]/.test(value)) failures.push('Có ít nhất 1 chữ thường');
  if (!/\d/.test(value)) failures.push('Có ít nhất 1 chữ số');

  return { isValid: failures.length === 0, failures };
}

/**
 * src/data/teacher/mockSubjects.js
 *
 * Danh mục môn học & cấu trúc chương kiến thức dùng chung cho:
 *   - Ngân hàng câu hỏi / Ma trận đề thi (Giai đoạn 3)
 *   - Quản lý môn học của Quản trị viên (FR-04 - màn hình 4.2)
 *   - Bộ lọc môn học trên Dashboard / Thống kê / Lớp điểm
 *
 * Khoa và Bộ môn KHÔNG được khai báo lại ở đây mà lấy từ nguồn sự thật duy nhất
 * `src/data/shared/organization.js` (1 Khoa CNTT + 3 Bộ môn theo FR-03.1/FR-04.2).
 *
 * Khi nối API: GET /admin/subjects (dành cho GV được phân công)
 */

import {
  FACULTY_CNTT,
  getDepartmentById,
  getFacultyById,
  mockFaculties,
  mockTeachers,
  DEPARTMENT_CNPM,
  DEPARTMENT_KHMT,
  DEPARTMENT_MMT,
} from '../shared/organization';
import { CURRENT_SEMESTER as SHARED_CURRENT_SEMESTER } from '../shared/semesters';

export { mockFaculties };

export const mockDepartments = [
  getDepartmentById(DEPARTMENT_CNPM),
  getDepartmentById(DEPARTMENT_KHMT),
  getDepartmentById(DEPARTMENT_MMT),
];

/**
 * Học kỳ đang xét của toàn bộ dữ liệu môn học mẫu.
 * Lấy từ nguồn sự thật duy nhất `shared/semesters.js` (suy từ đồng hồ hệ thống,
 * có đích lùi về học kỳ có dữ liệu) nên không phân hệ nào tự khai báo lại.
 */
export const CURRENT_SEMESTER = SHARED_CURRENT_SEMESTER;

/**
 * Nguồn thô của môn học. `departmentId` là quan hệ canonical tới Bộ môn;
 * tên Khoa / Bộ môn được suy ra ngay bên dưới để mọi màn hình hiển thị
 * cùng một chuỗi, không nơi nào tự viết lại tên đơn vị.
 */
const SUBJECT_SEEDS = [
  {
    id: 'SUB_502051',
    code: '502051',
    name: 'Hệ cơ sở dữ liệu',
    credits: 3,
    departmentId: DEPARTMENT_CNPM,
    status: 'ACTIVE',
    // `hours` = số tiết giảng dạy của chương, dùng cho Modal Quản lý môn học (FR-04.5).
    chapters: [
      { id: 'CH_01', order: 1, hours: 4, name: 'Chương 1: Tổng quan về cơ sở dữ liệu và mô hình dữ liệu' },
      { id: 'CH_02', order: 2, hours: 6, name: 'Chương 2: Mô hình quan hệ và đại số quan hệ' },
      { id: 'CH_03', order: 3, hours: 8, name: 'Chương 3: Ngôn ngữ truy vấn SQL' },
      { id: 'CH_04', order: 4, hours: 6, name: 'Chương 4: Chuẩn hóa dữ liệu và phụ thuộc hàm' },
      { id: 'CH_05', order: 5, hours: 6, name: 'Chương 5: Giao dịch, khóa và an toàn dữ liệu' },
    ],
  },
  {
    id: 'SUB_501042',
    code: '501042',
    name: 'Tổ chức máy tính',
    credits: 3,
    departmentId: DEPARTMENT_KHMT,
    status: 'ACTIVE',
    chapters: [
      { id: 'CH_11', order: 1, hours: 6, name: 'Chương 1: Biểu diễn số và phép toán số học nhị phân' },
      { id: 'CH_12', order: 2, hours: 8, name: 'Chương 2: Mạch tổ hợp và mạch tuần tự' },
      { id: 'CH_13', order: 3, hours: 8, name: 'Chương 3: Kiến trúc tập lệnh (ISA)' },
      { id: 'CH_14', order: 4, hours: 8, name: 'Chương 4: Bộ nhớ và phân cấp bộ nhớ đệm' },
    ],
  },
  {
    id: 'SUB_503120',
    code: '503120',
    name: 'Lập trình Web với React',
    credits: 3,
    departmentId: DEPARTMENT_CNPM,
    status: 'ACTIVE',
    chapters: [
      { id: 'CH_21', order: 1, hours: 6, name: 'Chương 1: Kiến thức nền tảng Web và ES6+' },
      { id: 'CH_22', order: 2, hours: 8, name: 'Chương 2: Component, Props và State trong React' },
      { id: 'CH_23', order: 3, hours: 8, name: 'Chương 3: Hooks, Context và quản lý trạng thái' },
      { id: 'CH_24', order: 4, hours: 8, name: 'Chương 4: Định tuyến và tối ưu hiệu năng SPA' },
    ],
  },
  {
    id: 'SUB_504210',
    code: '504210',
    name: 'An toàn thông tin',
    credits: 3,
    departmentId: DEPARTMENT_MMT,
    status: 'ACTIVE',
    chapters: [
      { id: 'CH_31', order: 1, hours: 6, name: 'Chương 1: Tổng quan an toàn thông tin' },
      { id: 'CH_32', order: 2, hours: 8, name: 'Chương 2: Mã hóa đối xứng và bất đối xứng' },
      { id: 'CH_33', order: 3, hours: 8, name: 'Chương 3: Xác thực, chữ ký số và PKI' },
      { id: 'CH_34', order: 4, hours: 8, name: 'Chương 4: Bảo mật ứng dụng Web' },
    ],
  },
  {
    id: 'SUB_500510',
    code: '500510',
    name: 'Nhập môn Trí tuệ nhân tạo',
    credits: 3,
    departmentId: DEPARTMENT_KHMT,
    status: 'ACTIVE',
    chapters: [
      { id: 'CH_41', order: 1, hours: 10, name: 'Chương 1: Khái niệm cơ bản về AI và tác tử thông minh' },
      { id: 'CH_42', order: 2, hours: 10, name: 'Chương 2: Thuật toán tìm kiếm trong không gian trạng thái' },
      { id: 'CH_43', order: 3, hours: 10, name: 'Chương 3: Biểu diễn tri thức và suy luận' },
    ],
  },
];

/** Danh sách môn học đã gắn tên Khoa/Bộ môn và giảng viên phụ trách. */
export const mockSubjects = SUBJECT_SEEDS.map((subject) => {
  const department = getDepartmentById(subject.departmentId);
  const faculty = getFacultyById(FACULTY_CNTT);

  return {
    ...subject,
    departmentName: department?.name ?? '',
    facultyId: faculty?.id ?? FACULTY_CNTT,
    facultyName: faculty?.name ?? '',
    semester: CURRENT_SEMESTER,
    chapterCount: subject.chapters.length,
    /** Tổng số tiết của môn, suy từ số tiết từng chương (không khai báo trùng lặp). */
    totalHours: subject.chapters.reduce((sum, chapter) => sum + (chapter.hours ?? 0), 0),
    teacherIds: mockTeachers
      .filter((teacher) => teacher.managedSubjectCodes.includes(subject.code))
      .map((teacher) => teacher.teacherId),
  };
});

/** Lấy môn học theo id hoặc mã môn. */
export const getSubjectById = (key) =>
  mockSubjects.find((subject) => subject.id === key || subject.code === key) || null;

/** Lấy danh sách chương của một môn học. */
export const getChaptersBySubject = (key) => getSubjectById(key)?.chapters ?? [];

/** Lấy tên môn học để hiển thị, trả về chính mã môn nếu không tìm thấy. */
export const getSubjectName = (key) => getSubjectById(key)?.name ?? key;

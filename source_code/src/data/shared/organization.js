/**
 * src/data/shared/organization.js
 *
 * NGUỒN SỰ THẬT DUY NHẤT cho cơ cấu tổ chức & danh sách tài khoản của EduTesting.
 *
 * Cả phân hệ Giảng viên (Giai đoạn 3) lẫn phân hệ Quản trị viên (Giai đoạn 4)
 * đều tham chiếu file này, nên không tồn tại hai bộ Khoa/Bộ môn/Lớp khác nhau
 * gây mâu thuẫn giữa Dashboard, Quản lý môn học và Quản lý người dùng.
 *
 * ── NGÀNH HỌC VÀ BỘ MÔN LÀ MỘT ──────────────────────────────────────────────
 * Hệ thống chỉ có MỘT danh mục đơn vị (`mockDepartments`). Cùng một đơn vị đó:
 *   - hiển thị là "Ngành học" (majorName) khi nói về Sinh viên;
 *   - hiển thị là "Bộ môn"   (name)       khi nói về Giảng viên.
 * Vì vậy bộ lọc Ngành học ở màn hình Quản lý người dùng và bộ lọc Bộ môn ở màn
 * hình Quản lý môn học dùng chung một danh mục, cùng khóa `departmentId`.
 * `mockMajors` chỉ là góc nhìn đổi nhãn của chính `mockDepartments`, không phải
 * một danh sách thứ hai.
 *
 * Cấu trúc tổ chức canonical (đối chiếu docs/functional-requirements.md
 * FR-03.1 và FR-04.2: hệ thống chỉ có 1 Khoa CNTT với 3 Bộ môn):
 *   Khoa Công nghệ thông tin
 *     ├── Bộ môn Công nghệ phần mềm   Ngành Kỹ thuật phần mềm
 *     ├── Bộ môn Khoa học máy tính    Ngành Khoa học máy tính
 *     └── Bộ môn Mạng máy tính & truyền thông dữ liệu  Ngành Mạng máy tính
 *
 * Khi nối API:
 *   GET /organization/faculties    mockFaculties
 *   GET /organization/departments  mockDepartments  (kèm majorName)
 *   GET /organization/classes      mockClasses
 *   GET /rooms                     mockRooms
 *   GET /users?role=STUDENT        mockStudents
 *   GET /users?role=TEACHER        mockTeachers
 */

/* ============================== KHOA / BỘ MÔN ============================== */

export const FACULTY_CNTT = 'FAC_CNTT';

export const mockFaculties = [{ id: FACULTY_CNTT, name: 'Khoa Công nghệ thông tin' }];

export const DEPARTMENT_CNPM = 'DEPT_CNPM';
export const DEPARTMENT_KHMT = 'DEPT_KHMT';
export const DEPARTMENT_MMT = 'DEPT_MMT';

/**
 * Danh mục đơn vị duy nhất của hệ thống.
 *   - `name`      : tên dùng cho Giảng viên (Bộ môn công tác).
 *   - `majorName` : tên dùng cho Sinh viên (Ngành học), cùng một đơn vị.
 */
export const mockDepartments = [
  {
    id: DEPARTMENT_CNPM,
    name: 'Kỹ thuật phần mềm',
    majorName: 'Kỹ thuật phần mềm',
    facultyId: FACULTY_CNTT,
  },
  {
    id: DEPARTMENT_KHMT,
    name: 'Khoa học máy tính',
    majorName: 'Khoa học máy tính',
    facultyId: FACULTY_CNTT,
  },
  {
    id: DEPARTMENT_MMT,
    name: 'Mạng máy tính & truyền thông dữ liệu',
    majorName: 'Mạng máy tính',
    facultyId: FACULTY_CNTT,
  },
];

/* ================================== LỚP =================================== */

/**
 * Lớp sinh hoạt của sinh viên. Mỗi lớp thuộc đúng một đơn vị (Ngành học), nên
 * chọn lớp là suy ra được Ngành học/Bộ môn và ngược lại lọc theo Ngành học sẽ
 * giới hạn đúng danh sách lớp của ngành đó.
 */
export const mockClasses = [
  { id: 'CLS_21050301', name: '21050301', departmentId: DEPARTMENT_CNPM },
  { id: 'CLS_21050302', name: '21050302', departmentId: DEPARTMENT_CNPM },
  { id: 'CLS_21050303', name: '21050303', departmentId: DEPARTMENT_CNPM },
  { id: 'CLS_21050304', name: '21050304', departmentId: DEPARTMENT_CNPM },
  { id: 'CLS_21050305', name: '21050305', departmentId: DEPARTMENT_KHMT },
  { id: 'CLS_21050306', name: '21050306', departmentId: DEPARTMENT_KHMT },
  { id: 'CLS_21050307', name: '21050307', departmentId: DEPARTMENT_KHMT },
  { id: 'CLS_21050308', name: '21050308', departmentId: DEPARTMENT_MMT },
  { id: 'CLS_21050309', name: '21050309', departmentId: DEPARTMENT_MMT },
  { id: 'CLS_21050310', name: '21050310', departmentId: DEPARTMENT_MMT },
];

/* ============================= PHÒNG THI / LAB ============================= */

export const ONLINE_ROOM_ID = 'ONLINE';

/** Danh sách phòng thi hợp lệ (FR-07.2 - "Phòng thi / Hình thức thi"). */
export const mockRooms = [
  { id: ONLINE_ROOM_ID, name: 'Thi trực tuyến (Online)', type: 'ONLINE' },
  { id: 'LAB-01', name: 'LAB-01', type: 'LAB' },
  { id: 'LAB-02', name: 'LAB-02', type: 'LAB' },
  { id: 'LAB-03', name: 'LAB-03', type: 'LAB' },
  { id: 'LAB-04', name: 'LAB-04', type: 'LAB' },
  { id: 'LAB-05', name: 'LAB-05', type: 'LAB' },
];

export const mockLabRooms = mockRooms.filter((room) => room.type === 'LAB');

/* =========================== SINH VIÊN (ACCOUNT) =========================== */

/**
 * Nguồn thô của danh sách sinh viên: [MSSV, Họ tên, Lớp sinh hoạt, Trạng thái].
 * Mã số 52000000 (Nguyễn Văn A) là tài khoản đăng nhập mặc định của Sinh viên.
 */
const STUDENT_SEEDS = [
  ['52000000', 'Nguyễn Văn A', 'CLS_21050301', 'ACTIVE'],
  ['52000014', 'Trần Thị Bích', 'CLS_21050301', 'ACTIVE'],
  ['52000027', 'Lê Minh Cường', 'CLS_21050302', 'ACTIVE'],
  ['52000033', 'Phạm Thu Dung', 'CLS_21050302', 'ACTIVE'],
  ['52000041', 'Hoàng Quốc Đạt', 'CLS_21050303', 'ACTIVE'],
  ['52000058', 'Vũ Thị Hằng', 'CLS_21050303', 'ACTIVE'],
  ['52000062', 'Đặng Tuấn Hùng', 'CLS_21050304', 'ACTIVE'],
  ['52000077', 'Bùi Khánh Linh', 'CLS_21050304', 'LOCKED'],
  ['52000081', 'Ngô Bảo Khang', 'CLS_21050305', 'ACTIVE'],
  ['52000088', 'Ngô Thị Mai', 'CLS_21050305', 'ACTIVE'],
  ['52000095', 'Đỗ Văn Nam', 'CLS_21050306', 'ACTIVE'],
  ['52000102', 'Lý Thị Oanh', 'CLS_21050306', 'ACTIVE'],
  ['52000118', 'Trịnh Gia Phúc', 'CLS_21050307', 'ACTIVE'],
  ['52000126', 'Dương Mỹ Quyên', 'CLS_21050307', 'ACTIVE'],
  ['52000131', 'Hồ Nhật Sơn', 'CLS_21050308', 'ACTIVE'],
  ['52000144', 'Mai Anh Thư', 'CLS_21050308', 'ACTIVE'],
  ['52000157', 'Cao Minh Trí', 'CLS_21050309', 'ACTIVE'],
  ['52000163', 'Đinh Thu Uyên', 'CLS_21050309', 'LOCKED'],
  ['52000175', 'Lâm Hoàng Vũ', 'CLS_21050310', 'ACTIVE'],
  ['52000188', 'Trương Khánh Vy', 'CLS_21050310', 'ACTIVE'],
];

export const mockStudents = STUDENT_SEEDS.map(([studentId, name, classId, status]) => {
  const classInfo = mockClasses.find((item) => item.id === classId);
  const department = mockDepartments.find((item) => item.id === classInfo.departmentId);

  return {
    id: `ST_${studentId}`,
    studentId,
    name,
    email: `${studentId}@student.tdtu.edu.vn`,
    classId,
    className: classInfo.name,
    facultyId: FACULTY_CNTT,
    /**
     * Sinh viên gắn với đúng đơn vị của lớp sinh hoạt; `majorName` là nhãn
     * "Ngành học" của chính đơn vị đó (không phải một thực thể riêng).
     */
    departmentId: department.id,
    departmentName: department.name,
    majorName: department.majorName,
    role: 'STUDENT',
    status,
  };
});

/* =========================== GIẢNG VIÊN (ACCOUNT) ========================== */

/**
 * Danh sách giảng viên canonical — dùng chung cho:
 *   - UserManagementPage (FR-03.1, tab Giảng viên)
 *   - Phân công giảng viên phụ trách môn học (FR-04.5)
 *   - Giám thị phòng thi & người lập biên bản (FR-10)
 *   - Phân quyền dữ liệu của Teacher Dashboard (FR-02)
 *
 * `managedSubjectCodes` chính là ràng buộc "xem Đề thi / Giám sát phòng thi /
 * Chấm bài tự luận của các môn học được Admin phân công" (FR-03.4).
 */
export const mockTeachers = [
  {
    id: 'GV_0982',
    teacherId: 'GV2026_0982',
    name: 'Nguyễn Văn B',
    email: 'nguyenvanb@tdtu.edu.vn',
    degree: 'ThS.',
    academicTitle: 'Giảng viên chính',
    facultyId: FACULTY_CNTT,
    departmentId: DEPARTMENT_CNPM,
    role: 'TEACHER',
    position: 'Giảng viên',
    phone: '0912345678',
    status: 'ACTIVE',
    managedSubjectCodes: ['502051', '501042', '500510'],
  },
  {
    id: 'GV_1692',
    teacherId: 'GV2026_1692',
    name: 'Trần Thị C',
    email: 'tranthic@tdtu.edu.vn',
    degree: 'ThS.',
    academicTitle: 'Giảng viên',
    facultyId: FACULTY_CNTT,
    departmentId: DEPARTMENT_KHMT,
    role: 'TEACHER',
    position: 'Giảng viên',
    phone: '0912345692',
    status: 'ACTIVE',
    managedSubjectCodes: ['503120', '502051'],
  },
  {
    id: 'GV_0681',
    teacherId: 'GV2026_0681',
    name: 'Hà Thị D',
    email: 'hathid@tdtu.edu.vn',
    degree: 'TS.',
    academicTitle: 'Trưởng bộ môn',
    facultyId: FACULTY_CNTT,
    departmentId: DEPARTMENT_KHMT,
    role: 'TEACHER',
    position: 'Trưởng bộ môn',
    phone: '0912345681',
    status: 'ACTIVE',
    managedSubjectCodes: ['503120'],
  },
  {
    id: 'GV_0871',
    teacherId: 'GV2026_0871',
    name: 'Lê Hoàng D',
    email: 'lehoangd@tdtu.edu.vn',
    degree: 'TS.',
    academicTitle: 'Giảng viên',
    facultyId: FACULTY_CNTT,
    departmentId: DEPARTMENT_MMT,
    role: 'TEACHER',
    position: 'Giảng viên',
    phone: '0912345871',
    status: 'ACTIVE',
    managedSubjectCodes: ['504210', '500510', '503120'],
  },
  {
    id: 'GV_0082',
    teacherId: 'GV2026_0082',
    name: 'Phạm Minh F',
    email: 'phamminhf@tdtu.edu.vn',
    degree: 'ThS.',
    academicTitle: 'Giảng viên',
    facultyId: FACULTY_CNTT,
    departmentId: DEPARTMENT_MMT,
    role: 'TEACHER',
    position: 'Giảng viên',
    phone: '0912345082',
    status: 'LOCKED',
    managedSubjectCodes: ['504210'],
  },
];

/* ================ GÓC NHÌN "NGÀNH HỌC" CỦA CÙNG ĐƠN VỊ =================== */

/**
 * `mockMajors` là góc nhìn đổi nhãn của `mockDepartments`, KHÔNG phải danh sách
 * thứ hai: cùng id, cùng thứ tự, chỉ đổi `name` thành tên ngành đào tạo. Nhờ vậy
 * không thể tồn tại tình trạng "ngành" và "bộ môn" lệch nhau.
 */
export const mockMajors = mockDepartments.map((department) => ({
  id: department.id,
  name: department.majorName,
  departmentId: department.id,
  facultyId: department.facultyId,
}));

/* ================================ TRA CỨU ================================= */

export const getFacultyById = (id) => mockFaculties.find((item) => item.id === id) || null;

export const getDepartmentById = (id) => mockDepartments.find((item) => item.id === id) || null;

/** Tên đơn vị dùng cho Giảng viên (Bộ môn công tác). */
export const getDepartmentName = (id) => getDepartmentById(id)?.name ?? '';

/** Tên đơn vị dùng cho Sinh viên (Ngành học) — cùng một đơn vị với Bộ môn. */
export const getMajorName = (id) => getDepartmentById(id)?.majorName ?? '';

export const getMajorById = (id) => mockMajors.find((item) => item.id === id) || null;

export const getClassById = (id) => mockClasses.find((item) => item.id === id) || null;

export const getClassByName = (name) => mockClasses.find((item) => item.name === name) || null;

/** Danh sách lớp sinh hoạt thuộc một Ngành học (dùng cho bộ lọc phụ thuộc). */
export const getClassesByDepartment = (departmentId) =>
  !departmentId || departmentId === 'ALL'
    ? mockClasses
    : mockClasses.filter((classItem) => classItem.departmentId === departmentId);

export const getRoomById = (id) => mockRooms.find((item) => item.id === id) || null;

/** Tra cứu sinh viên theo MSSV hoặc id nội bộ. */
export const getStudentByCode = (code) =>
  mockStudents.find((item) => item.studentId === code || item.id === code) || null;

/** Tra cứu giảng viên theo MSGV hoặc id nội bộ. */
export const getTeacherByCode = (code) =>
  mockTeachers.find((item) => item.teacherId === code || item.id === code) || null;

/** Tên hiển thị chuẩn của một giảng viên: "ThS. Nguyễn Văn B". */
export const getTeacherDisplayName = (code) => {
  const teacher = getTeacherByCode(code);
  return teacher ? `${teacher.degree} ${teacher.name}` : '';
};

/** Danh sách mã môn học một giảng viên được Admin phân công. */
export const getManagedSubjectCodes = (teacherCode) =>
  getTeacherByCode(teacherCode)?.managedSubjectCodes ?? [];

/** Bộ môn của một sinh viên, suy ra từ ngành học của lớp sinh hoạt. */
export const getStudentDepartmentId = (studentCode) =>
  getStudentByCode(studentCode)?.departmentId ?? null;

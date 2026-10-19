/**
 * src/data/admin/mockAdminDashboard.js
 *
 * Dữ liệu cho màn hình 4.0 Dashboard Quản trị viên (FR-02).
 *
 * Toàn bộ số liệu đều ĐƯỢC SUY RA từ mô hình miền dùng chung, không có widget
 * nào tự khai báo một bộ mock riêng:
 *   - mockAdminUsers         Tổng tài khoản hoạt động, phân bổ theo Bộ môn
 *   - mockAdminSubjectList   Tổng số môn học, số chủ đề kiến thức
 *   - mockExams              Kỳ thi trong học kỳ, lượt thi theo tháng (× Bộ môn)
 *   - mockAdminLiveRooms     Thí sinh trực tuyến, bảng theo dõi phòng thi
 *   - mockViolations         Nhật ký sự cố trong Modal giám sát ca thi
 *
 * Định nghĩa "một lượt thi": số bài đã nộp của một đề thi (`submittedCount`).
 * Không dùng số ca thi / số đề thi / số phòng thi thay thế.
 *
 * Khi nối API:
 *   GET /admin/dashboard-summary
 *   GET /admin/dashboard-monthly-attempts?schoolYear=2025-2026
 *   GET /admin/dashboard-account-distribution?groupBy=DEPARTMENT
 */

import { getDepartmentName, mockDepartments } from '../shared/organization';
import {
  ACADEMIC_YEAR,
  CURRENT_SEMESTER,
  SEMESTER_OPTIONS,
  getMonthKeyOfIso,
  getSemesterLabel,
  getSemesterMonths,
  getSemesterRangeLabel,
} from '../shared/semesters';
import { mockAdminSubjectList } from './mockAdminSubjects';
import { mockStudentsList, mockTeachersList } from './mockAdminUsers';
import { getExamsBySemester, getOngoingExams } from '../teacher/mockExams';
import { mockLiveRooms, mockViolations } from '../teacher/mockAntiCheat';
import { mockQuestionBank } from '../teacher/mockQuestions';

/** Năm học đang được thống kê trên Dashboard. */
export const ADMIN_ACADEMIC_YEAR = ACADEMIC_YEAR;

/**
 * Học kỳ mặc định khi mở Dashboard: học kỳ đang diễn ra, suy từ đồng hồ hệ thống
 * (xem `shared/semesters.js`). Người dùng luôn có thể đổi sang học kỳ khác.
 */
export const ADMIN_CURRENT_SEMESTER = CURRENT_SEMESTER;

/**
 * Bộ lọc học kỳ của Dashboard (FR-02.1).
 * KHÔNG còn lựa chọn "Tất cả học kỳ": mọi widget đều phải gắn với một học kỳ cụ
 * thể, nhờ vậy số liệu luôn có kỳ tham chiếu rõ ràng và không trộn nhiều kỳ.
 */
export const ADMIN_SEMESTER_OPTIONS = SEMESTER_OPTIONS;

/** Nhãn mức xử lý của từng dòng nhật ký sự cố trong Modal giám sát. */
export const ADMIN_INCIDENT_HANDLING_LABELS = {
  AUTO_WARNING: 'Cảnh báo tự động',
  AUTO_RECONNECT: 'Tự kết nối lại',
  AUTO_LOGGED: 'Hệ thống ghi nhận',
};

/** Mức xử lý tương ứng với từng mức rủi ro do AI phân loại (FR-10.4). */
const HANDLING_BY_RISK = {
  NORMAL: 'AUTO_RECONNECT',
  SUSPICIOUS: 'AUTO_WARNING',
  HIGH: 'AUTO_LOGGED',
};

/* ============================ PHÒNG THI TRỰC TIẾP ========================= */

/** Sự cố của một phòng thi, suy từ nhật ký vi phạm của chính kỳ thi + phòng đó. */
function buildRoomIncidents(examCode, room) {
  return mockViolations
    .filter((violation) => violation.examCode === examCode && violation.room === room)
    .flatMap((violation) =>
      violation.events.map((event, index) => ({
        id: `${violation.id}_${index}`,
        at: event.time,
        studentId: violation.studentId,
        studentName: violation.studentName,
        event: `${event.type} (lần ${index + 1}/${violation.maxOccurrences})`,
        handling: HANDLING_BY_RISK[violation.riskLevel] ?? 'AUTO_LOGGED',
      }))
    );
}

/** Ghi chú tình trạng hệ thống của phòng thi, suy từ số sự cố ghi nhận được. */
function buildSystemHealth(incidentCount, onlineCount) {
  if (incidentCount === 0) {
    return `Ổn định, ${onlineCount} thí sinh đang kết nối, không ghi nhận sự cố`;
  }
  return `${incidentCount} sự cố đã được hệ thống ghi nhận tự động`;
}

/**
 * Bảng theo dõi phòng thi đang diễn ra theo thời gian thực (FR-02.2).
 * Mỗi dòng tương ứng đúng một phòng thi của một đề thi đang mở.
 */
export const mockAdminLiveRooms = mockLiveRooms.map((room) => {
  const incidents = buildRoomIncidents(room.examCode, room.room);

  return {
    id: room.id,
    examId: room.examId,
    examCode: room.examCode,
    subjectCode: room.subjectCode,
    subjectName: room.subjectName,
    departmentId: room.departmentId,
    department: getDepartmentName(room.departmentId),
    room: room.room,
    proctorName: room.proctorName,
    online: room.online,
    candidates: room.candidates,
    submitted: room.submitted,
    timeRange: room.timeRange,
    systemHealth: buildSystemHealth(incidents.length, room.online),
    incidents,
  };
});

/* ================================== KPI ================================== */

/** Tổng số tài khoản theo trạng thái, tách theo vai trò (dùng cho thẻ KPI). */
export function buildAccountCounts() {
  const activeStudents = mockStudentsList.filter((user) => user.status === 'ACTIVE').length;
  const activeTeachers = mockTeachersList.filter((user) => user.status === 'ACTIVE').length;

  return {
    totalActive: activeStudents + activeTeachers,
    total: mockStudentsList.length + mockTeachersList.length,
    activeStudents,
    activeTeachers,
    lockedStudents: mockStudentsList.length - activeStudents,
    lockedTeachers: mockTeachersList.length - activeTeachers,
  };
}

/** Tổng số thí sinh đang làm bài trên toàn bộ phòng thi đang mở. */
export const getOnlineStudentCount = () =>
  mockAdminLiveRooms.reduce((sum, room) => sum + room.online, 0);

/** Số đề thi trong một học kỳ. */
export const getSemesterExams = (semester) => getExamsBySemester(semester);

/**
 * Bốn thẻ KPI của Dashboard Quản trị viên (FR-02.1).
 *
 * Hai thẻ đầu phản ánh TRẠNG THÁI HIỆN TẠI (số tài khoản, số thí sinh đang thi)
 * nên không đổi theo học kỳ; hai thẻ sau đếm theo HỌC KỲ ĐANG CHỌN (số môn học
 * có đề trong kỳ, số kỳ thi của kỳ đó).
 */
export function buildAdminKpis(semester = CURRENT_SEMESTER) {
  const accounts = buildAccountCounts();
  const totalChapters = mockAdminSubjectList.reduce(
    (sum, subject) => sum + subject.chapterCount,
    0
  );
  const semesterExams = getSemesterExams(semester);
  const ongoingCount = getOngoingExams().length;

  return [
    {
      id: 'totalAccounts',
      label: 'Tổng tài khoản hoạt động',
      value: accounts.totalActive.toLocaleString('vi-VN'),
      detail: `${accounts.activeTeachers} Giảng viên • ${accounts.activeStudents} Sinh viên`,
      icon: 'users',
      tone: 'admin',
    },
    {
      id: 'onlineStudents',
      label: 'Thí sinh trực tuyến',
      value: getOnlineStudentCount().toLocaleString('vi-VN'),
      detail: `${mockAdminLiveRooms.length} phòng thi đang mở`,
      icon: 'activity',
      tone: 'primary',
      isLive: true,
    },
    {
      id: 'totalSubjects',
      label: 'Tổng số môn học',
      value: mockAdminSubjectList.length.toLocaleString('vi-VN'),
      detail: `${totalChapters} Chủ đề kiến thức`,
      icon: 'book',
      tone: 'success',
    },
    {
      id: 'semesterExams',
      label: 'Kỳ thi trong học kỳ',
      value: semesterExams.length.toLocaleString('vi-VN'),
      detail: `${ongoingCount} kỳ thi đang diễn ra`,
      icon: 'calendar',
      tone: 'warning',
      isLive: true,
    },
  ];
}

/** Số liệu KPI mặc định của học kỳ đang diễn ra, giữ tương thích cho nơi gọi cũ. */
export const mockAdminDashboardKPIs = Object.fromEntries(
  buildAdminKpis(CURRENT_SEMESTER).map((kpi) => [kpi.id, kpi])
);

/* ================== CHART 1: LƯỢT THI THEO THÁNG × BỘ MÔN ================ */

/**
 * Thống kê lượt thi theo tháng TRONG MỘT HỌC KỲ, kèm breakdown theo Bộ môn.
 *
 * Trục tháng là CỐ ĐỊNH theo khung học kỳ (xem `shared/semesters.js`):
 * HK1 là T8 đến T12, HK2 là T12 đến T5, HK3 là T5 đến T8. Tháng chưa có lượt thi vẫn
 * hiển thị cột 0 thay vì biến mất khỏi trục, nên độ dài học kỳ luôn nhìn thấy.
 *
 * Một "lượt thi" = một bài đã nộp (`submittedCount`) của đề thi thuộc học kỳ
 * đang chọn; đề được xếp vào tháng theo MỐC MỞ ĐỀ (`openAt`).
 */
export function getAdminMonthlyAttempts(semester) {
  const months = new Map(
    getSemesterMonths(semester).map((month) => [
      month.monthKey,
      { ...month, attempts: 0, byDepartment: {} },
    ])
  );

  getExamsBySemester(semester).forEach((exam) => {
    const monthKey = getMonthKeyOfIso(exam.openAt);
    const entry = monthKey ? months.get(monthKey) : null;
    if (!entry || exam.submittedCount === 0) return;

    entry.attempts += exam.submittedCount;
    entry.byDepartment[exam.departmentId] =
      (entry.byDepartment[exam.departmentId] ?? 0) + exam.submittedCount;
  });

  return Array.from(months.values()).map((entry) => ({
    ...entry,
    id: entry.monthKey,
    /** Mọi Bộ môn đều có mặt trong mỗi tháng, kể cả khi tháng đó chưa có lượt thi. */
    byDepartment: mockDepartments.reduce(
      (accumulator, department) => ({
        ...accumulator,
        [department.id]: entry.byDepartment[department.id] ?? 0,
      }),
      {}
    ),
  }));
}

/** Tổng lượt thi (bài đã nộp) của một học kỳ. */
export const getSemesterAttemptTotal = (semester) =>
  getAdminMonthlyAttempts(semester).reduce((sum, month) => sum + month.attempts, 0);

/** Nhãn khoảng thời gian của học kỳ, ví dụ 'T12/2025 - T5/2026'. */
export const getAdminSemesterRangeLabel = (semester) => getSemesterRangeLabel(semester);

/** Nhãn hiển thị của học kỳ, ví dụ 'HK2 2025/2026'. */
export const getAdminSemesterLabel = (semester) => getSemesterLabel(semester);

/** Màu hiển thị cho từng Bộ môn trên biểu đồ breakdown. */
const DEPARTMENT_COLORS = {
  DEPT_CNPM: '#6366F1',
  DEPT_KHMT: '#06B6D4',
  DEPT_MMT: '#10B981',
};

/**
 * Cấu hình series cho chart breakdown theo Bộ môn.
 *
 * `key` PHẢI trùng khóa trong `mockAdminMonthlyAttempts[].byDepartment` (chính là
 * id Bộ môn) để biểu đồ lấy đúng số liệu của từng chuỗi. Legend chỉ hiển thị TÊN
 * Bộ môn, không lộ mã kỹ thuật cho người dùng cuối.
 */
export const mockAdminDepartmentSeries = mockDepartments.map((department) => ({
  id: department.id,
  key: department.id,
  departmentId: department.id,
  label: getDepartmentName(department.id),
  color: DEPARTMENT_COLORS[department.id] ?? '#94A3B8',
}));

/* ============ CHART 2: PHÂN BỔ TÀI KHOẢN THEO BỘ MÔN (FR-02) ============= */

/**
 * Phân bổ tài khoản theo Bộ môn, đếm trực tiếp từ danh sách người dùng thật
 * (sinh viên theo ngành của lớp sinh hoạt, giảng viên theo Bộ môn công tác).
 */
export const mockAdminAccountByDepartment = mockDepartments.map((department) => {
  const studentCount = mockStudentsList.filter(
    (student) => student.departmentId === department.id
  ).length;
  const teacherCount = mockTeachersList.filter(
    (teacher) => teacher.departmentId === department.id
  ).length;

  return {
    id: department.id,
    label: getDepartmentName(department.id),
    count: studentCount + teacherCount,
    studentCount,
    teacherCount,
    color: DEPARTMENT_COLORS[department.id] ?? '#94A3B8',
  };
});

/** Tổng số tài khoản đang có trong hệ thống (khớp tổng của biểu đồ phân bổ). */
export const mockAdminAccountTotal = mockAdminAccountByDepartment.reduce(
  (sum, item) => sum + item.count,
  0
);

/** Gắn % cho từng nhóm để biểu đồ tròn vẽ bằng stroke-dasharray. */
export function withPercent(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  return items.map((item) => ({
    ...item,
    percent: Math.round((item.count / total) * 100),
  }));
}

/* ========================== HOẠT ĐỘNG GẦN ĐÂY ============================ */

/**
 * Hoạt động cần Quản trị viên chú ý: các ca thi đang mở có sự cố ghi nhận,
 * sắp xếp theo số sự cố giảm dần. Suy từ chính bảng phòng thi trực tiếp.
 */
export const mockAdminRecentActivity = mockAdminLiveRooms
  .filter((room) => room.incidents.length > 0)
  .sort((a, b) => b.incidents.length - a.incidents.length)
  .map((room) => ({
    id: room.id,
    examCode: room.examCode,
    subjectName: room.subjectName,
    room: room.room,
    incidentCount: room.incidents.length,
    latestIncidentAt: room.incidents[room.incidents.length - 1]?.at ?? '',
    systemHealth: room.systemHealth,
  }));

/** Tổng số câu hỏi hiện có trong ngân hàng (dùng cho mô tả bổ sung). */
export const getTotalQuestionCount = () => mockQuestionBank.length;

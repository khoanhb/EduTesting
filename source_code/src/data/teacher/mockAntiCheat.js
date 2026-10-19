/**
 * src/data/teacher/mockAntiCheat.js
 *
 * Phòng thi đang diễn ra + nhật ký vi phạm gian lận.
 * Dùng cho TeacherDashboardPage (2.0), AntiCheatMonitorPage (2.7) và
 * bảng giám sát ca thi trên Dashboard Quản trị viên (4.0).
 *
 * Quan trọng: danh sách phòng thi KHÔNG được khai báo độc lập. Mỗi phòng được
 * SUY RA từ đề thi đang mở trong `mockExams` (mã kỳ thi, môn học, giám thị,
 * khung giờ, sĩ số) để không tồn tại phòng thi "chỉ có trên một màn hình".
 *
 * Nghiệp vụ hiện tại KHÔNG có luồng "mở khóa bài thi cho thí sinh làm tiếp":
 * khi thí sinh chạm ngưỡng vi phạm, bài thi bị khóa và thu bắt buộc. Vì vậy
 * trạng thái xử lý vi phạm chỉ gồm PENDING (chờ xử lý) và REPORTED (đã lập
 * biên bản). Nhật ký kiểm tra (auditLog) chỉ ghi các thao tác thực có.
 *
 * Khi nối API:
 *   GET  /teacher/live-rooms                     (WebSocket /ws/rooms)
 *   GET  /teacher/violations?semester=&subjectCode=&examCode=&room=&riskLevel=
 *   POST /teacher/violations/{id}/report
 */

import { getExamById, getOngoingExams } from './mockExams';
import { getSubjectById } from './mockSubjects';
import { getStudentByCode, getTeacherDisplayName } from '../shared/organization';

/** Tách phần giờ 'HH:mm' từ chuỗi 'dd/MM/yyyy HH:mm'. */
const getClockPart = (dateTimeText) => (dateTimeText || '').split(' ')[1] ?? '';

/**
 * Chia một tổng số cho các phòng theo sức chứa, phần dư dồn vào phòng cuối.
 * Dùng để suy ra sĩ số / số bài đã nộp của từng phòng từ số liệu của cả đề thi.
 */
function distributeByCapacity(total, rooms, capacityOf) {
  if (rooms.length === 0) return [];
  const totalCapacity = rooms.reduce((sum, room) => sum + capacityOf(room), 0) || 1;

  let allocated = 0;
  return rooms.map((room, index) => {
    if (index === rooms.length - 1) return Math.max(0, total - allocated);
    const share = Math.round((total * capacityOf(room)) / totalCapacity);
    const value = Math.max(0, share);
    allocated += value;
    return value;
  });
}

/** Đếm số vi phạm đã ghi nhận cho một cặp (kỳ thi, phòng thi). */
function countViolations(violations, examCode, room) {
  return violations.filter(
    (violation) => violation.examCode === examCode && violation.room === room
  ).length;
}

/**
 * Nhật ký vi phạm gian lận.
 *
 *   status    : PENDING (chờ xử lý) | REPORTED (đã lập biên bản)
 *   riskLevel : NORMAL (bình thường) | SUSPICIOUS (đáng ngờ) | HIGH (vi phạm cao)
 *   aiRiskScore : % rủi ro do AI phân tích từ ma trận hành vi (FR-10.4 của BE)
 *   events    : mốc thời gian từng sự kiện do hệ thống ghi nhận
 *   auditLog  : mốc thời gian thao tác của Giảng viên (FR-10.3 / FR-10.6)
 */
const rawViolations = [
  {
    id: 'VIO_5001',
    studentId: '52000041',
    examId: 'EX_3004',
    examCode: 'LTW_GK_01',
    testCode: '003',
    room: 'LAB-03',
    semester: 'HK2/2025-2026',
    type: 'Chuyển tab',
    occurrences: 3,
    maxOccurrences: 3,
    lastTime: '09:16:45 06/05/2026',
    riskLevel: 'HIGH',
    aiRiskScore: 94,
    status: 'PENDING',
    events: [
      { time: '09:10:12', type: 'Chuyển tab', detail: 'Thí sinh rời khỏi cửa sổ làm bài (lần 1)' },
      { time: '09:13:38', type: 'Mất focus (blur)', detail: 'Click ra ngoài cửa sổ trình duyệt (lần 2)' },
      { time: '09:16:45', type: 'Chuyển tab', detail: 'Chuyển tab lần 3, hệ thống tự động đình chỉ và thu bài' },
    ],
    report: null,
    auditLog: [],
  },
  {
    id: 'VIO_5002',
    studentId: '52000088',
    examId: 'EX_3002',
    examCode: 'CSDL_ONTAP_C3',
    testCode: '001',
    room: 'ONLINE',
    semester: 'HK2/2025-2026',
    type: 'Thu nhỏ màn hình',
    occurrences: 2,
    maxOccurrences: 3,
    lastTime: '08:42:11 13/05/2026',
    riskLevel: 'SUSPICIOUS',
    aiRiskScore: 63,
    status: 'PENDING',
    events: [
      { time: '08:31:05', type: 'Thu nhỏ màn hình', detail: 'Cửa sổ nhỏ hơn 85% kích thước màn hình (lần 1)' },
      { time: '08:42:11', type: 'Thu nhỏ màn hình', detail: 'Cửa sổ nhỏ hơn 85% kích thước màn hình (lần 2)' },
    ],
    report: null,
    auditLog: [],
  },
  {
    id: 'VIO_5003',
    // Sự cố khách quan (mất mạng) - không phải hành vi gian lận, giữ ở mức rủi ro
    // bình thường để giảng viên tra cứu nhưng không làm bật cảnh báo gian lận.
    studentId: '52000095',
    examId: 'EX_3001',
    examCode: 'CSDL_GK_01',
    testCode: '002',
    room: 'LAB-05',
    semester: 'HK2/2025-2026',
    type: 'Mất kết nối mạng',
    occurrences: 1,
    maxOccurrences: 3,
    lastTime: '08:55:02 13/05/2026',
    riskLevel: 'NORMAL',
    aiRiskScore: 18,
    status: 'PENDING',
    events: [
      { type: 'Mất kết nối', time: '08:55:02', detail: 'Thiết bị mất kết nối Internet 42 giây - đã tự khôi phục' },
    ],
    report: null,
    auditLog: [],
  },
  {
    id: 'VIO_5004',
    studentId: '52000102',
    examId: 'EX_3001',
    examCode: 'CSDL_GK_01',
    testCode: '002',
    room: 'LAB-04',
    semester: 'HK2/2025-2026',
    type: 'Mất focus (blur)',
    occurrences: 3,
    maxOccurrences: 3,
    lastTime: '10:16:45 08/05/2026',
    riskLevel: 'HIGH',
    aiRiskScore: 91,
    status: 'REPORTED',
    events: [
      { time: '10:02:20', type: 'Mất focus (blur)', detail: 'Click ra ngoài cửa sổ trình duyệt (lần 1)' },
      { time: '10:09:47', type: 'Chuyển tab', detail: 'Chuyển sang ứng dụng khác (lần 2)' },
      { time: '10:16:45', type: 'Mất focus (blur)', detail: 'Rời cửa sổ làm bài lần 3, tự động đình chỉ bài thi' },
    ],
    report: {
      studentName: 'Lý Thị Oanh',
      studentId: '52000102',
      examCode: 'CSDL_GK_01',
      testCode: '002',
      room: 'LAB-04',
      behavior: 'Chuyển tab / Thoát toàn màn hình (3/3 lần) - Hệ thống đã khóa bài thi lúc 10:16:45',
      penalty: 'Trừ 50% số điểm bài thi',
      detail: 'Thí sinh cố ý thu nhỏ màn hình trình duyệt để mở tài liệu, đã nhắc nhở trực tiếp tại phòng thi nhưng tái phạm.',
      reportedBy: 'GV2026_0982',
      reportedAt: '10:25:30 08/05/2026',
    },
    auditLog: [
      {
        action: 'REPORT',
        byUserId: 'GV2026_0982',
        at: '10:25:30 08/05/2026',
        note: 'Đã lập biên bản vi phạm: Trừ 50% số điểm bài thi.',
      },
    ],
  },
];

/** Gắn quan hệ môn học cho mỗi bản ghi vi phạm, suy ra từ đề thi tương ứng. */
export const mockViolations = rawViolations.map((violation) => {
  const exam = getExamById(violation.examId);
  const subject = getSubjectById(exam?.subjectCode ?? '');

  return {
    ...violation,
    subjectCode: subject?.code ?? '',
    subjectName: subject?.name ?? '',
    studentName: getStudentByCode(violation.studentId)?.name ?? '',
    className: getStudentByCode(violation.studentId)?.className ?? '',
  };
});

/* ============================ PHÒNG THI TRỰC TIẾP ========================== */

/**
 * Danh sách phòng thi đang diễn ra, suy ra từ các đề thi trạng thái ONGOING.
 * Mỗi phòng khai báo hình thức thi thật (ONLINE hoặc LAB-xx), sĩ số và tiến độ
 * được tính từ số liệu của chính đề thi đó.
 */
export const mockLiveRooms = getOngoingExams().flatMap((exam) => {
  const rooms = exam.rooms.length > 0 ? exam.rooms : [];
  const capacityOf = (room) => exam.roomCapacity?.[room] ?? 45;

  const candidatesPerRoom = distributeByCapacity(exam.candidateCount, rooms, capacityOf);
  const submittedPerRoom = distributeByCapacity(exam.submittedCount, rooms, capacityOf);

  return rooms.map((room, index) => {
    const candidates = candidatesPerRoom[index];
    const submitted = Math.min(submittedPerRoom[index], candidates);

    return {
      id: `ROOM_${exam.id}_${room}`,
      examId: exam.id,
      examCode: exam.examCode,
      subjectCode: exam.subjectCode,
      subjectName: exam.subjectName,
      departmentId: exam.departmentId,
      semester: exam.semester,
      room,
      roomType: room === 'ONLINE' ? 'ONLINE' : 'LAB',
      proctor: exam.proctors[0] ?? '',
      proctorName: exam.proctorNames[0] ?? '',
      timeRange: `${getClockPart(exam.openTime)} - ${getClockPart(exam.closeTime)}`,
      candidates,
      capacity: capacityOf(room),
      // "Đang làm bài" = thí sinh còn kết nối và chưa nộp bài.
      online: Math.max(0, candidates - submitted),
      submitted,
      violations: countViolations(mockViolations, exam.examCode, room),
      status: exam.status,
    };
  });
});

/* ================================= NHÃN =================================== */

/** Nhãn mức độ rủi ro trên bàn giám sát. */
export const RISK_LEVEL_LABELS = {
  NORMAL: 'Bình thường',
  SUSPICIOUS: 'Đáng ngờ',
  HIGH: 'Vi phạm cao',
};

/** Nhãn trạng thái xử lý vi phạm. */
export const VIOLATION_STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  REPORTED: 'Đã lập biên bản',
};

/** Nhãn thao tác ghi nhật ký kiểm tra của Giảng viên. */
export const AUDIT_ACTION_LABELS = {
  REPORT: 'Lập biên bản vi phạm',
};

/* =============================== TIỆN ÍCH ================================= */

/** Vi phạm có phải sự kiện gian lận thật sự (khác sự cố kỹ thuật)? */
export const isCheatingViolation = (violation) => violation.riskLevel !== 'NORMAL';

/**
 * Vi phạm đang cần giảng viên chú ý: là sự kiện gian lận thật và chưa lập biên bản.
 * Dùng cho thẻ KPI "Cảnh báo gian lận" và thông báo Cảnh báo gian lận phòng thi.
 */
export const isPendingFraudAlert = (violation) =>
  isCheatingViolation(violation) && violation.status === 'PENDING';

/** Phòng thi đang giám sát của một tập môn học (ràng buộc phân quyền FR-02/FR-10). */
export const getLiveRoomsBySubjects = (subjectCodes) =>
  !subjectCodes || subjectCodes.length === 0
    ? []
    : mockLiveRooms.filter((room) => subjectCodes.includes(room.subjectCode));

/** Vi phạm thuộc một tập môn học (ràng buộc phân quyền FR-10.1). */
export const getViolationsBySubjects = (subjectCodes) =>
  !subjectCodes || subjectCodes.length === 0
    ? []
    : mockViolations.filter((violation) => subjectCodes.includes(violation.subjectCode));

/** Sinh dòng nhật ký hiển thị theo đúng định dạng FR-10.4. */
export function formatAuditLogLine(entry) {
  if (!entry) return '';
  return `Đã ghi nhật ký bởi GV: ${entry.byUserId} lúc ${entry.at}`;
}

export { getTeacherDisplayName };

/**
 * Script kiểm tra tính nhất quán dữ liệu liên phân hệ (chạy tạm, không thuộc sản phẩm).
 * Chạy: npx jiti audit-crossphase.mjs
 *
 * Mục đích: xác nhận mọi khóa ngoại giữa ba phân hệ (Sinh viên / Giảng viên /
 * Quản trị) đều trỏ tới bản ghi có thật, và mọi danh mục chỉ tồn tại một nguồn.
 */

import {
  FACULTY_CNTT,
  mockClasses,
  mockDepartments,
  mockFaculties,
  mockMajors,
  mockRooms,
  mockStudents,
  mockTeachers,
  getClassesByDepartment,
} from './src/data/shared/organization.js';

import {
  DEFAULT_STUDENT_ID,
  DEFAULT_TEACHER_ID,
  DEFAULT_ADMIN_ID,
  mockAuthAccounts,
  mockCurrentUser,
} from './src/data/shared/authAccounts.js';

import {
  mockDepartments as teacherDepartments,
  mockSubjects,
} from './src/data/teacher/mockSubjects.js';
import { mockQuestionBank } from './src/data/teacher/mockQuestions.js';
import { EXAM_SEMESTERS, mockExams } from './src/data/teacher/mockExams.js';
import { mockLiveRooms, mockViolations } from './src/data/teacher/mockAntiCheat.js';
import { mockEssaySubmissions, mockExamAnalytics } from './src/data/teacher/mockGrading.js';

import { mockStudentsList, mockTeachersList } from './src/data/admin/mockAdminUsers.js';
import { mockAdminSubjectList } from './src/data/admin/mockAdminSubjects.js';
import {
  getAdminMonthlyAttempts,
  mockAdminAccountByDepartment,
  mockAdminLiveRooms,
} from './src/data/admin/mockAdminDashboard.js';
import {
  CURRENT_SEMESTER,
  SEMESTER_IDS,
  getSemesterMonths,
  getSemesterRangeLabel,
} from './src/data/shared/semesters.js';

import { mockStudentExams as phaseStudentExams } from './src/data/student/mockStudentExams.js';
import { mockHistoryExams as phaseExamHistory } from './src/data/student/mockExamHistory.js';

const problems = [];
const notes = [];

const fail = (scope, message) => problems.push(`[${scope}] ${message}`);
const note = (scope, message) => notes.push(`[${scope}] ${message}`);

/* --------------------------------- tiện ích -------------------------------- */

const subjectCodes = new Set(mockSubjects.map((s) => s.code));
const teacherIds = new Set(mockTeachers.map((t) => t.teacherId));
const studentIds = new Set(mockStudents.map((s) => s.studentId));
const classIds = new Set(mockClasses.map((c) => c.id));
const departmentIds = new Set(mockDepartments.map((d) => d.id));
const roomIds = new Set(mockRooms.map((r) => r.id));
const examIds = new Set(mockExams.map((e) => e.id));
const examCodes = new Set(mockExams.map((e) => e.examCode));
const questionCodes = new Set(mockQuestionBank.map((q) => q.questionCode));

const checkUnique = (scope, items, keyFn) => {
  const seen = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (seen.has(key)) fail(scope, `trùng khóa "${key}"`);
    seen.set(key, item);
  });
};

/* ============================== 1. TÀI KHOẢN ============================== */

checkUnique('students', mockStudents, (s) => s.studentId);
checkUnique('teachers', mockTeachers, (t) => t.teacherId);
checkUnique('classes', mockClasses, (c) => c.name);
checkUnique('exams', mockExams, (e) => e.examCode);
checkUnique('subjects', mockSubjects, (s) => s.code);
checkUnique('questions', mockQuestionBank, (q) => q.questionCode);

if (!studentIds.has(DEFAULT_STUDENT_ID)) fail('auth', `không có sinh viên mặc định ${DEFAULT_STUDENT_ID}`);
if (!teacherIds.has(DEFAULT_TEACHER_ID)) fail('auth', `không có giảng viên mặc định ${DEFAULT_TEACHER_ID}`);

mockAuthAccounts.forEach((account) => {
  const pool = account.role === 'STUDENT' ? studentIds : account.role === 'TEACHER' ? teacherIds : null;
  if (pool && !pool.has(account.identifier)) {
    fail('auth', `tài khoản đăng nhập ${account.identifier} (${account.role}) không tồn tại trong danh sách canonical`);
  }
  void DEFAULT_ADMIN_ID;
});

/* ===================== 2. NGÀNH HỌC = BỘ MÔN / LỚP ====================== */

if (mockMajors.length !== mockDepartments.length) {
  fail('major=department', 'mockMajors và mockDepartments lệch số lượng');
}
mockMajors.forEach((major, index) => {
  const department = mockDepartments[index];
  if (major.id !== department.id) fail('major=department', `id lệch: ${major.id} vs ${department.id}`);
  if (major.name !== department.majorName) fail('major=department', `nhãn lệch tại ${department.id}`);
});

mockDepartments.forEach((department) => {
  if (department.facultyId !== FACULTY_CNTT) fail('department', `${department.id} không thuộc Khoa CNTT`);
  if (!department.majorName) fail('department', `${department.id} thiếu nhãn ngành học`);
  const classes = getClassesByDepartment(department.id);
  if (classes.length === 0) note('department', `${department.id} chưa có lớp sinh hoạt nào`);
});

/**
 * Phân hệ Giảng viên khai báo MỘT danh mục Bộ môn riêng trong mockSubjects.js.
 * Đây là bản sao thứ hai của cùng một danh mục, nên phải khớp tuyệt đối với
 * danh mục canonical ở organization.js, lệch một chữ là hai phân hệ hiển thị
 * hai tên Bộ môn khác nhau cho cùng một đơn vị.
 */
if (teacherDepartments.length !== mockDepartments.length) {
  fail('teacher-departments', `số Bộ môn lệch: mockSubjects.js có ${teacherDepartments.length}, canonical có ${mockDepartments.length}`);
}
teacherDepartments.forEach((department) => {
  const canonical = mockDepartments.find((item) => item.id === department.id);
  if (!canonical) {
    fail('teacher-departments', `${department.id} chỉ có ở mockSubjects.js, không có trong canonical`);
    return;
  }
  if (department.name !== canonical.name) {
    fail('teacher-departments', `${department.id} lệch tên: "${department.name}" vs "${canonical.name}"`);
  }
  if (canonical.majorName && department.majorName && department.majorName !== canonical.majorName) {
    fail('teacher-departments', `${department.id} lệch nhãn ngành học`);
  }
});

/** Học kỳ hiện hành của phân hệ Giảng viên phải nằm trong danh mục học kỳ. */
if (!EXAM_SEMESTERS.includes(CURRENT_SEMESTER)) {
  fail('semester', `CURRENT_SEMESTER "${CURRENT_SEMESTER}" không nằm trong EXAM_SEMESTERS`);
}

checkUnique('departments', mockDepartments, (d) => d.id);
if (mockFaculties.length !== 1) fail('faculty', `hệ thống phải có đúng 1 Khoa, đang có ${mockFaculties.length}`);

/* ============================== 3. SINH VIÊN ============================== */

mockStudents.forEach((student) => {
  if (!classIds.has(student.classId)) fail('student', `${student.studentId} trỏ lớp không tồn tại`);
  if (!departmentIds.has(student.departmentId)) fail('student', `${student.studentId} trỏ đơn vị không tồn tại`);
  const department = mockDepartments.find((d) => d.id === student.departmentId);
  if (department && student.majorName !== department.majorName) {
    fail('student', `${student.studentId} ngành "${student.majorName}" không khớp đơn vị "${department.majorName}"`);
  }
  if ('cohortId' in student || 'cohortName' in student) fail('student', `${student.studentId} còn trường cohort`);
  if (student.facultyId !== FACULTY_CNTT) fail('student', `${student.studentId} sai Khoa`);
});

if (mockStudents.length !== mockStudentsList.length) fail('admin-users', 'số sinh viên lệch giữa canonical và danh sách quản trị');
mockStudentsList.forEach((user) => {
  const source = mockStudents.find((s) => s.studentId === user.studentId);
  if (!source) {
    fail('admin-users', `${user.studentId} chỉ có ở danh sách quản trị`);
    return;
  }
  if (user.class !== source.className) fail('admin-users', `${user.studentId} lệch tên lớp`);
  if (user.majorId !== source.departmentId) fail('admin-users', `${user.studentId} majorId phải bằng departmentId`);
  if (user.major !== source.majorName) fail('admin-users', `${user.studentId} lệch nhãn ngành`);
  if ('cohort' in user || 'cohortId' in user) fail('admin-users', `${user.studentId} còn trường cohort`);
});

/* ============================== 4. GIẢNG VIÊN ============================= */

mockTeachers.forEach((teacher) => {
  if (!departmentIds.has(teacher.departmentId)) fail('teacher', `${teacher.teacherId} trỏ đơn vị không tồn tại`);
  teacher.managedSubjectCodes.forEach((code) => {
    if (!subjectCodes.has(code)) fail('teacher', `${teacher.teacherId} được phân công môn không tồn tại: ${code}`);
  });
});

mockTeachersList.forEach((teacher) => {
  const source = mockTeachers.find((t) => t.teacherId === teacher.teacherId);
  if (!source) fail('admin-users', `${teacher.teacherId} chỉ có ở danh sách quản trị`);
  else if (teacher.departmentId !== source.departmentId) fail('admin-users', `${teacher.teacherId} lệch bộ môn`);
});

/* =========================== 5. MÔN HỌC / CHƯƠNG ========================== */

mockSubjects.forEach((subject) => {
  if (!departmentIds.has(subject.departmentId)) fail('subject', `${subject.code} trỏ đơn vị không tồn tại`);
  checkUnique(`subject:${subject.code}:chapters`, subject.chapters, (c) => c.id);
  subject.chapters.forEach((chapter, index) => {
    if (chapter.order !== index + 1) fail('subject', `${subject.code} thứ tự chương ${chapter.id} sai`);
    if (typeof chapter.hours !== 'number') fail('subject', `${subject.code} chương ${chapter.id} thiếu số tiết`);
  });
  if (subject.chapterCount !== subject.chapters.length) fail('subject', `${subject.code} chapterCount sai`);
  if (subject.totalHours !== subject.chapters.reduce((sum, c) => sum + c.hours, 0)) {
    fail('subject', `${subject.code} totalHours không khớp tổng số tiết chương`);
  }
  subject.teacherIds.forEach((id) => {
    if (!teacherIds.has(id)) fail('subject', `${subject.code} trỏ giảng viên không tồn tại: ${id}`);
  });
});

if (mockSubjects.length !== mockAdminSubjectList.length) fail('admin-subjects', 'số môn học lệch giữa canonical và danh mục quản trị');
mockAdminSubjectList.forEach((subject) => {
  if (!subjectCodes.has(subject.code)) fail('admin-subjects', `${subject.code} chỉ có ở danh mục quản trị`);
  subject.teachers.forEach((teacher) => {
    if (!teacherIds.has(teacher.teacherId)) fail('admin-subjects', `${subject.code} trỏ giảng viên lạ ${teacher.teacherId}`);
  });
  const canonical = mockSubjects.find((s) => s.code === subject.code);
  if (canonical && subject.chapterCount !== canonical.chapters.length) {
    fail('admin-subjects', `${subject.code} lệch số chương`);
  }
});

/* ======================= 6. NGÂN HÀNG CÂU HỎI ============================ */

mockQuestionBank.forEach((question) => {
  if (!subjectCodes.has(question.subjectCode)) fail('question', `${question.questionCode} trỏ môn không tồn tại`);
  const subject = mockSubjects.find((s) => s.code === question.subjectCode);
  if (subject && !subject.chapters.some((c) => c.id === question.chapterId)) {
    fail('question', `${question.questionCode} trỏ chương không thuộc môn ${subject.code}`);
  }
  if (!question.difficulty) fail('question', `${question.questionCode} thiếu độ khó`);
  if (question.type === 'ESSAY' && (!question.acceptedKeywords || question.acceptedKeywords.length === 0)) {
    fail('question', `${question.questionCode} là tự luận nhưng không có từ khóa chấp nhận`);
  }
  if (question.type === 'ESSAY' && question.correctAnswers && question.correctAnswers.length === 0) {
    note('question', `${question.questionCode} tự luận chưa có đáp án tham chiếu`);
  }
});

/* =============================== 7. ĐỀ THI =============================== */

mockExams.forEach((exam) => {
  if (!subjectCodes.has(exam.subjectCode)) fail('exam', `${exam.examCode} trỏ môn không tồn tại`);
  const subject = mockSubjects.find((s) => s.code === exam.subjectCode);
  if (subject && exam.departmentId !== subject.departmentId) {
    fail('exam', `${exam.examCode} bộ môn không khớp môn học`);
  }
  exam.proctors.forEach((id) => {
    if (!teacherIds.has(id)) fail('exam', `${exam.examCode} có giám thị không tồn tại: ${id}`);
  });
  if (!teacherIds.has(exam.createdBy)) fail('exam', `${exam.examCode} người tạo không tồn tại: ${exam.createdBy}`);
  if (!Array.isArray(exam.rooms)) fail('exam', `${exam.examCode} rooms phải là mảng`);
  exam.rooms.forEach((room) => {
    if (!roomIds.has(room)) fail('exam', `${exam.examCode} trỏ phòng không tồn tại: ${room}`);
  });
  if (exam.submittedCount > exam.candidateCount) {
    fail('exam', `${exam.examCode} số bài nộp (${exam.submittedCount}) vượt số thí sinh (${exam.candidateCount})`);
  }
  const graded = exam.avgScore !== null;
  if (graded && (exam.passRate === null || exam.passRate === undefined)) {
    fail('exam', `${exam.examCode} có điểm trung bình nhưng thiếu tỉ lệ đạt`);
  }
  if (!graded && exam.passRate !== null && exam.passRate !== undefined) {
    fail('exam', `${exam.examCode} chưa chấm nhưng đã có tỉ lệ đạt`);
  }
  if (exam.status === 'ONGOING' && exam.rooms.length === 0) {
    fail('exam', `${exam.examCode} đang diễn ra nhưng chưa gán phòng`);
  }
  if (exam.questions.length > 0 && exam.questions.length > exam.questionsCount) {
    fail('exam', `${exam.examCode} xem trước nhiều câu hơn số câu của đề`);
  }
});

/* ========================= 8. PHÒNG THI / VI PHẠM ======================== */

mockLiveRooms.forEach((room) => {
  if (!examCodes.has(room.examCode)) fail('room', `phòng thi trỏ kỳ thi không tồn tại: ${room.examCode}`);
  if (!subjectCodes.has(room.subjectCode)) fail('room', `phòng thi trỏ môn không tồn tại: ${room.subjectCode}`);
  if (!roomIds.has(room.room)) fail('room', `phòng thi dùng phòng không tồn tại: ${room.room}`);
  if (room.online > room.candidates) fail('room', `${room.room}/${room.examCode} thí sinh online vượt tổng`);
});

mockViolations.forEach((violation) => {
  if (!examCodes.has(violation.examCode)) fail('violation', `${violation.id} trỏ kỳ thi không tồn tại`);
  if (!subjectCodes.has(violation.subjectCode)) fail('violation', `${violation.id} trỏ môn không tồn tại`);
  if (!studentIds.has(violation.studentId)) fail('violation', `${violation.id} trỏ sinh viên không tồn tại`);
  if (violation.occurrences > violation.maxOccurrences) fail('violation', `${violation.id} số lần vượt ngưỡng`);
  if (violation.events.length !== violation.occurrences) {
    fail('violation', `${violation.id} số sự kiện (${violation.events.length}) không khớp số lần (${violation.occurrences})`);
  }
  if (violation.status === 'REPORTED' && !violation.report) {
    fail('violation', `${violation.id} đã lập biên bản nhưng thiếu nội dung biên bản`);
  }
});

mockAdminLiveRooms.forEach((room) => {
  if (!examCodes.has(room.examCode)) fail('admin-room', `${room.examCode} không tồn tại`);
  const source = mockLiveRooms.find((r) => r.id === room.id);
  if (source && source.online !== room.online) fail('admin-room', `${room.id} lệch số thí sinh online`);
});

/* ==================== 9. CHẤM TỰ LUẬN & PHÂN TÍCH ======================= */

checkUnique('essaySubmissions', mockEssaySubmissions, (s) => s.id);
mockEssaySubmissions.forEach((submission) => {
  if (!examIds.has(submission.examId)) fail('essay', `${submission.id} trỏ kỳ thi không tồn tại`);
  if (!questionCodes.has(submission.questionCode)) fail('essay', `${submission.id} trỏ câu hỏi không tồn tại`);
  if (submission.matchedKeywords.some((keyword) => !submission.acceptedKeywords.includes(keyword))) {
    fail('essay', `${submission.id} từ khóa khớp không nằm trong danh sách chấp nhận`);
  }
  if (submission.status === 'AUTO_GRADED' && submission.gradedScore !== submission.maxScore) {
    fail('essay', `${submission.id} chấm tự động nhưng chưa đạt điểm tối đa`);
  }
  if (submission.status === 'PENDING' && submission.gradedScore !== null) {
    fail('essay', `${submission.id} chờ chấm nhưng đã có điểm`);
  }
});

const autoGraded = mockEssaySubmissions.filter((s) => s.status === 'AUTO_GRADED').length;
if (autoGraded === 0) fail('essay', 'không có bài nào được chấm tự động (nhánh tự động không được kiểm chứng)');
else note('essay', `có ${autoGraded}/${mockEssaySubmissions.length} bài khớp đủ từ khóa và được chấm tự động`);

Object.values(mockExamAnalytics).forEach((analytics) => {
  if (!examIds.has(analytics.examId)) fail('analytics', `${analytics.examCode} không tồn tại`);
  if (analytics.median === undefined || analytics.highestScore === undefined || analytics.lowestScore === undefined) {
    fail('analytics', `${analytics.examCode} thiếu trung vị / điểm cao nhất / thấp nhất`);
  }
  if (analytics.lowestScore > analytics.highestScore) fail('analytics', `${analytics.examCode} điểm thấp nhất > cao nhất`);
  const distributionTotal = analytics.scoreDistribution.reduce((sum, bucket) => sum + bucket.count, 0);
  if (distributionTotal !== analytics.submitted) {
    fail('analytics', `${analytics.examCode} tổng phổ điểm (${distributionTotal}) khác số bài nộp (${analytics.submitted})`);
  }
  analytics.scoreDistribution.forEach((bucket) => {
    if (typeof bucket.center !== 'number') fail('analytics', `${analytics.examCode} bucket ${bucket.range} thiếu center`);
  });
  if (analytics.questionAnalysis.length !== analytics.studentScores[0]?.answers.length &&
      analytics.questionAnalysis.length >= 10) {
    note('analytics', `${analytics.examCode} chi tiết bài làm chỉ hiển thị 10 câu đầu`);
  }
});

/* ================== 10. DASHBOARD QUẢN TRỊ (lượt thi) ==================== */

/**
 * Trục tháng của mỗi học kỳ phải khớp quy ước khung thời gian, và mọi đề thi
 * phải rơi vào đúng trục tháng của học kỳ mà nó khai báo. Nếu lệch, biểu đồ
 * "Lượt thi theo tháng" sẽ có học kỳ bị trống dù học kỳ đó có đề thi.
 */
const EXPECTED_MONTH_COUNTS = {
  HK1: 5, // T8 -> T12
  HK2: 6, // T12 -> T5
  HK3: 4, // T5 -> T8
};

SEMESTER_IDS.forEach((semesterId) => {
  const code = semesterId.split('/')[0];
  const months = getSemesterMonths(semesterId);

  if (months.length !== EXPECTED_MONTH_COUNTS[code]) {
    fail('semester', `${semesterId} có ${months.length} tháng, quy ước là ${EXPECTED_MONTH_COUNTS[code]}`);
  }
  if (getSemesterRangeLabel(semesterId) === '') {
    fail('semester', `${semesterId} thiếu nhãn khoảng thời gian`);
  }

  const monthKeys = new Set(months.map((month) => month.monthKey));
  mockExams
    .filter((exam) => exam.semester === semesterId)
    .forEach((exam) => {
      const monthKey = exam.openAt ? exam.openAt.slice(0, 7) : null;
      if (monthKey && !monthKeys.has(monthKey)) {
        fail(
          'semester',
          `${exam.examCode} khai báo ${semesterId} nhưng mở đề tháng ${monthKey}, ngoài trục tháng của học kỳ`
        );
      }
    });

  const attempts = getAdminMonthlyAttempts(semesterId);
  if (attempts.length !== months.length) {
    fail('admin-dashboard', `${semesterId}: số cột tháng (${attempts.length}) khác trục học kỳ (${months.length})`);
  }
  attempts.forEach((month) => {
    const sumDepartments = Object.values(month.byDepartment).reduce((sum, value) => sum + value, 0);
    if (sumDepartments !== month.attempts) {
      fail('admin-dashboard', `${semesterId} ${month.label}: tổng theo bộ môn (${sumDepartments}) khác tổng lượt thi (${month.attempts})`);
    }
    Object.keys(month.byDepartment).forEach((departmentId) => {
      if (!departmentIds.has(departmentId)) fail('admin-dashboard', `${semesterId} ${month.label} trỏ đơn vị lạ ${departmentId}`);
    });
  });
});

if (!SEMESTER_IDS.includes(CURRENT_SEMESTER)) {
  fail('semester', `học kỳ hiện tại "${CURRENT_SEMESTER}" không nằm trong danh mục học kỳ`);
}

/** Đề thi đang diễn ra phải được xác định theo THỜI ĐIỂM, không theo học kỳ. */
mockLiveRooms.forEach((room) => {
  const exam = mockExams.find((item) => item.examCode === room.examCode);
  if (exam && !exam.openAt) fail('live', `${room.examCode} đang mở phòng thi nhưng thiếu mốc mở đề`);
});

const accountTotal = mockStudentsList.length + mockTeachersList.length;
const distributionTotal = mockAdminAccountByDepartment.reduce((sum, item) => sum + item.count, 0);
if (distributionTotal !== accountTotal) {
  fail('admin-dashboard', `phân bổ tài khoản (${distributionTotal}) khác tổng danh sách (${accountTotal})`);
}
mockAdminAccountByDepartment.forEach((item) => {
  if (!departmentIds.has(item.id)) fail('admin-dashboard', `phân bổ theo đơn vị lạ ${item.id}`);
  if (item.count !== item.studentCount + item.teacherCount) {
    fail('admin-dashboard', `${item.id} tổng tài khoản không khớp sinh viên + giảng viên`);
  }
});

/* ==================== 11. PHÂN HỆ SINH VIÊN (dữ liệu) =================== */

[...phaseStudentExams, ...phaseExamHistory].forEach((exam) => {
  const code = exam.examCode ?? exam.id;
  if (code && !examCodes.has(code)) {
    fail('student-phase', `đề "${code}" trong phân hệ Sinh viên không có trong danh mục kỳ thi canonical`);
  }
  if (exam.room && !roomIds.has(exam.room)) {
    fail('student-phase', `đề "${code}" trỏ phòng không tồn tại: ${exam.room}`);
  }
  if (exam.subjectCode && !subjectCodes.has(exam.subjectCode)) {
    fail('student-phase', `đề "${code}" trỏ môn không tồn tại: ${exam.subjectCode}`);
  }
});

/* ============================ 12. HỒ SƠ ĐANG ĐĂNG NHẬP =================== */

if (mockCurrentUser.student.major !== (mockDepartments.find((d) => d.id === mockCurrentUser.student.departmentId)?.majorName ?? '')) {
  fail('profile', 'hồ sơ sinh viên đăng nhập: ngành học không khớp đơn vị');
}
if (mockCurrentUser.student.cohort) fail('profile', 'hồ sơ sinh viên đăng nhập còn trường cohort');

/* ================================= KẾT LUẬN ============================== */

console.log('=== KIỂM TRA NHẤT QUÁN DỮ LIỆU LIÊN PHÂN HỆ ===');
console.log(`Sinh viên: ${mockStudents.length} | Giảng viên: ${mockTeachers.length} | Lớp: ${mockClasses.length} | Đơn vị: ${mockDepartments.length}`);
console.log(`Môn học: ${mockSubjects.length} | Câu hỏi: ${mockQuestionBank.length} | Đề thi: ${mockExams.length}`);
console.log(`Bài tự luận: ${mockEssaySubmissions.length} | Bản ghi phân tích: ${Object.keys(mockExamAnalytics).length} | Vi phạm: ${mockViolations.length}`);
console.log('');
console.log(`LỖI: ${problems.length}`);
problems.forEach((line) => console.log(`  x ${line}`));
console.log('');
console.log(`GHI NHẬN: ${notes.length}`);
notes.forEach((line) => console.log(`  - ${line}`));

process.exitCode = problems.length > 0 ? 1 : 0;

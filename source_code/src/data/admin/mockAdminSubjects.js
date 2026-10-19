/**
 * src/data/admin/mockAdminSubjects.js
 *
 * Dữ liệu cho màn hình 4.2 Quản lý môn học & chủ đề kiến thức (FR-04).
 *
 * Danh mục môn học KHÔNG được khai báo lại cho phân hệ Quản trị: mọi bản ghi
 * lấy từ `src/data/teacher/mockSubjects.js` (môn học canonical mà Giảng viên
 * cũng đang dùng) rồi bổ sung các quan hệ cần cho bảng quản trị:
 *   - giảng viên phụ trách   : suy từ `managedSubjectCodes` của giảng viên
 *   - số câu hỏi trong kho   : suy từ Ngân hàng câu hỏi hiện có
 *   - số đề thi liên kết     : suy từ danh sách đề thi hiện có
 *
 * Nhờ vậy "Tổng số môn học" trên Dashboard, bộ lọc môn ở Ngân hàng câu hỏi và
 * danh sách ở màn hình này luôn là cùng một tập dữ liệu.
 *
 * Khi nối API: GET /admin/subjects
 */

import { getQuestionsBySubject } from '../teacher/mockQuestions';
import { mockExams } from '../teacher/mockExams';
import { mockSubjects } from '../teacher/mockSubjects';
import { mockFaculties, mockTeachers } from '../shared/organization';

/** Nhãn trạng thái môn học (FR-04.2: Hoạt động / Đang khóa). */
export const SUBJECT_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đang khóa',
};

/** Giảng viên phụ trách một môn học, dạng bản ghi hiển thị gọn. */
function buildSubjectTeachers(subjectCode) {
  return mockTeachers
    .filter((teacher) => teacher.managedSubjectCodes.includes(subjectCode))
    .map((teacher) => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      degree: teacher.degree,
      departmentId: teacher.departmentId,
    }));
}

/** Danh sách môn học canonical đã gắn đầy đủ quan hệ cho màn hình quản trị. */
export const mockAdminSubjectList = mockSubjects.map((subject) => {
  const linkedExams = mockExams.filter((exam) => exam.subjectCode === subject.code);

  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    credits: subject.credits,
    status: subject.status,
    facultyId: subject.facultyId,
    faculty: mockFaculties[0].name,
    departmentId: subject.departmentId,
    department: subject.departmentName,
    chapters: subject.chapters,
    chapterCount: subject.chapters.length,
    teachers: buildSubjectTeachers(subject.code),
    questionCount: getQuestionsBySubject(subject.code).length,
    examCount: linkedExams.length,
  };
});

/* ================================ TRA CỨU ================================= */

/** Tra cứu môn học theo id hoặc mã môn. */
export const getAdminSubjectById = (key) =>
  mockAdminSubjectList.find((subject) => subject.id === key || subject.code === key) || null;

/**
 * Ràng buộc toàn vẹn khi xóa môn học (FR-04.6): không cho xóa nếu môn đang có
 * đề thi hoặc câu hỏi liên kết.
 */
export const getSubjectDeleteBlockReason = (subjectId) => {
  const subject = getAdminSubjectById(subjectId);
  if (!subject) return null;

  if (subject.examCount > 0) {
    return `Môn học đang có ${subject.examCount} đề thi liên kết nên không thể xóa.`;
  }
  if (subject.questionCount > 0) {
    return `Môn học đang có ${subject.questionCount} câu hỏi trong ngân hàng nên không thể xóa.`;
  }
  return null;
};

/** Chương đang có câu hỏi thì không được xóa khỏi môn học (FR-04.5). */
export const getChapterDeleteBlockReason = (subjectCode, chapterId) => {
  const count = getQuestionsBySubject(subjectCode).filter(
    (question) => question.chapterId === chapterId
  ).length;

  return count > 0
    ? `Chương này đang có ${count} câu hỏi nên không thể xóa.`
    : null;
};

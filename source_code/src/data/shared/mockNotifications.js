import { mockStudentExams, getStudentExamConfig } from '../student/mockStudentExams';
import { mockEssaySubmissions } from '../teacher/mockGrading';
import { mockLiveRooms, mockViolations, isPendingFraudAlert } from '../teacher/mockAntiCheat';
import { getOngoingExams } from '../teacher/mockExams';
import { getExamAccess } from '../../utils/examAccess';

const mockTime = 'Dữ liệu mẫu';

export function buildStudentNotifications() {
  const notifications = [];
  const suspended = mockStudentExams.find((exam) => exam.lastResult?.isSuspended && !exam.lastResult?.report);
  if (suspended) notifications.push({
    id: `student-violation-${suspended.id}`,
    title: `Bài thi ${suspended.examCode} đang chờ xử lý`,
    desc: 'Điểm và bài làm chưa được công bố trong khi chờ biên bản vi phạm.',
    time: mockTime,
    isRead: false,
    link: '/student/history',
  });

  const published = mockStudentExams.find((exam) => exam.lastResult
    && getExamAccess({ ...exam, config: getStudentExamConfig(exam) }, exam.lastResult).canShowScore);
  if (published) notifications.push({
    id: `student-result-${published.id}`,
    title: `Kết quả bài thi ${published.examCode}`,
    desc: `Điểm bài thi: ${published.lastResult.score}/${published.scale}.`,
    time: mockTime,
    isRead: false,
    link: `/student/exam-result/${published.id}`,
  });

  const upcoming = mockStudentExams.find((exam) => exam.status === 'UPCOMING');
  if (upcoming) notifications.push({
    id: `student-upcoming-${upcoming.id}`,
    title: `Lịch thi theo dữ liệu mẫu: ${upcoming.examCode}`,
    desc: `${upcoming.subjectName}, phòng ${upcoming.room}, ${upcoming.openTime}.`,
    time: mockTime,
    isRead: true,
    link: '/student/exams',
  });
  return notifications;
}

export function buildTeacherNotifications() {
  const pending = mockEssaySubmissions.filter((item) => item.status === 'PENDING');
  const alert = mockViolations.find(isPendingFraudAlert);
  return [
    ...(pending.length ? [{
      id: 'teacher-grading',
      title: 'Bài tự luận chờ đối soát',
      desc: `Có ${pending.length} câu trả lời đang chờ giảng viên chấm/đối soát.`,
      time: mockTime,
      isRead: false,
      link: '/teacher/grade-essay',
    }] : []),
    ...(alert ? [{
      id: `teacher-violation-${alert.id}`,
      title: 'Cảnh báo giám sát phòng thi',
      desc: `Thí sinh ${alert.studentId} có ${alert.occurrences}/${alert.maxOccurrences} lần ${alert.type.toLowerCase()} tại ${alert.room}.`,
      time: alert.lastTime,
      isRead: false,
      link: '/teacher/anti-cheat',
    }] : []),
  ];
}

export function buildAdminNotifications() {
  const examCount = getOngoingExams().length;
  const roomCount = mockLiveRooms.length;
  return examCount ? [{
    id: 'admin-live-exams',
    title: 'Giám sát ca thi trực tiếp',
    desc: `Dữ liệu mẫu hiện có ${examCount} kỳ thi và ${roomCount} phòng thi đang diễn ra.`,
    time: mockTime,
    isRead: false,
    link: '/admin/dashboard',
  }] : [];
}

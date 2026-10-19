/**
 * src/data/teacher/mockDashboard.js
 *
 * Số liệu Dashboard Giảng viên (2.0 TeacherDashboardPage).
 *
 * Nguyên tắc: KHÔNG có tập dữ liệu chart độc lập. Toàn bộ thẻ KPI, xu hướng
 * lượt nộp và biểu đồ phân bổ câu hỏi đều được SUY RA từ ba nguồn dữ liệu thật:
 *   - mockExams      (lượt nộp, điểm trung bình, tỷ lệ đạt, sĩ số)
 *   - mockQuestionBank (số câu hỏi và phân bổ loại câu theo phạm vi phân công)
 *   - mockViolations (cảnh báo gian lận thật sự của phòng thi được phụ trách)
 * và bị GIỚI HẠN theo `managedSubjectCodes` của giảng viên đang đăng nhập.
 *
 * Khi nối API:
 *   GET /teacher/dashboard-summary?semester=&teacherId=
 */

import { buildQuestionTypeDistribution, mockQuestionBank } from './mockQuestions';
import { getExamsBySemester, mockExams } from './mockExams';
import { isPendingFraudAlert, mockViolations } from './mockAntiCheat';
import { mockTeacherUser } from './mockTeacherUser';
import { getManagedSubjectCodes } from '../shared/organization';
import { CURRENT_SEMESTER, SEMESTER_IDS, SEMESTER_OPTIONS } from '../shared/semesters';

/**
 * Các học kỳ có thể chuyển số liệu trên Dashboard.
 * Lấy từ nguồn sự thật duy nhất `shared/semesters.js` để nhãn và thứ tự học kỳ
 * khớp với Dashboard Quản trị viên (thứ tự thời gian: HK1 -> HK2 -> HK3).
 */
export const TEACHER_SEMESTERS = SEMESTER_OPTIONS;

/** Thứ tự thời gian để xác định "kỳ trước" khi tính chênh lệch. */
const SEMESTER_CHRONOLOGY = SEMESTER_IDS;

/** Chế độ xem trục hoành của khối biểu đồ xu hướng. */
export const TEACHER_CHART_VIEW_MODES = [
  { value: 'DAY', label: 'Theo ngày' },
  { value: 'EXAM', label: 'Theo kỳ thi' },
];

/** Loại biểu đồ có thể chuyển đổi trên Dashboard. */
export const TEACHER_CHART_TYPES = [
  { value: 'BAR', label: 'Lượt nộp bài' },
  { value: 'DONUT', label: 'Phân bổ loại câu hỏi' },
];

/* ============================ HÀM TÍNH TOÁN ============================== */

const round2 = (value) => Number(value.toFixed(2));

/** Đề thi trong phạm vi phân công của giảng viên, theo một học kỳ. */
function getScopedExams(semester, managedSubjectCodes) {
  return getExamsBySemester(semester).filter((exam) =>
    managedSubjectCodes.includes(exam.subjectCode)
  );
}

/**
 * Nhãn chênh lệch so với kỳ trước.
 * Chỉ trả về nhãn khi THỰC SỰ có dữ liệu kỳ trước để so sánh; nếu kỳ trước
 * không có số liệu thì trả về null để trang hiển thị mô tả trung tính thay vì
 * một phần trăm không có căn cứ.
 */
function buildDeltaLabel(currentValue, previousValue, unit) {
  if (previousValue === null || previousValue === undefined || previousValue <= 0) return null;

  const difference = currentValue - previousValue;
  const percent = Math.round((difference / previousValue) * 100);

  // Chênh lệch quá lớn (quy mô hai kỳ khác xa nhau) thì nêu số tuyệt đối cho dễ đọc.
  if (Math.abs(percent) > 200) {
    const sign = difference > 0 ? '+' : '−';
    return `${sign}${Math.abs(difference).toLocaleString('vi-VN')} ${unit} so với kỳ trước`;
  }

  return `${percent > 0 ? '+' : ''}${percent}% so với kỳ trước`;
}

/** Tỷ lệ đạt bình quân gia quyền theo số bài đã nộp. */
function computeWeightedPassRate(exams) {
  const withResults = exams.filter((exam) => exam.passRate !== null && exam.submittedCount > 0);
  if (withResults.length === 0) return null;

  const totalSubmitted = withResults.reduce((sum, exam) => sum + exam.submittedCount, 0);
  const weighted = withResults.reduce(
    (sum, exam) => sum + exam.passRate * exam.submittedCount,
    0
  );

  return round2(weighted / totalSubmitted);
}

/** Tổng số thí sinh dự thi của một tập đề thi. */
const computeCandidateTotal = (exams) =>
  exams.reduce((sum, exam) => sum + exam.candidateCount, 0);

/** Cảnh báo gian lận thật sự đang chờ xử lý trong phạm vi phân công. */
function getScopedFraudAlerts(managedSubjectCodes) {
  return mockViolations.filter(
    (violation) =>
      managedSubjectCodes.includes(violation.subjectCode) && isPendingFraudAlert(violation)
  );
}

/* ============================== XU HƯỚNG ================================= */

/**
 * Xu hướng theo NGÀY: gộp các đề thi theo ngày mở đề.
 * Mỗi điểm dữ liệu là tổng lượt nộp và điểm trung bình gia quyền của đúng những
 * đề thi mở trong ngày đó.
 */
function buildDailyTrend(exams) {
  const byDate = new Map();

  exams.forEach((exam) => {
    const dateKey = exam.openAt ? exam.openAt.slice(0, 10) : null;
    if (!dateKey || exam.submittedCount === 0) return;

    const entry = byDate.get(dateKey) ?? { dateKey, submissions: 0, weightedScore: 0 };
    entry.submissions += exam.submittedCount;
    entry.weightedScore += (exam.avgScore ?? 0) * exam.submittedCount;
    byDate.set(dateKey, entry);
  });

  return Array.from(byDate.values())
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((entry) => {
      const [, month, day] = entry.dateKey.split('-');
      return {
        id: entry.dateKey,
        label: `${day}/${month}`,
        submissions: entry.submissions,
        averageScore: round2(entry.weightedScore / (entry.submissions || 1)),
      };
    });
}

/** Xu hướng theo KỲ THI: một điểm dữ liệu cho mỗi đề thi đã có bài nộp. */
function buildExamTrend(exams) {
  return exams
    .filter((exam) => exam.submittedCount > 0)
    .sort((a, b) => (a.openAt ?? '').localeCompare(b.openAt ?? ''))
    .map((exam) => ({
      id: exam.id,
      label: exam.examCode,
      submissions: exam.submittedCount,
      averageScore: round2(exam.avgScore ?? 0),
    }));
}

/* ================================ KPI =================================== */

/** Dựng 4 thẻ KPI của Dashboard theo phạm vi phân công và học kỳ đang chọn. */
function buildKpis(semester, managedSubjectCodes) {
  const exams = getScopedExams(semester, managedSubjectCodes);
  const previousIndex = SEMESTER_CHRONOLOGY.indexOf(semester) - 1;
  const previousExams =
    previousIndex >= 0
      ? getScopedExams(SEMESTER_CHRONOLOGY[previousIndex], managedSubjectCodes)
      : [];

  const scopedQuestions = mockQuestionBank.filter((question) =>
    managedSubjectCodes.includes(question.subjectCode)
  );
  const essayCount = scopedQuestions.filter((question) => question.type === 'ESSAY').length;

  const candidateTotal = computeCandidateTotal(exams);
  const previousCandidateTotal = computeCandidateTotal(previousExams);

  const passRate = computeWeightedPassRate(exams);
  const previousPassRate = computeWeightedPassRate(previousExams);

  const alerts = getScopedFraudAlerts(managedSubjectCodes);
  const highRiskAlerts = alerts.filter((violation) => violation.riskLevel === 'HIGH').length;

  return [
    {
      id: 'kpi_students',
      icon: 'database',
      tone: 'primary',
      label: 'Tổng sinh viên dự thi',
      value: candidateTotal.toLocaleString('vi-VN'),
      delta:
        buildDeltaLabel(candidateTotal, previousCandidateTotal, 'lượt') ??
        `${exams.length} kỳ thi trong phạm vi phụ trách`,
    },
    {
      id: 'kpi_questions',
      icon: 'file',
      tone: 'primary',
      label: 'Ngân hàng câu hỏi',
      value: scopedQuestions.length.toLocaleString('vi-VN'),
      delta: `${essayCount} câu tự luận ngắn trong phạm vi phụ trách`,
    },
    {
      id: 'kpi_passrate',
      icon: 'check',
      tone: 'success',
      label: 'Tỷ lệ đạt trung bình',
      value: passRate === null ? '-' : `${passRate}%`,
      delta: passRate === null
        ? 'Chưa có đề thi nào kết thúc trong học kỳ này'
        : (buildDeltaLabel(passRate, previousPassRate, 'điểm phần trăm') ??
          (passRate >= 80 ? 'Trên ngưỡng an toàn 80%' : 'Dưới ngưỡng an toàn 80%')),
    },
    {
      id: 'kpi_alerts',
      icon: 'alert',
      tone: 'danger',
      label: 'Cảnh báo gian lận',
      value: alerts.length.toLocaleString('vi-VN'),
      delta:
        alerts.length === 0
          ? 'Không có vi phạm nào cần xử lý'
          : `${highRiskAlerts} mức rủi ro cao cần xử lý`,
    },
  ];
}

/* ============================ DASHBOARD THEO KỲ ========================== */

/** Dựng toàn bộ số liệu Dashboard cho một học kỳ và một giảng viên. */
export function buildTeacherDashboard(semester, teacherId = mockTeacherUser.id) {
  const managedSubjectCodes = getManagedSubjectCodes(teacherId) ?? mockTeacherUser.managedSubjects;
  const exams = getScopedExams(semester, managedSubjectCodes);
  const semesterLabel =
    TEACHER_SEMESTERS.find((item) => item.value === semester)?.label ?? semester;

  return {
    semester,
    semesterLabel,
    managedSubjectCodes,
    examCount: exams.length,
    kpis: buildKpis(semester, managedSubjectCodes),
    trend: {
      DAY: {
        label: `Xu hướng lượt nộp & điểm trung bình theo ngày mở đề - ${semesterLabel}`,
        items: buildDailyTrend(exams),
      },
      EXAM: {
        label: `Xu hướng lượt nộp & điểm trung bình theo kỳ thi - ${semesterLabel}`,
        items: buildExamTrend(exams),
      },
    },
    questionTypeDistribution: buildQuestionTypeDistribution(managedSubjectCodes),
    questionTotal: mockQuestionBank.filter((question) =>
      managedSubjectCodes.includes(question.subjectCode)
    ).length,
  };
}

/** Toàn bộ dữ liệu Dashboard, khóa theo học kỳ. */
export const mockTeacherDashboard = {
  /** Học kỳ đang diễn ra, suy từ đồng hồ hệ thống (xem shared/semesters.js). */
  currentSemester: CURRENT_SEMESTER,
  semesters: TEACHER_SEMESTERS,
  chartViewModes: TEACHER_CHART_VIEW_MODES,
  chartTypes: TEACHER_CHART_TYPES,
  totalExamCount: mockExams.length,
  bySemester: Object.fromEntries(
    TEACHER_SEMESTERS.map((semester) => [
      semester.value,
      buildTeacherDashboard(semester.value),
    ])
  ),
};

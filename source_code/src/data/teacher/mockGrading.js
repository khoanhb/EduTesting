/**
 * src/data/teacher/mockGrading.js
 *
 * Chấm điểm tự luận ngắn (2.8 GradeEssayPage) và thống kê chất lượng đề thi
 * (2.6 ExamAnalyticsPage).
 *
 * QUY TẮC CHẤM TỰ LUẬN NGẮN (FR-05.7 + FR-08.2 + FR-08.4):
 *   Giảng viên cấu hình một DANH SÁCH TỪ KHÓA cho mỗi câu. Hệ thống đối soát
 *   câu trả lời của thí sinh với danh sách đó và phân thành ba kết quả:
 *     - MATCHED_ALL      : khớp toàn bộ từ khóa   cộng điểm tối đa, AUTO_GRADED
 *     - MATCHED_PARTIAL  : khớp một phần từ khóa  chuyển sang chấm tay
 *     - NOT_MATCHED      : không khớp từ khóa nào  chuyển sang chấm tay
 *   Hai tùy chọn của câu hỏi điều khiển cách tính điểm gợi ý:
 *     - allowPartialKeywordScore : điểm gợi ý = tỉ lệ từ khóa khớp
 *     - isCaseSensitive          : có phân biệt hoa/thường khi so khớp
 *
 * Khi nối API:
 *   GET  /exams/{id}/pending-essays   mockEssaySubmissions
 *   PUT  /exams/{id}/grade-essays     cập nhật gradedScore
 *   GET  /exams/{id}/analytics        mockExamAnalytics
 */

import { getQuestionByCode, getQuestionsBySubject } from './mockQuestions';
import { getAnalyzableExams, getExamById, mockExams } from './mockExams';
import { mockStudents } from '../shared/organization';

/* =============================== NHÃN DÙNG CHUNG ========================== */

/** Ba kết quả so khớp tự động của một câu tự luận ngắn (FR-08.2). */
export const MATCH_RESULT_LABELS = {
  MATCHED_ALL: 'Khớp chính xác',
  MATCHED_PARTIAL: 'Khớp một phần từ khóa',
  NOT_MATCHED: 'Không khớp từ khóa',
};

/** Nhãn trạng thái chấm của một bài tự luận. */
export const ESSAY_STATUS_LABELS = {
  PENDING: 'Chờ chấm tay',
  AUTO_GRADED: 'Đã chấm tự động',
  GRADED: 'Đã chấm',
};

/** 3 lựa chọn chấm nhanh của Giảng viên (FR-08.3). */
export const QUICK_GRADE_OPTIONS = [
  { value: 'FULL', label: 'Đúng (100%)', ratio: 1, tone: 'success' },
  { value: 'PARTIAL', label: 'Đúng 1 phần (50%)', ratio: 0.5, tone: 'warning' },
  { value: 'ZERO', label: 'Sai (0đ)', ratio: 0, tone: 'danger' },
];

/** Số bài tự luận mỗi trang ở danh sách chấm bài (FR-08 - phân trang). */
export const ESSAY_PAGE_SIZE = 10;

/** Điểm tối đa của một câu tự luận ngắn trong đề. */
const ESSAY_MAX_SCORE = 0.5;

/** Thí sinh bị đình chỉ (hiển thị badge Đình chỉ + nút Xem biên bản ở FR-09.5). */
const SUSPENDED_STUDENT_IDS = ['52000041', '52000102'];

/* ========================= SO KHỚP TỪ KHÓA (FR-08.2) ====================== */

/** Chuẩn hóa chuỗi so khớp theo tùy chọn phân biệt hoa/thường. */
function normalizeForMatching(text, isCaseSensitive) {
  const trimmed = String(text ?? '').trim();
  return isCaseSensitive ? trimmed : trimmed.toLowerCase();
}

/**
 * Đối soát câu trả lời của thí sinh với danh sách từ khóa chuẩn của câu hỏi.
 * Khi nối Backend, toàn bộ logic này nằm ở API chấm tự động của FR-08.2.
 */
export function matchEssayAnswer(rawAnswer, question) {
  const keywords = question.acceptedKeywords ?? [];
  const isCaseSensitive = Boolean(question.isCaseSensitive);
  const allowPartialKeywordScore = Boolean(question.allowPartialKeywordScore);

  if (keywords.length === 0) {
    return {
      matchResult: 'NOT_MATCHED',
      matchedKeywords: [],
      matchedRatio: 0,
      aiSuggestedScore: 0,
      aiLabel: 'Câu hỏi chưa cấu hình từ khóa - chuyển sang chấm tay',
    };
  }

  const normalizedAnswer = normalizeForMatching(rawAnswer, isCaseSensitive);
  const matchedKeywords = keywords.filter((keyword) =>
    normalizedAnswer.includes(normalizeForMatching(keyword, isCaseSensitive))
  );
  const matchedRatio = matchedKeywords.length / keywords.length;

  if (matchedRatio === 1) {
    return {
      matchResult: 'MATCHED_ALL',
      matchedKeywords,
      matchedRatio,
      aiSuggestedScore: ESSAY_MAX_SCORE,
      aiLabel: `Khớp toàn bộ ${keywords.length} từ khóa - cộng điểm tối đa tự động`,
    };
  }

  if (matchedRatio > 0) {
    return {
      matchResult: 'MATCHED_PARTIAL',
      matchedKeywords,
      matchedRatio,
      aiSuggestedScore: Number((ESSAY_MAX_SCORE * matchedRatio).toFixed(2)),
      aiLabel: allowPartialKeywordScore
        ? `Khớp ${matchedKeywords.length}/${keywords.length} từ khóa - gợi ý ${(
            ESSAY_MAX_SCORE * matchedRatio
          ).toFixed(2)}/${ESSAY_MAX_SCORE} điểm, cần giảng viên xác nhận`
        : `Khớp ${matchedKeywords.length}/${keywords.length} từ khóa nhưng câu này yêu cầu đủ mọi từ khóa - cần chấm tay`,
    };
  }

  return {
    matchResult: 'NOT_MATCHED',
    matchedKeywords: [],
    matchedRatio: 0,
    aiSuggestedScore: 0,
    aiLabel: 'Không khớp từ khóa nào - cần chấm tay',
  };
}

/* ===================== BÀI TỰ LUẬN CHỜ ĐỐI SOÁT (2.8) ==================== */

/** Lấy danh sách câu tự luận ngắn thật của một môn từ Ngân hàng câu hỏi. */
function getEssayQuestions(subjectCode) {
  return getQuestionsBySubject(subjectCode).filter((question) => question.type === 'ESSAY');
}

/**
 * Sinh câu trả lời mẫu cho một câu tự luận dựa trên chính bộ từ khóa của câu hỏi,
 * để mọi kết quả so khớp (khớp đủ / khớp một phần / không khớp) đều xuất phát từ
 * dữ liệu thật thay vì chuỗi viết tay rời rạc.
 */
function buildSampleAnswer(question, variantIndex) {
  const keywords = question.acceptedKeywords ?? [];
  const [first, second] = keywords;

  switch (variantIndex % 6) {
    case 0:
      return first ?? '';
    case 1:
      return second ?? first ?? '';
    case 2:
      return first ? `${first} (theo bài giảng đã học)` : '';
    case 3:
      return second ?? '';
    case 4:
      return 'Em chưa nhớ rõ đáp án câu này';
    default:
      return 'không làm được';
  }
}

/** Dựng danh sách bài tự luận chờ chấm cho một đề thi. */
function buildEssaySubmissions({ examId, examCode, subjectCode, count }) {
  const exam = getExamById(examId);
  const questions = getEssayQuestions(subjectCode);
  if (!exam || questions.length === 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const student = mockStudents[index % mockStudents.length];
    const question = questions[index % questions.length];
    const studentAnswer = buildSampleAnswer(question, index);
    const match = matchEssayAnswer(studentAnswer, question);
    const testCode = String((index % 4) + 1).padStart(3, '0');
    const isAutoGraded = match.matchResult === 'MATCHED_ALL';

    return {
      id: `ES_${examId}_${String(index + 1).padStart(3, '0')}`,
      studentId: student.studentId,
      studentName: student.name,
      className: student.className,
      examId,
      examCode,
      subjectCode,
      subjectName: exam.subjectName,
      semester: exam.semester,
      testCode,
      questionCode: question.questionCode,
      questionContent: question.content,
      studentAnswer,
      acceptedKeywords: question.acceptedKeywords ?? [],
      allowPartialKeywordScore: Boolean(question.allowPartialKeywordScore),
      isCaseSensitive: Boolean(question.isCaseSensitive),
      matchResult: match.matchResult,
      matchedKeywords: match.matchedKeywords,
      maxScore: ESSAY_MAX_SCORE,
      aiSuggestedScore: match.aiSuggestedScore,
      aiLabel: match.aiLabel,
      gradedScore: isAutoGraded ? ESSAY_MAX_SCORE : null,
      teacherComment: null,
      status: isAutoGraded ? 'AUTO_GRADED' : 'PENDING',
    };
  });
}

/**
 * Danh sách bài tự luận ngắn chờ đối soát (FR-08.2).
 * Trải trên nhiều môn học để mỗi giảng viên đều có dữ liệu trong phạm vi được
 * phân công: Hệ cơ sở dữ liệu (502051), Lập trình Web (503120),
 * Nhập môn Trí tuệ nhân tạo (500510).
 */
export const mockEssaySubmissions = [
  ...buildEssaySubmissions({
    examId: 'EX_3004',
    examCode: 'LTW_GK_01',
    subjectCode: '503120',
    count: 24,
  }),
  ...buildEssaySubmissions({
    examId: 'EX_3007',
    examCode: 'LTW_CK_01',
    subjectCode: '503120',
    count: 13,
  }),
  ...buildEssaySubmissions({
    examId: 'EX_3001',
    examCode: 'CSDL_GK_01',
    subjectCode: '502051',
    count: 7,
  }),
  ...buildEssaySubmissions({
    examId: 'EX_3011',
    examCode: 'CSDL_ONTAP_C9',
    subjectCode: '502051',
    count: 8,
  }),
  ...buildEssaySubmissions({
    examId: 'EX_3002',
    examCode: 'CSDL_ONTAP_C3',
    subjectCode: '502051',
    count: 6,
  }),
  ...buildEssaySubmissions({
    examId: 'EX_3006',
    examCode: 'AI_QT01_01',
    subjectCode: '500510',
    count: 9,
  }),
];

/** Danh sách mã đề của một kỳ thi (dropdown Mã đề ở FR-08.2). */
export function getExamTestCodeOptions(examId) {
  const codes = Array.from(
    new Set(
      mockEssaySubmissions
        .filter((submission) => submission.examId === examId)
        .map((submission) => submission.testCode)
    )
  ).sort();

  return [
    { value: 'ALL', label: 'Tất cả mã đề' },
    ...codes.map((code) => ({ value: code, label: `Mã đề ${code}` })),
  ];
}

/* ================ THỐNG KÊ & PHÂN TÍCH CHẤT LƯỢNG ĐỀ (2.6) =============== */

/** Định dạng số cho nhãn khoảng phổ điểm (0, 0.5, 1, 1.5...). */
const formatRangeValue = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/**
 * Phổ điểm 0-10 chia theo bước 0.5 (FR-09.3), phân bố quanh điểm trung bình
 * bằng trọng số hình chuông nên số liệu biến thiên theo từng đề thi thay vì
 * hard-code một biểu đồ cố định.
 */
function buildScoreDistribution(avgScore, submittedCount) {
  const buckets = Array.from({ length: 20 }, (_, index) => {
    const from = index * 0.5;
    const to = from + 0.5;
    return {
      from,
      to,
      center: from + 0.25,
      range: `${formatRangeValue(from)}-${formatRangeValue(to)}`,
    };
  });

  const weights = buckets.map(
    (bucket) => Math.exp(-Math.pow(bucket.center - avgScore, 2) / 2.4) + 0.05
  );
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  /**
   * Phân bổ số bài vào từng khoảng điểm.
   *
   * Không làm tròn từng khoảng một: làm vậy tổng phổ điểm lệch khỏi số bài đã
   * nộp (mỗi khoảng lệch tối đa 0,5 bài), khiến biểu đồ phổ điểm mâu thuẫn với
   * chính con số "bài đã nộp" hiển thị ngay bên cạnh. Thay vào đó dùng phương
   * pháp "phần dư lớn nhất": lấy phần nguyên trước, rồi chia phần còn thiếu cho
   * các khoảng có phần thập phân lớn nhất, tổng luôn bằng đúng số bài đã nộp.
   */
  const exactCounts = weights.map((weight) => (weight / weightSum) * submittedCount);
  const counts = exactCounts.map((value) => Math.floor(value));
  let remainder = submittedCount - counts.reduce((sum, value) => sum + value, 0);

  const byLargestFraction = exactCounts
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  let cursor = 0;
  while (remainder > 0 && byLargestFraction.length > 0) {
    counts[byLargestFraction[cursor % byLargestFraction.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return buckets.map((bucket, index) => ({
    range: bucket.range,
    /**
     * `center` là điểm đại diện của khoảng, cần giữ lại để `deriveScoreStats`
     * suy ra trung vị / điểm cao nhất / thấp nhất từ chính phổ điểm này.
     */
    center: bucket.center,
    count: counts[index],
  }));
}

/** Suy ra trung vị / điểm cao nhất / điểm thấp nhất từ chính phổ điểm. */
function deriveScoreStats(distribution, fallbackScore) {
  const expanded = distribution
    .flatMap((bucket) => Array(bucket.count).fill(bucket.center))
    .sort((a, b) => a - b);

  if (expanded.length === 0) {
    return {
      median: fallbackScore,
      highestScore: fallbackScore,
      lowestScore: fallbackScore,
    };
  }

  return {
    median: Number(expanded[Math.floor(expanded.length / 2)].toFixed(2)),
    highestScore: Number(expanded[expanded.length - 1].toFixed(2)),
    lowestScore: Number(expanded[0].toFixed(2)),
  };
}

/**
 * Phân tích độ khó & độ phân hóa từng câu, dùng đúng câu hỏi thật của môn
 * trong Ngân hàng câu hỏi (FR-09.5).
 */
function buildQuestionAnalysis(subjectCode, questionCount) {
  const pool = getQuestionsBySubject(subjectCode);
  if (pool.length === 0) return [];

  return Array.from({ length: questionCount }, (_, index) => {
    const question = pool[index % pool.length];
    const correctRate = Math.max(12, Math.min(98, Math.round(70 + Math.sin(index * 2.3) * 32)));
    const difficulty = correctRate >= 80 ? 'EASY' : correctRate >= 55 ? 'MEDIUM' : 'HARD';

    return {
      questionNo: index + 1,
      questionCode: question.questionCode,
      content: question.content,
      type: question.type,
      difficulty,
      correctRate,
      remark:
        correctRate < 40
          ? 'Quá khó - tỉ lệ làm đúng thấp, phương án nhiễu chưa hiệu quả'
          : correctRate > 90
            ? 'Quá dễ - không đủ độ phân hóa thí sinh'
            : null,
    };
  });
}

/**
 * Nhận xét AI dạng văn bản tự nhiên (FR-09.4).
 * Đây là KẾT QUẢ MOCK do hệ thống phân tích sinh ra (tương ứng field dữ liệu
 * `aiInsights` của GET /exams/{id}/analytics), không phải lời gọi AI thời gian thực.
 */
function buildAiInsights(questionAnalysis, avgScore, examCode) {
  if (questionAnalysis.length === 0) return [];

  const hardest = [...questionAnalysis].sort((a, b) => a.correctRate - b.correctRate)[0];
  const easiest = [...questionAnalysis].sort((a, b) => b.correctRate - a.correctRate)[0];

  return [
    {
      id: 'hardest',
      text: `Câu ${hardest.questionNo} (mã ${hardest.questionCode}) chỉ đạt tỉ lệ làm đúng ${hardest.correctRate}% - độ khó vượt đáng kể so với mặt bằng chung của đề ${examCode}. Nên rà soát lại phương án nhiễu hoặc bổ sung phần ôn tập tương ứng trước kỳ thi kế tiếp.`,
    },
    {
      id: 'easiest',
      text: `Câu ${easiest.questionNo} (mã ${easiest.questionCode}) đạt tỉ lệ làm đúng ${easiest.correctRate}% - câu quá dễ, gần như không phân hóa được năng lực thí sinh. Cân nhắc thay bằng câu hỏi vận dụng ở mức độ khó hơn.`,
    },
    {
      id: 'overall',
      text: `Điểm trung bình toàn đề đạt ${avgScore}/10, phổ điểm tập trung ở khoảng trung bình khá. Đề thi có độ phân hóa tương đối tốt nhưng vẫn còn dư địa để cân bằng lại tỉ lệ câu dễ và câu khó.`,
    },
  ];
}

/* ======================== BẢNG ĐIỂM DANH SÁCH LỚP (FR-09.5) ============== */

/** Nội dung đáp án đúng của một câu, hiển thị được cho giảng viên. */
function formatCorrectAnswer(question) {
  if (!question) return '';
  if (question.type === 'ESSAY') return (question.correctAnswers ?? []).join(' / ');

  return (question.correctAnswers ?? [])
    .map((key) => {
      const option = (question.options ?? []).find((item) => item.key === key);
      return option ? `${option.text}` : key;
    })
    .join(' | ');
}

/** Một phương án sai (nhiễu) của câu hỏi, dùng cho thí sinh làm sai. */
function formatWrongAnswer(question) {
  if (!question || question.type === 'ESSAY') return 'Đáp án chưa chính xác';
  const wrongOption = (question.options ?? []).find(
    (option) => !(question.correctAnswers ?? []).includes(option.key)
  );
  return wrongOption ? wrongOption.text : 'Đáp án chưa chính xác';
}

/** Dựng chi tiết từng câu làm đúng/sai của một thí sinh (Modal xem bài làm). */
function buildStudentAnswers(questionAnalysis, { correct, wrong }) {
  const total = Math.min(10, questionAnalysis.length);

  return Array.from({ length: total }, (_, index) => {
    const entry = questionAnalysis[index];
    const question = getQuestionByCode(entry.questionCode);
    const isCorrect = index < correct;
    const isWrong = !isCorrect && index < correct + wrong;

    return {
      questionNo: entry.questionNo,
      questionCode: entry.questionCode,
      content: entry.content,
      type: entry.type,
      difficulty: entry.difficulty,
      studentAnswer: isCorrect
        ? formatCorrectAnswer(question)
        : isWrong
          ? formatWrongAnswer(question)
          : '',
      correctAnswer: formatCorrectAnswer(question),
      isCorrect,
      isUnanswered: !isCorrect && !isWrong,
      points: isCorrect ? 0.25 : 0,
      maxPoints: 0.25,
    };
  });
}

/**
 * Hồ sơ điểm số mẫu dùng để dựng bảng điểm danh sách lớp.
 * Điểm tổng kết = điểm trắc nghiệm + điểm tự luận (FR-08.4); với thí sinh bị
 * đình chỉ, điểm hiển thị là điểm đã xử lý theo hình thức kỷ luật (trừ 50%).
 */
const SCORE_PROFILES = [
  { mcqScore: 7.0, essayScore: 1.5, correct: 26, wrong: 3, unanswered: 1 },
  { mcqScore: 8.25, essayScore: 1.0, correct: 28, wrong: 2, unanswered: 0 },
  { mcqScore: 5.0, essayScore: 0.5, correct: 16, wrong: 12, unanswered: 2 },
  { mcqScore: 7.25, essayScore: 0.5, correct: 23, wrong: 5, unanswered: 2 },
  { mcqScore: 2.0, essayScore: 0, correct: 12, wrong: 17, unanswered: 1 },
  { mcqScore: 6.5, essayScore: 0.25, correct: 20, wrong: 8, unanswered: 2 },
  { mcqScore: 9.5, essayScore: 0.5, correct: 30, wrong: 0, unanswered: 0 },
  { mcqScore: 2.0, essayScore: 0.5, correct: 7, wrong: 22, unanswered: 1 },
  { mcqScore: 6.0, essayScore: 1.0, correct: 19, wrong: 9, unanswered: 2 },
  { mcqScore: 7.75, essayScore: 0.5, correct: 24, wrong: 4, unanswered: 2 },
  { mcqScore: 5.5, essayScore: 1.5, correct: 18, wrong: 10, unanswered: 2 },
  { mcqScore: 8.75, essayScore: 0.25, correct: 27, wrong: 2, unanswered: 1 },
  { mcqScore: 4.25, essayScore: 0.5, correct: 14, wrong: 14, unanswered: 2 },
  { mcqScore: 9.0, essayScore: 0.5, correct: 29, wrong: 1, unanswered: 0 },
  { mcqScore: 6.75, essayScore: 0.75, correct: 22, wrong: 7, unanswered: 1 },
  { mcqScore: 3.5, essayScore: 0.25, correct: 13, wrong: 16, unanswered: 1 },
  { mcqScore: 7.5, essayScore: 1.0, correct: 25, wrong: 4, unanswered: 1 },
  { mcqScore: 5.75, essayScore: 0.5, correct: 17, wrong: 11, unanswered: 2 },
  { mcqScore: 8.0, essayScore: 0.5, correct: 26, wrong: 3, unanswered: 1 },
  { mcqScore: 6.25, essayScore: 0.75, correct: 21, wrong: 8, unanswered: 1 },
];

/** Hình thức kỷ luật áp dụng cho thí sinh bị đình chỉ trong bảng điểm. */
const SUSPENSION_PENALTY_RATE = 0.5;

const pad2 = (value) => String(value).padStart(2, '0');

/** Thời điểm nộp bài của thí sinh trong ca thi, suy từ giờ khóa đề. */
function buildSubmittedAt(exam, index) {
  const base = new Date(exam.closeAt ?? exam.openAt ?? '2026-05-01T09:00');
  base.setMinutes(base.getMinutes() - (index * 3 + 5));

  const text = `${pad2(base.getDate())}/${pad2(base.getMonth() + 1)}/${base.getFullYear()} ${pad2(
    base.getHours()
  )}:${pad2(base.getMinutes())}`;

  return {
    submittedAt: text,
    submittedAtIso: `${base.getFullYear()}-${pad2(base.getMonth() + 1)}-${pad2(
      base.getDate()
    )}T${pad2(base.getHours())}:${pad2(base.getMinutes())}`,
  };
}

/** Dựng bảng điểm danh sách lớp cho một đề thi. */
function buildStudentScores(exam, questionAnalysis) {
  return mockStudents.map((student, index) => {
    const profile = SCORE_PROFILES[index % SCORE_PROFILES.length];
    const isSuspended = SUSPENDED_STUDENT_IDS.includes(student.studentId);
    const rawTotal = profile.mcqScore + profile.essayScore;
    const totalScore = Number(
      (isSuspended ? rawTotal * SUSPENSION_PENALTY_RATE : rawTotal).toFixed(2)
    );
    const { submittedAt, submittedAtIso } = buildSubmittedAt(exam, index);

    return {
      studentId: student.studentId,
      name: student.name,
      className: student.className,
      class: student.className,
      mcqScore: profile.mcqScore,
      essayScore: profile.essayScore,
      rawTotalScore: Number(rawTotal.toFixed(2)),
      totalScore,
      correct: profile.correct,
      wrong: profile.wrong,
      unanswered: profile.unanswered,
      submittedAt,
      submittedAtIso,
      status: isSuspended ? 'Đình chỉ' : 'Hoàn thành',
      isSuspended,
      answers: buildStudentAnswers(questionAnalysis, profile),
    };
  });
}

/* =========================== BẢN GHI PHÂN TÍCH ============================ */

/** Dựng một bản ghi phân tích từ dữ liệu đề thi thật. */
function buildExamAnalytics(exam) {
  const avgScore = Number(exam.avgScore);
  const distribution = buildScoreDistribution(avgScore, exam.submittedCount);
  const { median, highestScore, lowestScore } = deriveScoreStats(distribution, avgScore);
  const questionAnalysis = buildQuestionAnalysis(exam.subjectCode, exam.questionsCount);
  const passRate = exam.passRate ?? 0;

  return {
    examId: exam.id,
    examCode: exam.examCode,
    subjectCode: exam.subjectCode,
    subjectName: exam.subjectName,
    departmentId: exam.departmentId,
    semester: exam.semester,
    category: exam.category,
    totalStudents: exam.candidateCount,
    submitted: exam.submittedCount,
    avgScore,
    median,
    highestScore,
    lowestScore,
    passCount: Math.round((passRate / 100) * exam.submittedCount),
    passRate,
    scoreDistribution: distribution,
    questionAnalysis,
    aiInsights: buildAiInsights(questionAnalysis, avgScore, exam.examCode),
    studentScores: buildStudentScores(exam, questionAnalysis),
  };
}

/**
 * Dữ liệu thống kê & phân tích chất lượng đề thi (FR-09).
 * Chỉ gồm các đề đã có kết quả. Khi nối API: GET /exams/{id}/analytics
 */
export const mockExamAnalytics = Object.fromEntries(
  getAnalyzableExams().map((exam) => [exam.id, buildExamAnalytics(exam)])
);

/** Danh sách đề thi có thể mở màn hình thống kê (dùng cho bộ lọc FR-09.1). */
export const getAnalyticsExamOptions = () =>
  mockExams
    .filter((exam) => mockExamAnalytics[exam.id])
    .map((exam) => ({ value: exam.id, label: `${exam.examCode} - ${exam.subjectName}` }));

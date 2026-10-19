/**
 * src/data/teacher/mockQuestions.js
 *
 * Ngân hàng câu hỏi là nguồn dữ liệu dùng chung cho:
 *   - Ngân hàng câu hỏi (2.1), Thêm/Sửa câu hỏi (2.2), Sinh câu hỏi AI (2.3)
 *   - Ma trận đề thi (2.4/2.5)
 *   - Thống kê & Phân tích độ khó (2.6) và Chấm tự luận ngắn (2.8)
 *
 * Quy tắc chấm câu TỰ LUẬN NGẮN / ĐIỀN TỪ (FR-05.7 + FR-08.2):
 *   Hệ thống so khớp câu trả lời của thí sinh với DANH SÁCH TỪ KHÓA do giảng viên
 *   cấu hình. Không tồn tại chế độ "khớp chuỗi ký tự" tách rời khỏi từ khóa; chỉ
 *   có hai tùy chọn do giảng viên bật/tắt:
 *     - allowPartialKeywordScore : cho phép tính điểm theo từng từ khóa khớp
 *       (bỏ chọn ⇒ phải khớp đủ mọi từ khóa mới được điểm).
 *     - isCaseSensitive : phân biệt chữ hoa / chữ thường khi so khớp.
 *
 * Khi nối API: GET /questions?subjectCode=&chapterId=&difficulty=&type=
 */

import { mockSubjects, getSubjectById } from './mockSubjects';

/** Nhãn hiển thị của 4 loại câu hỏi (khóa cứng toàn hệ thống). */
export const QUESTION_TYPE_LABELS = {
  MCQ_SINGLE: 'Chọn 1 đáp án đúng',
  MCQ_MULTIPLE: 'Chọn nhiều đáp án đúng',
  TRUE_FALSE: 'Đúng / Sai',
  ESSAY: 'Tự luận ngắn / Điền từ',
};

/** Thứ tự hiển thị của các loại câu hỏi trên biểu đồ phân bổ. */
export const QUESTION_TYPE_ORDER = ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'ESSAY'];

/** Màu tương ứng từng loại câu hỏi (dùng cho biểu đồ phân bổ ngân hàng đề). */
export const QUESTION_TYPE_COLORS = {
  MCQ_SINGLE: '#06B6D4',
  MCQ_MULTIPLE: '#6366F1',
  TRUE_FALSE: '#10B981',
  ESSAY: '#F59E0B',
};

/** Nhãn hiển thị của 3 mức độ khó. */
export const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

/** Nhãn tùy chọn chấm điểm của câu tự luận ngắn (FR-05.7). */
export const ESSAY_SCORING_RULE_LABELS = {
  ALL_KEYWORDS_REQUIRED: 'Phải khớp đủ mọi từ khóa mới được điểm',
  PARTIAL_KEYWORD_SCORE: 'Cho phép tính điểm theo từng từ khóa khớp',
};

/** Nhãn tùy chọn phân biệt chữ hoa / chữ thường khi so khớp từ khóa. */
export const ESSAY_CASE_RULE_LABELS = {
  INSENSITIVE: 'Không phân biệt chữ hoa / chữ thường',
  SENSITIVE: 'Phân biệt chữ hoa / chữ thường',
};

/** Số lần vi phạm tối đa trước khi tự động đình chỉ bài thi (FR-10.5). */
export const MAX_VIOLATION_LIMIT = 3;

/**
 * Từ khóa mặc định của một câu tự luận ngắn chưa cấu hình gì:
 * bắt buộc khớp đủ mọi từ khóa và không phân biệt hoa thường.
 */
export const DEFAULT_ESSAY_KEYWORD_RULES = {
  allowPartialKeywordScore: false,
  isCaseSensitive: false,
};

/**
 * Kho câu hỏi gốc. Mỗi câu hỏi luôn có `questionCode` (mã câu hiển thị xuyên
 * suốt hệ thống), `subjectCode` + `chapterId` (quan hệ môn học/chương),
 * `type`, `difficulty`, `options`, `correctAnswers` và `explanation`.
 * Riêng câu tự luận ngắn có `acceptedKeywords` kèm hai tùy chọn chấm ở trên.
 */
const rawQuestions = [
  // ── Hệ cơ sở dữ liệu ────────────────────────────────────────────────────────
  {
    id: 'Q_1001',
    code: 'CSDL_C2_001',
    subjectCode: '502051',
    chapterId: 'CH_02',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Trong mô hình quan hệ, thuộc tính dùng để xác định duy nhất một bộ giá trị được gọi là gì?',
    options: [
      { key: 'A', text: 'Khóa ngoại (Foreign Key)' },
      { key: 'B', text: 'Khóa chính (Primary Key)' },
      { key: 'C', text: 'Khóa dự tuyển (Candidate Key)' },
      { key: 'D', text: 'Thuộc tính đa trị' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation:
      'Khóa chính là một hoặc một tập thuộc tính tối thiểu xác định duy nhất một bộ giá trị trong quan hệ.',
    createdBy: 'GV2026_0982',
    createdAt: '02/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1002',
    code: 'CSDL_C2_002',
    subjectCode: '502051',
    chapterId: 'CH_02',
    type: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    content: 'Các điều kiện nào sau đây bắt buộc đối với một khóa chính (Primary Key)?',
    options: [
      { key: 'A', text: 'Giá trị không được phép trùng lặp giữa các bản ghi.' },
      { key: 'B', text: 'Không được phép nhận giá trị NULL (rỗng).' },
      { key: 'C', text: 'Phải luôn mang kiểu dữ liệu số nguyên (Integer).' },
      { key: 'D', text: 'Có thể tự động tăng giá trị khi chèn bản ghi mới.' },
    ],
    correctAnswers: ['A', 'B'],
    acceptedKeywords: [],
    explanation:
      'Khóa chính phải tuân thủ hai quy tắc: tính duy nhất (Unique) và toàn vẹn thực thể (Not NULL).',
    createdBy: 'GV2026_0982',
    createdAt: '02/03/2026',
    usageCount: 4,
  },
  {
    id: 'Q_1003',
    code: 'CSDL_C2_003',
    subjectCode: '502051',
    chapterId: 'CH_02',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Một bảng trong cơ sở dữ liệu quan hệ có thể tồn tại nhiều khóa chính cùng lúc.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['FALSE'],
    acceptedKeywords: [],
    explanation: 'Mỗi bảng chỉ được phép có duy nhất một khóa chính.',
    createdBy: 'GV2026_0982',
    createdAt: '03/03/2026',
    usageCount: 8,
  },
  {
    id: 'Q_1004',
    code: 'CSDL_C2_004',
    subjectCode: '502051',
    chapterId: 'CH_02',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Trong mô hình quan hệ, thuộc tính dùng để xác định duy nhất một bộ được gọi là gì? (Điền từ khóa)',
    options: [],
    correctAnswers: ['Khóa chính'],
    acceptedKeywords: ['Khóa chính', 'Primary Key', 'PK'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'Khóa chính (Primary Key) xác định duy nhất một bộ giá trị trong quan hệ.',
    createdBy: 'GV2026_0982',
    createdAt: '03/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1005',
    code: 'CSDL_C3_001',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Trong SQL, lệnh dùng để truy vấn và lấy dữ liệu từ một hoặc nhiều bảng là gì?',
    options: [
      { key: 'A', text: 'ADD' },
      { key: 'B', text: 'INSERT' },
      { key: 'C', text: 'SELECT' },
      { key: 'D', text: 'DELETE' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'SELECT là lệnh SQL dùng để truy vấn và lấy dữ liệu.',
    createdBy: 'GV2026_0982',
    createdAt: '05/03/2026',
    usageCount: 11,
  },
  {
    id: 'Q_1006',
    code: 'CSDL_C3_002',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những mệnh đề nào sau đây thuộc nhóm ngôn ngữ định nghĩa dữ liệu (DDL) trong SQL?',
    options: [
      { key: 'A', text: 'CREATE TABLE' },
      { key: 'B', text: 'ALTER TABLE' },
      { key: 'C', text: 'SELECT ... FROM' },
      { key: 'D', text: 'DROP TABLE' },
    ],
    correctAnswers: ['A', 'B', 'D'],
    acceptedKeywords: [],
    explanation: 'DDL gồm CREATE, ALTER, DROP, TRUNCATE; SELECT thuộc nhóm DML.',
    createdBy: 'GV2026_0982',
    createdAt: '05/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1007',
    code: 'CSDL_C3_003',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Mệnh đề nào dùng để lọc dữ liệu sau khi đã gom nhóm bằng GROUP BY?',
    options: [
      { key: 'A', text: 'WHERE' },
      { key: 'B', text: 'HAVING' },
      { key: 'C', text: 'ORDER BY' },
      { key: 'D', text: 'LIMIT' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'WHERE lọc trước khi gom nhóm, HAVING lọc sau khi gom nhóm.',
    createdBy: 'GV2026_0982',
    createdAt: '06/03/2026',
    usageCount: 7,
  },
  {
    id: 'Q_1008',
    code: 'CSDL_C4_001',
    subjectCode: '502051',
    chapterId: 'CH_04',
    type: 'MCQ_SINGLE',
    difficulty: 'HARD',
    content: 'Dạng chuẩn nào loại bỏ hoàn toàn phụ thuộc bắc cầu giữa các thuộc tính không khóa?',
    options: [
      { key: 'A', text: 'Dạng chuẩn 1 (1NF)' },
      { key: 'B', text: 'Dạng chuẩn 2 (2NF)' },
      { key: 'C', text: 'Dạng chuẩn 3 (3NF)' },
      { key: 'D', text: 'Dạng chuẩn Boyce-Codd (BCNF)' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: '3NF loại bỏ phụ thuộc bắc cầu của thuộc tính không khóa vào khóa chính.',
    createdBy: 'GV2026_0982',
    createdAt: '08/03/2026',
    usageCount: 2,
  },
  {
    id: 'Q_1009',
    code: 'CSDL_C1_001',
    subjectCode: '502051',
    chapterId: 'CH_01',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Hệ quản trị cơ sở dữ liệu (DBMS) là phần mềm cho phép người dùng định nghĩa, truy xuất và quản trị dữ liệu.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation:
      'DBMS cung cấp ngôn ngữ định nghĩa dữ liệu, ngôn ngữ thao tác dữ liệu và cơ chế kiểm soát truy cập.',
    createdBy: 'GV2026_1692',
    createdAt: '01/03/2026',
    usageCount: 9,
  },
  {
    id: 'Q_1010',
    code: 'CSDL_C5_001',
    subjectCode: '502051',
    chapterId: 'CH_05',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Tính chất nào KHÔNG thuộc bộ 4 tính chất ACID của giao dịch?',
    options: [
      { key: 'A', text: 'Atomicity (Tính nguyên tử)' },
      { key: 'B', text: 'Consistency (Tính nhất quán)' },
      { key: 'C', text: 'Scalability (Tính mở rộng)' },
      { key: 'D', text: 'Durability (Tính bền vững)' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'ACID gồm Atomicity, Consistency, Isolation, Durability, không có Scalability.',
    createdBy: 'GV2026_0982',
    createdAt: '10/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1011',
    code: 'CSDL_C5_002',
    subjectCode: '502051',
    chapterId: 'CH_05',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Hiện tượng hai giao dịch cùng chờ khóa của nhau và không giao dịch nào chạy tiếp được gọi là gì?',
    options: [],
    correctAnswers: ['Deadlock'],
    acceptedKeywords: ['Deadlock', 'Bế tắc', 'Khóa chết'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'Deadlock (khóa chết) xảy ra khi hai hay nhiều giao dịch chờ khóa của nhau tạo thành chu trình.',
    createdBy: 'GV2026_0982',
    createdAt: '10/03/2026',
    usageCount: 4,
  },

  // ── Tổ chức máy tính ─────────────────────────────────────────────────────────
  {
    id: 'Q_1012',
    code: 'TCMT_C1_001',
    subjectCode: '501042',
    chapterId: 'CH_11',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Số nhị phân 1011 khi chuyển sang hệ thập phân có giá trị bằng bao nhiêu?',
    options: [
      { key: 'A', text: '9' },
      { key: 'B', text: '11' },
      { key: 'C', text: '13' },
      { key: 'D', text: '15' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: '1011₂ = 8 + 0 + 2 + 1 = 11.',
    createdBy: 'GV2026_0982',
    createdAt: '12/03/2026',
    usageCount: 10,
  },
  {
    id: 'Q_1013',
    code: 'TCMT_C1_002',
    subjectCode: '501042',
    chapterId: 'CH_11',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    content: 'Biểu diễn số bù hai (two\'s complement) cho phép biểu diễn số âm mà phép cộng không cần xử lý riêng dấu.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'Bù hai biến phép trừ thành phép cộng với số bù, đơn giản hóa mạch số học.',
    createdBy: 'GV2026_0982',
    createdAt: '12/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1014',
    code: 'TCMT_C4_001',
    subjectCode: '501042',
    chapterId: 'CH_14',
    type: 'MCQ_SINGLE',
    difficulty: 'HARD',
    content: 'Ưu điểm chính của bộ nhớ đệm (Cache) trong phân cấp bộ nhớ là gì?',
    options: [
      { key: 'A', text: 'Dung lượng lưu trữ lớn hơn bộ nhớ chính.' },
      { key: 'B', text: 'Giảm thời gian truy cập trung bình nhờ nguyên lý cục bộ.' },
      { key: 'C', text: 'Lưu dữ liệu vĩnh viễn khi mất điện.' },
      { key: 'D', text: 'Thay thế hoàn toàn bộ nhớ chính.' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'Cache tận dụng tính cục bộ về thời gian và không gian để giảm thời gian truy cập trung bình.',
    createdBy: 'GV2026_0982',
    createdAt: '15/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1015',
    code: 'TCMT_C3_001',
    subjectCode: '501042',
    chapterId: 'CH_13',
    type: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    content: 'Những thành phần nào sau đây thuộc kiến trúc tập lệnh (ISA) của một bộ xử lý?',
    options: [
      { key: 'A', text: 'Tập lệnh và định dạng lệnh.' },
      { key: 'B', text: 'Tập thanh ghi kiến trúc.' },
      { key: 'C', text: 'Các chế độ địa chỉ hóa bộ nhớ.' },
      { key: 'D', text: 'Sơ đồ bố trí transistor trong ALU.' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    acceptedKeywords: [],
    explanation: 'ISA mô tả giao diện lập trình của CPU; bố trí transistor là chi tiết vi kiến trúc.',
    createdBy: 'GV2026_0982',
    createdAt: '16/03/2026',
    usageCount: 2,
  },
  {
    id: 'Q_1023',
    code: 'TCMT_C2_001',
    subjectCode: '501042',
    chapterId: 'CH_12',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Cổng logic nào cho ngõ ra bằng 1 khi và chỉ khi TẤT CẢ các ngõ vào đều bằng 1?',
    options: [
      { key: 'A', text: 'Cổng AND' },
      { key: 'B', text: 'Cổng OR' },
      { key: 'C', text: 'Cổng XOR' },
      { key: 'D', text: 'Cổng NOR' },
    ],
    correctAnswers: ['A'],
    acceptedKeywords: [],
    explanation: 'Cổng AND chỉ cho ngõ ra 1 khi mọi ngõ vào bằng 1.',
    createdBy: 'GV2026_0982',
    createdAt: '13/03/2026',
    usageCount: 7,
  },
  {
    id: 'Q_1024',
    code: 'TCMT_C2_002',
    subjectCode: '501042',
    chapterId: 'CH_12',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    content: 'Flip-Flop là phần tử nhớ có khả năng lưu trữ một bit trạng thái.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'Flip-Flop là mạch tuần tự có khả năng nhớ 1 bit nhờ hồi tiếp trạng thái.',
    createdBy: 'GV2026_0982',
    createdAt: '13/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1025',
    code: 'TCMT_C3_002',
    subjectCode: '501042',
    chapterId: 'CH_13',
    type: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    content: 'Những chế độ địa chỉ hóa nào sau đây thường thuộc kiến trúc tập lệnh (ISA)?',
    options: [
      { key: 'A', text: 'Địa chỉ tức thời (Immediate addressing).' },
      { key: 'B', text: 'Địa chỉ trực tiếp (Direct addressing).' },
      { key: 'C', text: 'Địa chỉ gián tiếp qua thanh ghi (Register indirect).' },
      { key: 'D', text: 'Địa chỉ vật lý của sector trên ổ cứng.' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    acceptedKeywords: [],
    explanation: 'Địa chỉ sector ổ cứng thuộc tầng lưu trữ, không phải chế độ địa chỉ hóa của ISA.',
    createdBy: 'GV2026_0982',
    createdAt: '16/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1026',
    code: 'TCMT_C4_002',
    subjectCode: '501042',
    chapterId: 'CH_14',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Cấp bộ nhớ nào trong phân cấp bộ nhớ có tốc độ truy cập nhanh nhất? (Điền từ khóa)',
    options: [],
    correctAnswers: ['Thanh ghi'],
    acceptedKeywords: ['Thanh ghi', 'Register'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'Thanh ghi (register) nằm trong CPU nên có tốc độ truy cập nhanh nhất.',
    createdBy: 'GV2026_0982',
    createdAt: '17/03/2026',
    usageCount: 4,
  },

  // ── Lập trình Web với React ──────────────────────────────────────────────────
  {
    id: 'Q_1016',
    code: 'LTW_C2_001',
    subjectCode: '503120',
    chapterId: 'CH_22',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Props trong React có đặc điểm nào sau đây?',
    options: [
      { key: 'A', text: 'Có thể bị component con ghi đè trực tiếp.' },
      { key: 'B', text: 'Chỉ đọc (read-only) và truyền từ cha xuống con.' },
      { key: 'C', text: 'Chỉ tồn tại trong class component.' },
      { key: 'D', text: 'Bắt buộc phải khai báo bằng useState.' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'Props là dữ liệu chỉ đọc, luồng dữ liệu một chiều từ component cha xuống con.',
    createdBy: 'GV2026_1692',
    createdAt: '18/03/2026',
    usageCount: 7,
  },
  {
    id: 'Q_1017',
    code: 'LTW_C3_001',
    subjectCode: '503120',
    chapterId: 'CH_23',
    type: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    content: 'Những Hook nào sau đây được cung cấp sẵn bởi React?',
    options: [
      { key: 'A', text: 'useState' },
      { key: 'B', text: 'useEffect' },
      { key: 'C', text: 'useMemo' },
      { key: 'D', text: 'useDatabase' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    acceptedKeywords: [],
    explanation: 'useDatabase không phải Hook chuẩn của React.',
    createdBy: 'GV2026_1692',
    createdAt: '18/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1018',
    code: 'LTW_C3_002',
    subjectCode: '503120',
    chapterId: 'CH_23',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Hook dùng để chạy hiệu ứng phụ (side effect) sau khi render trong React tên là gì?',
    options: [],
    correctAnswers: ['useEffect'],
    acceptedKeywords: ['useEffect'],
    allowPartialKeywordScore: false,
    isCaseSensitive: false,
    explanation: 'useEffect chạy sau mỗi lần render theo mảng phụ thuộc khai báo.',
    createdBy: 'GV2026_1692',
    createdAt: '19/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1027',
    code: 'LTW_C1_001',
    subjectCode: '503120',
    chapterId: 'CH_21',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Thẻ HTML nào dùng để khai báo siêu dữ liệu (metadata) của trang web?',
    options: [
      { key: 'A', text: '<body>' },
      { key: 'B', text: '<meta>' },
      { key: 'C', text: '<title>' },
      { key: 'D', text: '<link>' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'Thẻ <meta> nằm trong <head>, cung cấp metadata cho trang.',
    createdBy: 'GV2026_1692',
    createdAt: '17/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1028',
    code: 'LTW_C2_002',
    subjectCode: '503120',
    chapterId: 'CH_22',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Cách nào sau đây KHÔNG nên dùng để thay đổi giá trị state trong React?',
    options: [
      { key: 'A', text: 'Gọi hàm setter trả về từ useState.' },
      { key: 'B', text: 'Truyền hàm updater vào setter.' },
      { key: 'C', text: 'Gán trực tiếp biến state một giá trị mới.' },
      { key: 'D', text: 'Cập nhật state trong một event handler.' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'Gán trực tiếp biến state không kích hoạt re-render và phá vỡ tính bất biến.',
    createdBy: 'GV2026_1692',
    createdAt: '19/03/2026',
    usageCount: 8,
  },
  {
    id: 'Q_1029',
    code: 'LTW_C2_003',
    subjectCode: '503120',
    chapterId: 'CH_22',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Khi render danh sách bằng map() trong React, mỗi phần tử cần được gán prop key duy nhất.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'key giúp React nhận diện phần tử nào thay đổi, thêm hoặc xoá khi diff cây ảo.',
    createdBy: 'GV2026_1692',
    createdAt: '19/03/2026',
    usageCount: 9,
  },
  {
    id: 'Q_1030',
    code: 'LTW_C4_001',
    subjectCode: '503120',
    chapterId: 'CH_24',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những kỹ thuật nào sau đây giúp tối ưu hiệu năng một ứng dụng React SPA?',
    options: [
      { key: 'A', text: 'Bọc component bằng React.memo.' },
      { key: 'B', text: 'Dùng useMemo / useCallback cho tính toán đắt đỏ.' },
      { key: 'C', text: 'Chia nhỏ bundle với React.lazy + Suspense.' },
      { key: 'D', text: 'Render lại toàn bộ cây component mỗi khi state thay đổi.' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    acceptedKeywords: [],
    explanation: 'Render lại toàn cây mỗi lần state đổi là nguyên nhân chính gây giảm hiệu năng.',
    createdBy: 'GV2026_1692',
    createdAt: '20/03/2026',
    usageCount: 4,
  },
  {
    id: 'Q_1031',
    code: 'LTW_C4_002',
    subjectCode: '503120',
    chapterId: 'CH_24',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Kỹ thuật chia nhỏ bundle JavaScript và chỉ tải phần cần thiết trong ứng dụng SPA gọi là gì? (Điền từ khóa)',
    options: [],
    correctAnswers: ['Code splitting'],
    acceptedKeywords: ['Code splitting', 'Code-splitting', 'Lazy load'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'Code splitting kết hợp lazy loading giúp giảm kích thước bundle tải ban đầu.',
    createdBy: 'GV2026_1692',
    createdAt: '21/03/2026',
    usageCount: 5,
  },

  // ── An toàn thông tin ────────────────────────────────────────────────────────
  {
    id: 'Q_1019',
    code: 'ATTT_C2_001',
    subjectCode: '504210',
    chapterId: 'CH_32',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Thuật toán nào sau đây là mã hóa bất đối xứng (public-key)?',
    options: [
      { key: 'A', text: 'AES' },
      { key: 'B', text: 'DES' },
      { key: 'C', text: 'RSA' },
      { key: 'D', text: 'Blowfish' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'RSA dùng cặp khóa công khai/riêng tư; AES, DES, Blowfish là mã hóa đối xứng.',
    createdBy: 'GV2026_0871',
    createdAt: '20/03/2026',
    usageCount: 8,
  },
  {
    id: 'Q_1020',
    code: 'ATTT_C4_001',
    subjectCode: '504210',
    chapterId: 'CH_34',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những biện pháp nào giúp phòng chống tấn công SQL Injection?',
    options: [
      { key: 'A', text: 'Sử dụng truy vấn tham số hóa (prepared statement).' },
      { key: 'B', text: 'Kiểm tra và lọc dữ liệu đầu vào.' },
      { key: 'C', text: 'Ghép chuỗi truy vấn trực tiếp từ dữ liệu người dùng.' },
      { key: 'D', text: 'Phân quyền tối thiểu cho tài khoản kết nối CSDL.' },
    ],
    correctAnswers: ['A', 'B', 'D'],
    acceptedKeywords: [],
    explanation: 'Ghép chuỗi trực tiếp là nguyên nhân chính gây SQL Injection.',
    createdBy: 'GV2026_0871',
    createdAt: '21/03/2026',
    usageCount: 4,
  },
  {
    id: 'Q_1032',
    code: 'ATTT_C1_001',
    subjectCode: '504210',
    chapterId: 'CH_31',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Yếu tố nào sau đây KHÔNG thuộc bộ ba bảo mật CIA?',
    options: [
      { key: 'A', text: 'Confidentiality (Tính bí mật)' },
      { key: 'B', text: 'Integrity (Tính toàn vẹn)' },
      { key: 'C', text: 'Availability (Tính sẵn sàng)' },
      { key: 'D', text: 'Scalability (Tính mở rộng)' },
    ],
    correctAnswers: ['D'],
    acceptedKeywords: [],
    explanation: 'Bộ ba CIA gồm Confidentiality, Integrity, Availability.',
    createdBy: 'GV2026_0871',
    createdAt: '19/03/2026',
    usageCount: 7,
  },
  {
    id: 'Q_1033',
    code: 'ATTT_C1_002',
    subjectCode: '504210',
    chapterId: 'CH_31',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Tấn công từ chối dịch vụ (DoS) nhằm làm suy giảm tính sẵn sàng của hệ thống.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'DoS làm hệ thống quá tải, khiến người dùng hợp lệ không truy cập được dịch vụ.',
    createdBy: 'GV2026_0871',
    createdAt: '19/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1034',
    code: 'ATTT_C2_002',
    subjectCode: '504210',
    chapterId: 'CH_32',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Trong mã hóa đối xứng, số lượng khóa cần quản lý cho n người dùng là bao nhiêu?',
    options: [
      { key: 'A', text: 'n khóa' },
      { key: 'B', text: 'n(n-1)/2 khóa' },
      { key: 'C', text: '2n khóa' },
      { key: 'D', text: 'n^2 khóa' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'Mã hóa đối xứng cần một khóa riêng cho mỗi cặp người dùng: n(n-1)/2.',
    createdBy: 'GV2026_0871',
    createdAt: '20/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1035',
    code: 'ATTT_C3_001',
    subjectCode: '504210',
    chapterId: 'CH_33',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những thành phần nào sau đây thuộc hạ tầng khóa công khai (PKI)?',
    options: [
      { key: 'A', text: 'Chứng chỉ số (Digital Certificate).' },
      { key: 'B', text: 'Nhà cung cấp chứng thực (Certificate Authority).' },
      { key: 'C', text: 'Danh sách thu hồi chứng chỉ (CRL).' },
      { key: 'D', text: 'Hàm băm MD5 dùng để mã hóa thông điệp.' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    acceptedKeywords: [],
    explanation: 'MD5 là hàm băm một chiều, không thuộc thành phần hạ tầng PKI.',
    createdBy: 'GV2026_0871',
    createdAt: '21/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1036',
    code: 'ATTT_C3_002',
    subjectCode: '504210',
    chapterId: 'CH_33',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    content: 'Chữ ký số đảm bảo tính xác thực và toàn vẹn của thông điệp nhưng không đảm bảo tính bí mật.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'Muốn bí mật phải mã hóa thêm bằng khóa của người nhận.',
    createdBy: 'GV2026_0871',
    createdAt: '21/03/2026',
    usageCount: 4,
  },
  {
    id: 'Q_1037',
    code: 'ATTT_C4_002',
    subjectCode: '504210',
    chapterId: 'CH_34',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Lỗ hổng cho phép chèn mã kịch bản độc hại chạy trong trình duyệt nạn nhân gọi là gì? (Điền từ khóa)',
    options: [],
    correctAnswers: ['XSS'],
    acceptedKeywords: ['XSS', 'Cross-site scripting', 'Cross site scripting'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'XSS (Cross-Site Scripting) cho phép kẻ tấn công chạy script trong ngữ cảnh trang nạn nhân.',
    createdBy: 'GV2026_0871',
    createdAt: '22/03/2026',
    usageCount: 6,
  },

  // ── Nhập môn Trí tuệ nhân tạo ────────────────────────────────────────────────
  {
    id: 'Q_1021',
    code: 'AI_C2_001',
    subjectCode: '500510',
    chapterId: 'CH_42',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Thuật toán tìm kiếm nào đảm bảo tìm được đường đi ngắn nhất nếu hàm heuristic là chấp nhận được (admissible)?',
    options: [
      { key: 'A', text: 'Tìm kiếm theo chiều sâu (DFS)' },
      { key: 'B', text: 'Tìm kiếm tham lam (Greedy Best-First)' },
      { key: 'C', text: 'Thuật toán A*' },
      { key: 'D', text: 'Tìm kiếm leo đồi (Hill Climbing)' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'A* tối ưu khi heuristic chấp nhận được, kết hợp g(n) và h(n).',
    createdBy: 'GV2026_0982',
    createdAt: '22/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1022',
    code: 'AI_C3_001',
    subjectCode: '500510',
    chapterId: 'CH_43',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Logic mệnh đề (propositional logic) có thể biểu diễn được mọi quan hệ định lượng như "mọi sinh viên đều phải thi".',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['FALSE'],
    acceptedKeywords: [],
    explanation: 'Cần logic vị từ (first-order logic) để biểu diễn lượng từ "mọi"/"tồn tại".',
    createdBy: 'GV2026_0982',
    createdAt: '22/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1038',
    code: 'AI_C1_001',
    subjectCode: '500510',
    chapterId: 'CH_41',
    type: 'MCQ_SINGLE',
    difficulty: 'EASY',
    content: 'Tác tử thông minh (Intelligent Agent) tiếp nhận thông tin từ môi trường qua thành phần nào?',
    options: [
      { key: 'A', text: 'Bộ truyền động (Actuator)' },
      { key: 'B', text: 'Cảm biến (Sensor)' },
      { key: 'C', text: 'Bộ nhớ đệm (Cache)' },
      { key: 'D', text: 'Hàm mục tiêu (Objective function)' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'Sensor thu nhận tri giác, actuator tác động trở lại môi trường.',
    createdBy: 'GV2026_0982',
    createdAt: '23/03/2026',
    usageCount: 6,
  },
  {
    id: 'Q_1039',
    code: 'AI_C1_002',
    subjectCode: '500510',
    chapterId: 'CH_41',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    content: 'Môi trường được gọi là xác định (deterministic) nếu trạng thái kế tiếp được xác định hoàn toàn bởi trạng thái hiện tại và hành động của tác tử.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['TRUE'],
    acceptedKeywords: [],
    explanation: 'Môi trường xác định không có yếu tố ngẫu nhiên tác động lên kết quả hành động.',
    createdBy: 'GV2026_0982',
    createdAt: '23/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1040',
    code: 'AI_C2_002',
    subjectCode: '500510',
    chapterId: 'CH_42',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Thuật toán tìm kiếm nào sử dụng hàng đợi ưu tiên (priority queue) để chọn nút mở rộng?',
    options: [
      { key: 'A', text: 'Tìm kiếm theo chiều sâu (DFS)' },
      { key: 'B', text: 'Tìm kiếm theo chiều rộng (BFS)' },
      { key: 'C', text: 'Tìm kiếm chi phí thấp nhất / A* (UCS / A*)' },
      { key: 'D', text: 'Tìm kiếm leo đồi (Hill Climbing)' },
    ],
    correctAnswers: ['C'],
    acceptedKeywords: [],
    explanation: 'UCS và A* dùng hàng đợi ưu tiên để mở rộng nút có chi phí/đánh giá nhỏ nhất.',
    createdBy: 'GV2026_0982',
    createdAt: '24/03/2026',
    usageCount: 4,
  },
  {
    id: 'Q_1041',
    code: 'AI_C2_003',
    subjectCode: '500510',
    chapterId: 'CH_42',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những phát biểu nào sau đây ĐÚNG về thuật toán A*?',
    options: [
      { key: 'A', text: 'Tối ưu nếu hàm heuristic là chấp nhận được (admissible).' },
      { key: 'B', text: 'Luôn nhanh hơn BFS trong mọi bài toán.' },
      { key: 'C', text: 'Đánh giá nút theo công thức f(n) = g(n) + h(n).' },
      { key: 'D', text: 'Có thể tiêu tốn nhiều bộ nhớ do lưu trữ biên.' },
    ],
    correctAnswers: ['A', 'C', 'D'],
    acceptedKeywords: [],
    explanation: 'A* không đảm bảo nhanh hơn BFS trong mọi trường hợp.',
    createdBy: 'GV2026_0982',
    createdAt: '24/03/2026',
    usageCount: 3,
  },
  {
    id: 'Q_1042',
    code: 'AI_C3_002',
    subjectCode: '500510',
    chapterId: 'CH_43',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Trong logic vị từ, lượng từ ∀ (forall) được đọc là gì?',
    options: [
      { key: 'A', text: 'Tồn tại' },
      { key: 'B', text: 'Với mọi' },
      { key: 'C', text: 'Phủ định' },
      { key: 'D', text: 'Kéo theo' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: '∀ đọc là "với mọi", ∃ đọc là "tồn tại".',
    createdBy: 'GV2026_0982',
    createdAt: '25/03/2026',
    usageCount: 5,
  },
  {
    id: 'Q_1043',
    code: 'AI_C3_003',
    subjectCode: '500510',
    chapterId: 'CH_43',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    content: 'Phương pháp suy luận đi từ các tiền đề riêng lẻ để rút ra kết luận tổng quát gọi là gì? (Điền từ khóa)',
    options: [],
    correctAnswers: ['Quy nạp'],
    acceptedKeywords: ['Quy nạp', 'Induction'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'Quy nạp (induction) khác với diễn dịch (deduction) đi từ tổng quát đến riêng.',
    createdBy: 'GV2026_0982',
    createdAt: '25/03/2026',
    usageCount: 4,
  },
];

/**
 * Chuẩn hóa một câu hỏi về shape thống nhất dùng xuyên suốt hệ thống:
 *   - `questionCode`  : mã câu hỏi hiển thị (Ngân hàng ↔ Ma trận ↔ Thống kê)
 *   - `subjectName`   : tên môn học suy ra từ quan hệ `subjectCode`
 *   - `chapterName`   : tên chương suy ra từ quan hệ `chapterId`
 *   - hai tùy chọn chấm tự luận ngắn luôn tồn tại (mặc định khi chưa cấu hình)
 * Trường `code` được giữ song song để không phá vỡ các màn hình cũ.
 */
const normalizeQuestion = (question) => {
  const subject = getSubjectById(question.subjectCode);
  const chapter = subject?.chapters.find((item) => item.id === question.chapterId) || null;

  return {
    ...DEFAULT_ESSAY_KEYWORD_RULES,
    ...question,
    questionCode: question.code,
    subjectName: subject?.name ?? question.subjectCode,
    chapterName: chapter?.name ?? '',
  };
};

/** Toàn bộ kho câu hỏi đã chuẩn hóa (dùng cho tra cứu, ma trận đề, phân tích). */
export const mockQuestionBank = rawQuestions.map(normalizeQuestion);

/**
 * Tập câu hỏi hiển thị ở Ngân hàng câu hỏi (2.1), lọc theo đúng danh mục
 * môn học canonical.
 */
export const mockQuestions = mockSubjects
  .flatMap((subject) => mockQuestionBank.filter((question) => question.subjectCode === subject.code));

/** Tra cứu câu hỏi theo mã câu (`questionCode`) hoặc id. */
export const getQuestionByCode = (key) =>
  mockQuestionBank.find((question) => question.questionCode === key || question.id === key) || null;

/** Lấy toàn bộ câu hỏi thuộc một môn học. */
export const getQuestionsBySubject = (subjectCode) =>
  mockQuestionBank.filter((question) => question.subjectCode === subjectCode);

/** Số câu hỏi hiện có của một môn học (dùng cho thẻ KPI Dashboard). */
export const getSubjectQuestionCount = (subjectCode) => getQuestionsBySubject(subjectCode).length;

/**
 * Phân bổ câu hỏi theo loại trong phạm vi một tập môn học.
 * Dùng cho Donut "Phân bổ loại câu hỏi trong ngân hàng đề" ở 2.0 Dashboard:
 * tổng ở giữa donut LUÔN bằng tổng số câu hỏi thực tế đang được vẽ.
 */
export const buildQuestionTypeDistribution = (subjectCodes) => {
  const scopedQuestions = mockQuestionBank.filter(
    (question) => !subjectCodes || subjectCodes.includes(question.subjectCode)
  );
  const total = scopedQuestions.length;

  return QUESTION_TYPE_ORDER.map((type) => {
    const count = scopedQuestions.filter((question) => question.type === type).length;
    return {
      id: type,
      type,
      label: QUESTION_TYPE_LABELS[type],
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
      color: QUESTION_TYPE_COLORS[type],
    };
  }).filter((item) => item.count > 0);
};

/** Cấu hình cho trang Sinh câu hỏi AI (2.3 AIGenerateQuestionPage). */
export const mockAIGenerateConfig = {
  quantityOptions: [3, 5, 10, 15],
  typeOptions: Object.keys(QUESTION_TYPE_LABELS),
  difficultyOptions: Object.keys(DIFFICULTY_LABELS),
  sampleContext: `Chương 3: Ngôn ngữ truy vấn SQL (Hệ cơ sở dữ liệu)

Nội dung bài giảng tóm tắt:
1. SQL được chia thành các nhóm lệnh: DDL (CREATE, ALTER, DROP, TRUNCATE), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE) và TCL (COMMIT, ROLLBACK, SAVEPOINT).
2. Mệnh đề WHERE lọc bản ghi TRƯỚC khi gom nhóm; mệnh đề HAVING lọc kết quả SAU khi gom nhóm bằng GROUP BY.
3. Hàm gom nhóm phổ biến: COUNT(), SUM(), AVG(), MIN(), MAX().
4. JOIN dùng để kết hợp dữ liệu nhiều bảng: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN.
5. Chỉ mục (Index) giúp tăng tốc truy vấn nhưng làm chậm thao tác ghi (INSERT/UPDATE/DELETE).
6. Khóa chính đảm bảo tính duy nhất; khóa ngoại đảm bảo toàn vẹn tham chiếu giữa các bảng.`,
};

/**
 * Kết quả sinh câu hỏi thô từ AI (kết quả mock của POST /ai/generate-questions).
 * `confidence` là độ tin cậy do AI trả về, không phải điểm số của thí sinh.
 */
const rawAIGeneratedQuestions = [
  {
    id: 'AI_Q_01',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Mệnh đề nào được dùng để lọc dữ liệu SAU khi đã gom nhóm bằng GROUP BY?',
    options: [
      { key: 'A', text: 'WHERE' },
      { key: 'B', text: 'HAVING' },
      { key: 'C', text: 'ORDER BY' },
      { key: 'D', text: 'DISTINCT' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'WHERE lọc trước khi gom nhóm, HAVING lọc sau khi gom nhóm nên HAVING mới dùng được với hàm gom nhóm.',
    confidence: 96,
  },
  {
    id: 'AI_Q_02',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    content: 'Những câu lệnh nào sau đây thuộc nhóm ngôn ngữ điều khiển dữ liệu (DCL)?',
    options: [
      { key: 'A', text: 'GRANT' },
      { key: 'B', text: 'REVOKE' },
      { key: 'C', text: 'COMMIT' },
      { key: 'D', text: 'TRUNCATE' },
    ],
    correctAnswers: ['A', 'B'],
    acceptedKeywords: [],
    explanation: 'DCL gồm GRANT và REVOKE. COMMIT thuộc TCL, TRUNCATE thuộc DDL.',
    confidence: 88,
  },
  {
    id: 'AI_Q_03',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    content: 'Việc tạo thêm chỉ mục (Index) luôn làm tăng tốc mọi thao tác trên bảng.',
    options: [
      { key: 'TRUE', text: 'Đúng' },
      { key: 'FALSE', text: 'Sai' },
    ],
    correctAnswers: ['FALSE'],
    acceptedKeywords: [],
    explanation: 'Index tăng tốc truy vấn đọc nhưng làm chậm INSERT/UPDATE/DELETE vì phải cập nhật thêm cấu trúc chỉ mục.',
    confidence: 92,
  },
  {
    id: 'AI_Q_04',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'ESSAY',
    difficulty: 'EASY',
    content: 'Tên hàm gom nhóm dùng để đếm số bản ghi trong một nhóm là gì? (Điền từ khóa)',
    options: [],
    correctAnswers: ['COUNT'],
    acceptedKeywords: ['COUNT'],
    allowPartialKeywordScore: true,
    isCaseSensitive: false,
    explanation: 'COUNT() là hàm gom nhóm đếm số bản ghi trong nhóm.',
    confidence: 99,
  },
  {
    id: 'AI_Q_05',
    subjectCode: '502051',
    chapterId: 'CH_03',
    type: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    content: 'Loại JOIN nào trả về tất cả bản ghi của bảng bên trái kể cả khi không có bản ghi tương ứng ở bảng bên phải?',
    options: [
      { key: 'A', text: 'INNER JOIN' },
      { key: 'B', text: 'LEFT JOIN' },
      { key: 'C', text: 'RIGHT JOIN' },
      { key: 'D', text: 'CROSS JOIN' },
    ],
    correctAnswers: ['B'],
    acceptedKeywords: [],
    explanation: 'LEFT JOIN giữ toàn bộ bản ghi bảng trái, các cột bảng phải nhận giá trị NULL nếu không khớp.',
    confidence: 90,
  },
];

/**
 * Kết quả sinh câu hỏi mẫu từ AI, đã gắn `questionCode` dự kiến để khi lưu vào
 * ngân hàng thì mã câu đồng bộ với trang Ma trận đề thi & Phân tích.
 */
export const mockAIGeneratedQuestions = rawAIGeneratedQuestions.map((question, index) =>
  normalizeQuestion({
    ...question,
    code: `AI_C3_${String(index + 1).padStart(3, '0')}`,
  })
);

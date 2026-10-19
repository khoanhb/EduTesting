/**
 * src/data/student/mockExamRoom.js
 *
 * Bộ câu hỏi phòng thi và dữ liệu làm bài (màn hình 3.2 ExamRoomPage).
 * Gồm 40 câu: MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, ESSAY.
 *
 * Khi nối API: thay bằng GET /exams/:id/questions
 */
export const mockQuestionsData = Array.from({ length: 40 }).map((_, index) => {
  const qNum = index + 1;
  const isSkipped = qNum === 15 || qNum === 30;

  if (qNum === 39 || qNum % 10 === 0) {
    return {
      id: qNum,
      type: 'ESSAY',
      typeLabel: 'TỰ LUẬN NGẮN / ĐIỀN TỪ',
      title:
        'Trong mô hình quan hệ, thuộc tính dùng để xác định duy nhất một bộ được gọi là gì?',
      userAnswer: isSkipped ? '' : qNum === 39 ? 'Khóa ngoại' : 'Khóa chính',
      isCorrect: isSkipped ? false : qNum !== 39,
      points: qNum === 39 ? '0đ' : '0.25đ',
      acceptedKeywords: ['Primary Key', 'Khóa chính', 'PK'],
      explanation:
        'Khóa chính (Primary Key) là một hoặc một tập thuộc tính tối thiểu xác định duy nhất một bộ giá trị trong quan hệ.',
      teacherFeedback:
        qNum === 39 ? 'Chưa học bài kỹ, cần xem lại kiến thức về toàn vẹn thực thể.' : null,
    };
  }

  if (qNum % 5 === 0) {
    return {
      id: qNum,
      type: 'TRUE_FALSE',
      typeLabel: 'ĐÚNG / SAI',
      title: 'Một bảng trong cơ sở dữ liệu quan hệ có thể tồn tại nhiều khóa chính cùng lúc?',
      options: [
        { key: 'TRUE', text: 'Đúng' },
        { key: 'FALSE', text: 'Sai' },
      ],
      userAnswer: isSkipped ? '' : 'FALSE',
      correctAnswer: 'FALSE',
      isCorrect: !isSkipped,
      points: '0.25đ',
      explanation:
        'Trong mô hình dữ liệu quan hệ, mỗi bảng chỉ được phép có duy nhất một khóa chính (Primary Key).',
    };
  }

  if (qNum === 12 || qNum === 24) {
    return {
      id: qNum,
      type: 'MCQ_MULTIPLE',
      typeLabel: 'CHỌN NHIỀU ĐÁP ÁN ĐÚNG',
      title: 'Các điều kiện nào sau đây bắt buộc đối với một khóa chính (Primary Key)?',
      options: [
        { key: 'A', text: 'Giá trị không được phép trùng lặp giữa các bản ghi.' },
        { key: 'B', text: 'Không được phép nhận giá trị NULL (rỗng).' },
        { key: 'C', text: 'Phải luôn mang kiểu dữ liệu số nguyên (Integer).' },
        { key: 'D', text: 'Có thể tự động tăng giá trị khi chèn bản ghi mới.' },
      ],
      userAnswer: isSkipped ? [] : ['A', 'B'],
      correctAnswer: ['A', 'B'],
      isCorrect: !isSkipped,
      points: '0.25đ',
      explanation:
        'Khóa chính phải tuân thủ nghiêm ngặt hai quy tắc: Tính duy nhất (Unique) và Tính toàn vẹn thực thể (Not NULL).',
    };
  }

  const isWrong =
    !isSkipped && (qNum === 13 || qNum === 27 || qNum === 36 || qNum === 40);
  return {
    id: qNum,
    type: 'MCQ_SINGLE',
    typeLabel: 'CHỌN 1 ĐÁP ÁN ĐÚNG',
    title:
      qNum === 40
        ? 'Trong SQL, lệnh dùng để truy vấn và lấy dữ liệu từ một hoặc nhiều bảng là gì?'
        : 'Trong mô hình quan hệ, khóa chính (Primary Key) có đặc điểm và vai trò gì sau đây?',
    options:
      qNum === 40
        ? [
            { key: 'A', text: 'ADD' },
            { key: 'B', text: 'INSERT' },
            { key: 'C', text: 'SELECT' },
            { key: 'D', text: 'DELETE' },
          ]
        : [
            { key: 'A', text: 'Có thể chứa các giá trị trùng lặp.' },
            { key: 'B', text: 'Mỗi giá trị là duy nhất và không được phép rỗng.' },
            { key: 'C', text: 'Chỉ được sử dụng để liên kết với bảng khác.' },
            { key: 'D', text: 'Có thể có nhiều giá trị rỗng trong cùng một bảng.' },
          ],
    userAnswer: isSkipped
      ? ''
      : isWrong
        ? qNum === 40
          ? 'B'
          : 'A'
        : qNum === 40
          ? 'C'
          : 'B',
    correctAnswer: qNum === 40 ? 'C' : 'B',
    isCorrect: !isSkipped && !isWrong,
    points: !isSkipped && !isWrong ? '0.25đ' : '0đ',
    explanation:
      qNum === 40
        ? 'SELECT là lệnh SQL dùng để truy vấn và lấy dữ liệu từ một hoặc nhiều bảng trong cơ sở dữ liệu.'
        : 'Khóa chính phải đảm bảo tính duy nhất và toàn vẹn thực thể (không nhận giá trị NULL).',
  };
});

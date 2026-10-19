const PAGE_TITLES = {
  '/': 'Đăng nhập',
  '/login': 'Đăng nhập',
  '/student/profile': 'Thông tin cá nhân',
  '/teacher/profile': 'Thông tin cá nhân',
  '/admin/dashboard': 'Tổng quan quản trị',
  '/admin/users': 'Quản lý người dùng',
  '/admin/subjects': 'Môn học và chương',
  '/teacher/dashboard': 'Tổng quan giảng viên',
  '/teacher/questions': 'Ngân hàng câu hỏi',
  '/teacher/questions/ai': 'Tạo câu hỏi bằng AI',
  '/teacher/exams': 'Quản lý đề thi',
  '/teacher/analytics': 'Thống kê và phân tích',
  '/teacher/anti-cheat': 'Giám sát thi và vi phạm',
  '/teacher/grade-essay': 'Chấm tự luận ngắn',
  '/student/exams': 'Bài thi của tôi',
  '/student/history': 'Lịch sử thi',
};
const EXAM_PAGE_TITLES = {
  'exam-detail': 'Thông tin bài thi',
  'exam-room': 'Làm bài thi',
  'exam-result': 'Kết quả bài thi',
  'exam-review': 'Xem lại bài làm',
};

export function getPageTitle(pathname, search = '') {
  const path = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);
  let title = PAGE_TITLES[path];
  if (path === '/teacher/questions/add') {
    title = params.get('edit') ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi';
  } else if (path === '/teacher/exams/create') {
    title = params.get('mode') === 'view' ? 'Chi tiết đề thi'
      : params.get('exam') ? 'Chỉnh sửa đề thi' : 'Tạo đề thi';
  } else {
    const match = path.match(/^\/student\/(exam-detail|exam-room|exam-result|exam-review)\/[^/]+$/);
    if (match) title = EXAM_PAGE_TITLES[match[1]];
  }
  return title ? `${title} - EduTesting` : 'EduTesting - Hệ thống khảo thí trực tuyến';
}

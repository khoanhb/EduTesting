import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { getPageTitle } from './utils/pageTitles';

// 1. Phân hệ Xác thực & Thông tin cá nhân
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const StudentProfilePage = lazy(() => import('./pages/profile/StudentProfilePage'));
const TeacherProfilePage = lazy(() => import('./pages/profile/TeacherProfilePage'));

// 2. Phân hệ Giảng viên
const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage'));
const QuestionBankPage = lazy(() => import('./pages/teacher/QuestionBankPage'));
const AddEditQuestionPage = lazy(() => import('./pages/teacher/AddEditQuestionPage'));
const AIGenerateQuestionPage = lazy(() => import('./pages/teacher/AIGenerateQuestionPage'));
const ExamManagementPage = lazy(() => import('./pages/teacher/ExamManagementPage'));
const CreateExamMatrixPage = lazy(() => import('./pages/teacher/CreateExamMatrixPage'));
const ExamAnalyticsPage = lazy(() => import('./pages/teacher/ExamAnalyticsPage'));
const AntiCheatMonitorPage = lazy(() => import('./pages/teacher/AntiCheatMonitorPage'));
const GradeEssayPage = lazy(() => import('./pages/teacher/GradeEssayPage'));

// 3. Phân hệ Sinh viên
const StudentExamsPage = lazy(() => import('./pages/student/StudentExamsPage'));
const ExamDetailPage = lazy(() => import('./pages/student/ExamDetailPage'));
const ExamRoomPage = lazy(() => import('./pages/student/ExamRoomPage'));
const ExamResultPage = lazy(() => import('./pages/student/ExamResultPage'));
const ExamReviewPage = lazy(() => import('./pages/student/ExamReviewPage'));
const ExamHistoryPage = lazy(() => import('./pages/student/ExamHistoryPage'));

// 4. Phân hệ Quản trị viên (Admin)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const SubjectManagementPage = lazy(() => import('./pages/admin/SubjectManagementPage'));

function AppRoutes() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.title = getPageTitle(pathname, search);
  }, [pathname, search]);

  return (
    <Suspense fallback={<main className="p-8 text-center" role="status">Đang tải trang...</main>}>
      <Routes>
        {/* Phân hệ Auth */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Thông tin cá nhân */}
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/teacher/profile" element={<TeacherProfilePage />} />

        {/* Phân hệ Giảng viên */}
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/questions" element={<QuestionBankPage />} />
        <Route path="/teacher/questions/add" element={<AddEditQuestionPage />} />
        <Route path="/teacher/questions/ai" element={<AIGenerateQuestionPage />} />
        <Route path="/teacher/exams" element={<ExamManagementPage />} />
        <Route path="/teacher/exams/create" element={<CreateExamMatrixPage />} />
        <Route path="/teacher/analytics" element={<ExamAnalyticsPage />} />
        <Route path="/teacher/anti-cheat" element={<AntiCheatMonitorPage />} />
        <Route path="/teacher/grade-essay" element={<GradeEssayPage />} />

        {/* Phân hệ Sinh viên */}
        <Route path="/student/exams" element={<StudentExamsPage />} />
        <Route path="/student/exam-detail/:id" element={<ExamDetailPage />} />
        <Route path="/student/exam-room/:id" element={<ExamRoomPage />} />
        <Route path="/student/exam-result/:id" element={<ExamResultPage />} />
        <Route path="/student/exam-review/:id" element={<ExamReviewPage />} />
        <Route path="/student/history" element={<ExamHistoryPage />} />

        {/* Phân hệ Quản trị viên (Admin) */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/subjects" element={<SubjectManagementPage />} />

        {/* Mặc định chuyển về Login nếu sai đường dẫn */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

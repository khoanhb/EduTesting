import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Eye, Lock, ShieldAlert, Clock } from 'lucide-react';
import StudentHeader from '../../components/common/StudentHeader';
import { mockStudentExams, advanceStudentExamAttempt, getStudentExamConfig, getStudentExamResult, canRetakeStudentExam } from '../../data/student';
import { getExamAccess } from '../../utils/examAccess';
import { mockCurrentUser } from '../../data/shared/authAccounts';

export default function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const suspendedByUrl = queryParams.get('suspended') === 'true';

  const exam = mockStudentExams.find(e => e.id === id);
  const student = mockCurrentUser.student;
  const result = getStudentExamResult(exam);
  const access = getExamAccess(exam ? { ...exam, config: getStudentExamConfig(exam) } : null,
    suspendedByUrl ? { ...result, isSuspended: true } : result);
  const { isSuspended, isPendingViolation, canShowScore, canReview, canShowDetails } = access;

  // Chặn nút Back & Forward của trình duyệt
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Lượt bài vừa thực hiện xong
  const currentAttempt = exam?.currentAttempt ?? 1;
  const maxAttempts = exam?.maxAttempts ?? 1;
  // Số lượt dự phòng còn lại để thi tiếp
  const remainingRetakes = maxAttempts === 0 ? Infinity : Math.max(0, maxAttempts - currentAttempt);
  const canRetake = canRetakeStudentExam(exam);

  const submittedTime = useMemo(() => {
    if (suspendedByUrl && !result?.submittedAt) {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const dateStr = now.toLocaleDateString('vi-VN');
      return `${timeStr} - ${dateStr}`;
    }
    return result?.submittedAt ?? '-';
  }, [suspendedByUrl, result?.submittedAt]);

  const resultQuestionCount = result?.questionsCount ?? exam?.questionsCount;

  if (!exam || (!result && !suspendedByUrl)) {
    return <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <StudentHeader avatar={student.avatar} />
      <main className="max-w-4xl mx-auto p-8 text-center">
        <p>Chưa có kết quả cho bài thi này.</p>
        <button onClick={() => navigate('/student/exams')} className="mt-4 text-primary cursor-pointer">Quay về danh sách bài thi</button>
      </main>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      <StudentHeader avatar={student.avatar} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 md:p-12 shadow-sm w-full text-center">
          
          {/* TIÊU ĐỀ THÔNG BÁO */}
          {isSuspended ? (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#EF4444] rounded-full text-xs font-bold mb-2 border border-red-200">
                <ShieldAlert className="w-4 h-4" />
                <span>Vi phạm quy chế phòng thi (3/3 lần rời màn hình)</span>
              </div>
              <h1 className="text-2xl font-bold text-[#EF4444] mb-1">
                Bài thi đã bị đình chỉ!
              </h1>
              <p className="text-xs text-[#64748B]">
                Hệ thống đã tự động khóa và thu bài. Báo cáo vi phạm đã được chuyển tới Giám thị để xem xét lập biên bản xử lý.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Nộp bài thành công!</h1>
              <p className="text-xs text-[#475569]">
                {exam.subjectName} (Mã đề: {exam.testCode || exam.subjectCode})
              </p>
            </div>
          )}

          {/* HIỂN THỊ CHUẨN XÁC: Lượt vừa làm / Tổng lượt */}
          <p className="text-xs text-[#06B6D4] font-medium mb-8">
            Lượt làm bài: {currentAttempt} / {maxAttempts === 0 ? 'Không giới hạn' : maxAttempts}{' '}
            <span className="text-[#94A3B8]">(Hệ thống ghi nhận điểm lần cao nhất)</span>
          </p>

          {/* KHUNG ĐIỂM SỐ: NẾU BỊ ĐÌNH CHỈ THÌ KHÔNG HIỆN ĐIỂM, CHỜ BIÊN BẢN */}
          {isPendingViolation ? (
            <div className="max-w-full mx-auto p-6 rounded-[20px] border border-amber-200 bg-amber-50/40 mb-8 text-xs text-[#92400E]">
              <Clock className="w-6 h-6 text-[#D97706] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#B45309] mb-1">Đang chờ xử lý biên bản vi phạm</p>
              <p className="text-[11px] leading-relaxed text-[#B45309]/80">
                Điểm số bài thi tạm thời bị giữ lại. Điểm chính thức sẽ được công bố sau khi Hội đồng thi và Giảng viên hoàn tất đối soát mức xử phạt theo quy chế.
              </p>
            </div>
          ) : canShowScore ? (
            <div className="max-w-full mx-auto p-8 rounded-[24px] border-2 border-sky-100 bg-[#E0F2FE]/20 mb-8">
              <span className="text-xs font-bold text-[#06B6D4] tracking-wider uppercase block mb-1">
                ĐIỂM SỐ CỦA BẠN
              </span>
              <div className="text-5xl font-extrabold text-[#0F172A]">
                {result.score} <span className="text-2xl text-[#94A3B8] font-normal">/ {exam.scale}</span>
              </div>
            </div>
          ) : (
            <div className="max-w-full mx-auto p-6 rounded-[20px] border border-[#E2E8F0] bg-slate-50 mb-8 text-xs text-[#475569]">
              <Lock className="w-5 h-5 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#0F172A]">Điểm số chưa được công bố</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Giảng viên sẽ công bố điểm sau khi hoàn tất đối soát ca thi.</p>
            </div>
          )}

          {/* 4 Thẻ thống kê */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
            {canShowDetails && <>
            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Số câu đúng</span>
              <span className="text-base font-bold text-[#10B981]">{result.correctCount ?? '-'} / {resultQuestionCount}</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Số câu sai</span>
              <span className="text-base font-bold text-[#EF4444]">{result.wrongCount ?? '-'} / {resultQuestionCount}</span>
            </div>
            </>}

            {canShowDetails && <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Chưa làm</span>
              <span className="text-base font-bold text-[#F59E0B]">{result?.unansweredCount ?? '-'} / {resultQuestionCount}</span>
            </div>}

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Thời gian làm bài</span>
              <span className="text-base font-bold text-[#06B6D4]">{result?.durationSpent ?? '-'} / {exam.durationMinutes}:00</span>
            </div>
          </div>

          <p className="text-xs text-[#94A3B8] mb-8">
            Thời gian {isSuspended ? 'thu bài tự động' : 'nộp bài'}: <span className="font-semibold text-[#0F172A]">{submittedTime}</span>
          </p>

          {/* 3 NÚT ĐIỀU HƯỚNG */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/student/exams')}
              className="px-6 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay về danh sách bài thi
            </button>

            {/* NÚT LÀM LẠI: VẪN BẤM ĐƯỢC NẾU CÒN LƯỢT DỰ PHÒNG */}
            <button
              disabled={!canRetake}
              onClick={() => {
                // Tăng lượt làm bài lên để vào lượt tiếp theo
                if (advanceStudentExamAttempt(exam.id)) {
                  navigate(`/student/exam-detail/${exam.id}`);
                }
              }}
              className={`px-6 py-2.5 border text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors ${
                canRetake 
                  ? 'border-[#06B6D4] text-[#06B6D4] hover:bg-sky-50 cursor-pointer font-bold' 
                  : 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Làm lại {canRetake && (maxAttempts === 0 ? '(Không giới hạn lượt)' : `(Còn ${remainingRetakes} lượt)`)}
            </button>

            <button
              disabled={!canReview}
              onClick={() => navigate(`/student/exam-review/${exam.id}`)}
              className={`px-6 py-2.5 text-xs font-semibold rounded-[8px] shadow-sm flex items-center gap-1.5 transition-colors ${
                canReview 
                  ? 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer' 
                  : 'bg-slate-200 text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Xem lại bài làm
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
        © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
      </footer>
    </div>
  );
}

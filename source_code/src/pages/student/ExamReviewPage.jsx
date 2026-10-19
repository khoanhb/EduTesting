import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudentHeader from '../../components/common/StudentHeader';
import { mockStudentExams, mockHistoryExams, mockQuestionsData, getStudentExamConfig, getStudentExamResult, getHistoryExamConfig } from '../../data/student';
import { mockCurrentUser } from '../../data/shared/authAccounts';
import { getExamAccess } from '../../utils/examAccess';

export default function ExamReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Tìm kiếm bài thi linh hoạt từ cả mockStudentExams lẫn mockHistoryExams
  const exam = mockStudentExams.find(e => e.id === id) || 
               mockHistoryExams.find(e => e.id === id);

  const student = mockCurrentUser.student;

  // Lấy kết quả động tương ứng
  const requestedAttempt = new URLSearchParams(location.search).get('attempt');
  const historyAttempt = requestedAttempt
    ? exam?.attemptsList?.find((item) => item.attemptNumber.split('/')[0] === requestedAttempt)
    : exam?.attemptsList?.at(-1);
  const result = exam?.attemptsList ? historyAttempt : getStudentExamResult(exam);
  const config = exam?.attemptsList ? getHistoryExamConfig(exam) : exam ? getStudentExamConfig(exam) : {};
  const { canReview, canShowScore, canShowDetails } = getExamAccess(exam ? { ...exam, config } : null, result);
  const questions = result?.questions ?? mockQuestionsData;

  if (!canReview) {
    return <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <StudentHeader avatar={student.avatar} />
      <main className="max-w-4xl mx-auto p-8 text-center">
        <p>Bài thi chưa được phép xem lại hoặc lượt thi không tồn tại.</p>
        <button onClick={() => navigate('/student/history')} className="mt-4 text-primary cursor-pointer">Quay về lịch sử bài thi</button>
      </main>
    </div>;
  }

  const scrollToQuestion = (qNum) => {
    const el = document.getElementById(`question-card-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      <StudentHeader avatar={student.avatar} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Banner tiêu đề */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-lg font-bold text-[#0F172A]">Kỳ thi: {exam.examCode}</h1>
              {canShowScore && <span className="px-2.5 py-0.5 bg-[#E0F2FE] text-[#06B6D4] text-xs font-bold rounded">
                Điểm: {result.score}/{exam.scale ?? 10}
              </span>}
              {/* Badge vi phạm đỏ bên cạnh badge điểm ban đầu */}
              {result.isSuspended && (
                <span className="px-2.5 py-0.5 bg-red-50 text-[#EF4444] text-xs font-bold rounded border border-red-200">
                  {result.suspendReason || 'Đình chỉ - Trừ 50% số điểm bài thi'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#475569]">
              Môn học: {exam.subjectName} • {exam.semester} • Mã MH: {exam.subjectCode}
            </p>
          </div>

          <button
            onClick={() => navigate('/student/history')}
            className="px-5 py-2 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer self-start md:self-auto"
          >
            Thoát
          </button>
        </div>

        {/* Khung nội dung */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: RENDER TOÀN BỘ 40 CÂU HỎI */}
          <div className="lg:col-span-8 space-y-6">
            {questions.map((q) => {
              const isSkipped = q.userAnswer === undefined || q.userAnswer === '' || (Array.isArray(q.userAnswer) && q.userAnswer.length === 0);

              return (
                <div 
                  key={q.id} 
                  id={`question-card-${q.id}`}
                  className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                    <span className="text-xs font-bold text-[#0F172A]">Câu hỏi {q.id}</span>
                    {canShowDetails ? <span className={`text-xs font-bold ${
                      isSkipped ? 'text-[#94A3B8]' : (q.isCorrect ? 'text-[#10B981]' : 'text-[#EF4444]')
                    }`}>
                      {isSkipped ? 'Chưa làm (0đ)' : (q.isCorrect ? `Đúng (${q.points})` : `Sai (${q.points})`)}
                    </span> : <span className="text-xs text-[#94A3B8]">{isSkipped ? 'Chưa làm' : 'Đã trả lời'}</span>}
                  </div>

                  <p className="text-xs font-bold text-[#0F172A] mb-4 leading-relaxed">
                    {q.title}
                  </p>

                  {/* 1. DẠNG TRẮC NGHIỆM ĐƠN / NHIỀU / ĐÚNG SAI */}
                  {q.type !== 'ESSAY' && (
                    <div className="space-y-2.5 text-xs mb-4">
                      {q.options.map((opt) => {
                        const isUserPicked = Array.isArray(q.userAnswer) ? q.userAnswer.includes(opt.key) : q.userAnswer === opt.key;
                        const isTheCorrect = canShowDetails && (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.key) : q.correctAnswer === opt.key);

                        let cardStyle = "border-[#E2E8F0] bg-white text-[#475569]";
                        if (isTheCorrect) cardStyle = "border-[#10B981] bg-[#ECFDF5] text-[#065F46] font-semibold";
                        if (isUserPicked && !isTheCorrect) cardStyle = canShowDetails
                          ? "border-[#EF4444] bg-[#FEF2F2] text-[#991B1B] font-semibold"
                          : "border-[#06B6D4] bg-sky-50 text-[#0369A1] font-semibold";

                        return (
                          <div key={opt.key} className={`p-3.5 rounded-[10px] border flex items-center justify-between transition-colors ${cardStyle}`}>
                            <span>{q.type === 'TRUE_FALSE' ? '' : `${opt.key}. `}{opt.text}</span>
                            {isTheCorrect && (
                              <span className="px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded">ĐÚNG</span>
                            )}
                            {canShowDetails && isUserPicked && !isTheCorrect && (
                              <span className="px-2 py-0.5 bg-[#EF4444] text-white text-[10px] font-bold rounded">SAI</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. DẠNG TỰ LUẬN NGẮN */}
                  {q.type === 'ESSAY' && (
                    <div className="space-y-3 mb-4 text-xs">
                      <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-[12px]">
                        <span className="text-[#94A3B8] block text-[11px] mb-1">Câu trả lời của bạn:</span>
                        <span className="font-bold text-[#0F172A]">{q.userAnswer || '(Bỏ trống)'}</span>
                      </div>

                      {canShowDetails && <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-[12px] space-y-1.5">
                        <span className="font-bold text-[#0284C7] block">Đáp án chấp nhận:</span>
                        <div className="flex flex-wrap gap-2">
                          {q.acceptedKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border border-sky-200 rounded text-[11px] font-semibold text-[#0284C7]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>}
                    </div>
                  )}

                  {/* GIẢI THÍCH CHI TIẾT TRÊN */}
                  {canShowDetails && <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[12px] text-xs text-[#475569] leading-relaxed mb-3">
                    <span className="font-bold text-[#0F172A] block mb-1">Giải thích chi tiết:</span>
                    {q.explanation}
                  </div>}

                  {/* NHẬN XÉT CỦA GIẢNG VIÊN DƯỚI (NẾU CÓ) */}
                  {canShowDetails && q.teacherFeedback && (
                    <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-[12px] text-xs">
                      <span className="font-bold text-[#B45309] block mb-1">Nhận xét của GV:</span>
                      <span className="text-[#92400E] font-medium">{q.teacherFeedback}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CỘT PHẢI: QUESTION PALETTE 3 MÀU */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase mb-2">Danh sách câu hỏi</h3>
              <div className="flex items-center gap-3 text-xs mb-4">
                {canShowDetails && <>
                  <span className="text-[#10B981] font-bold">Đúng: {result.correctCount ?? '-'}</span>
                  <span className="text-[#EF4444] font-bold">Sai: {result.wrongCount ?? '-'}</span>
                </>}
                <span className="text-[#94A3B8] font-bold">Bỏ qua: {result.unansweredCount ?? '-'}</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q) => {
                  const isSkipped = q.userAnswer === undefined || q.userAnswer === '' || (Array.isArray(q.userAnswer) && q.userAnswer.length === 0);

                  let btnStyle = "border-[#10B981] text-[#10B981] bg-emerald-50/40"; // Đúng
                  if (isSkipped) {
                    btnStyle = "border-[#CBD5E1] text-[#94A3B8] bg-slate-100"; // Bỏ qua: Xám nhạt
                  } else if (!canShowDetails) {
                    btnStyle = "border-[#06B6D4] text-[#0369A1] bg-sky-50";
                  } else if (!q.isCorrect) {
                    btnStyle = "border-[#EF4444] text-[#EF4444] bg-red-50/40 font-bold"; // Sai: Đỏ
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id)}
                      className={`h-9 rounded-[8px] border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-[16px] text-xs text-[#0369A1] leading-relaxed">
              <span className="font-bold block mb-1 uppercase text-[11px]">Thông tin phúc khảo</span>
              Nếu bạn nhận thấy có sự sai lệch hoặc không đồng ý với đáp án chi tiết của đề thi, vui lòng gửi đơn phúc khảo trực tuyến cho giám thị trong vòng 48 giờ sau khi kết thúc buổi thi[cite: 48].
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
        © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
      </footer>
    </div>
  );
}

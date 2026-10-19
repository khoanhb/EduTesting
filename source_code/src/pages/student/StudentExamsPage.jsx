import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Clock } from 'lucide-react';
import StudentHeader from '../../components/common/StudentHeader';
import CustomDropdown from '../../components/common/CustomDropdown';
import { mockStudentExams } from '../../data/student';
import { mockCurrentUser } from '../../data/shared/authAccounts';
import { SEMESTER_OPTIONS } from '../../data/shared/semesters';
import { canEnterStudentExam } from '../../data/student/mockStudentExams';

export default function StudentExamsPage() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const assignedSemesters = new Set(mockStudentExams.map((exam) => exam.semester));
    const semesterOptions = [
        { value: 'ALL', label: 'Tất cả học kỳ' },
        ...SEMESTER_OPTIONS.filter((option) => assignedSemesters.has(option.value)),
    ];

    const filteredExams = mockStudentExams.filter((exam) => {
        const matchSearch = exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) || exam.examCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSemester = selectedSemester === 'ALL' || exam.semester === selectedSemester;
        const matchStatus = statusFilter === 'ALL' || exam.status === statusFilter;
        return matchSearch && matchSemester && matchStatus;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <StudentHeader avatar={mockCurrentUser.student.avatar} />

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 mb-6 shadow-sm">
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Danh sách bài thi
            </h1>
            <p className="text-xs text-[#475569] mt-1">
                Chúc bạn hoàn thành tốt các bài thi được giao. Vui lòng kiểm tra kỹ thời gian mở đề thi.
            </p>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
                <Search className="w-4 h-4" />
                </span>
                <input
                type="text"
                placeholder="Tìm kiếm theo kỳ thi, môn học"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors shadow-sm"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <CustomDropdown
                options={semesterOptions}
                value={selectedSemester}
                onChange={setSelectedSemester}
                className="w-48"
                />

                <div className="flex items-center gap-1 bg-white rounded-[23px] p-1">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-[24px] text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-[#06B6D4] text-white' : 'text-[#475569] hover:bg-slate-50'
                    }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-[24px] text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'ACTIVE' ? 'bg-[#06B6D4] text-white' : 'text-[#475569] hover:bg-slate-50'
                    }`}
                >
                    Đang diễn ra
                </button>
                <button
                    onClick={() => setStatusFilter('UPCOMING')}
                    className={`px-3 py-1.5 rounded-[24px] text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'UPCOMING' ? 'bg-[#06B6D4] text-white' : 'text-[#475569] hover:bg-slate-50'
                    }`}
                >
                    Sắp diễn ra
                </button>
                </div>
            </div>
            </div>

            {/* Lưới danh sách bài thi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
                const isActive = exam.status === 'ACTIVE';
                const canEnter = canEnterStudentExam(exam);

                return (
                <div 
                    key={exam.id} 
                    className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                    <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isActive ? 'bg-red-50 text-[#EF4444]' : 'bg-sky-50 text-[#0284C7]'
                        }`}>
                        {isActive ? 'Đang diễn ra' : 'Sắp diễn ra'}
                        </span>
                        <span className="text-[11px] font-semibold text-[#94A3B8]">{exam.semester}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0F172A] leading-snug mb-1">
                        Kỳ thi: {exam.examCode}
                    </h3>
                    <p className="text-xs text-[#475569] mb-4">
                        {exam.subjectName}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-medium text-[#475569]">
                        {exam.subjectCode}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-medium text-[#475569]">
                        {exam.type}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-medium text-[#475569]">
                        {exam.questionsCount} câu hỏi
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-medium text-[#475569]">
                        {exam.durationMinutes} phút
                        </span>
                    </div>

                    <div className="text-[11px] text-[#94A3B8] mb-6 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{exam.openTime}</span>
                    </div>
                    </div>

                    {canEnter ? (
                    <button
                        onClick={() => navigate(`/student/exam-detail/${exam.id}`)}
                        className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
                    >
                        Vào thi ngay
                    </button>
                    ) : (
                    <button
                        disabled
                        className="w-full py-2.5 bg-slate-100 border border-[#E2E8F0] text-[#94A3B8] text-xs font-semibold rounded-[8px] cursor-not-allowed"
                    >
                        {isActive ? 'Đã hết lượt làm bài' : 'Chưa mở phòng thi'}
                    </button>
                    )}
                </div>
                );
            })}
            </div>

            <div className="mt-8 p-4 bg-sky-50/50 border border-sky-100 rounded-[16px] flex items-start gap-3 text-xs text-[#0369A1]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
                <span className="font-semibold">Lưu ý:</span> Khi đề thi bật giám sát, chuyển tab, rời cửa sổ hoặc thu nhỏ cửa sổ trong lúc làm bài sẽ được tính là vi phạm. Kiểm tra quy chế của từng ca thi trước khi bắt đầu.
            </p>
            </div>
        </main>

        <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
            © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
        </footer>
        </div>
    );
}

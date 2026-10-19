import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  FileText,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import LiveRoomsTable from '../../components/common/LiveRoomsTable';
import TrendBarChart from '../../components/common/charts/TrendBarChart';
import DonutChart from '../../components/common/charts/DonutChart';
import CustomDropdown from '../../components/common/CustomDropdown';
import ToastNotification from '../../components/common/ToastNotification';
import {
  getLiveRoomsBySubjects,
  getViolationsBySubjects,
  isCheatingViolation,
  mockTeacherDashboard,
  mockTeacherUser,
  RISK_LEVEL_LABELS,
  VIOLATION_STATUS_LABELS,
} from '../../data/teacher';

/** Map tên icon trong dữ liệu KPI sang component Lucide. */
const KPI_ICONS = {
  database: Database,
  file: FileText,
  check: CheckCircle2,
  alert: ShieldAlert,
};

/** Bảng màu nền icon theo sắc thái KPI. */
const KPI_TONES = {
  primary: 'bg-[#E0F2FE] text-[#0891B2]',
  success: 'bg-[#ECFDF5] text-[#10B981]',
  danger: 'bg-[#FEF2F2] text-[#EF4444]',
};

const RISK_TONES = {
  NORMAL: 'bg-[#F1F5F9] text-[#64748B]',
  SUSPICIOUS: 'bg-[#FEF3C7] text-[#D97706]',
  HIGH: 'bg-[#FEF2F2] text-[#EF4444]',
};

/**
 * Dashboard Giảng viên (màn hình 2.0).
 *
 * Nguyên tắc dữ liệu:
 *   - Mọi số liệu lấy từ `mockTeacherDashboard` vốn được suy ra từ chính đề
 *     thi, ngân hàng câu hỏi và nhật ký vi phạm, không có chart mock riêng.
 *   - Phạm vi phân quyền: chỉ môn trong `mockTeacherUser.managedSubjects` được
 *     hiển thị ở mọi khối (KPI, biểu đồ, phòng thi, nhật ký vi phạm).
 *   - Cảnh báo gian lận chỉ bật khi có vi phạm thật sự (không tính sự cố kỹ thuật
 *     như mất kết nối mạng) và chưa được lập biên bản.
 */
export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [semester, setSemester] = useState(mockTeacherDashboard.currentSemester);
  const [chartType, setChartType] = useState('BAR');
  const [viewMode, setViewMode] = useState('DAY');

  /** Ràng buộc phân quyền: chỉ dữ liệu thuộc môn được phân công. */
  const managedSubjects = mockTeacherUser.managedSubjects;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Làm mới dữ liệu thành công!');
    }, 600);
  };

  /** Số liệu Dashboard theo học kỳ đang chọn (KPI + dữ liệu biểu đồ). */
  const dashboard =
    mockTeacherDashboard.bySemester[semester] ??
    mockTeacherDashboard.bySemester[mockTeacherDashboard.currentSemester];

  const visibleRooms = useMemo(
    () => getLiveRoomsBySubjects(managedSubjects),
    [managedSubjects]
  );

  const scopedViolations = useMemo(
    () =>
      getViolationsBySubjects(managedSubjects)
        // Nhật ký chỉ liệt kê sự kiện gian lận thật; sự cố kỹ thuật (mất mạng,
        // lỗi thiết bị) không được hiển thị như vi phạm của thí sinh.
        .filter(isCheatingViolation)
        .sort((a, b) => (a.status === 'REPORTED' ? 1 : 0) - (b.status === 'REPORTED' ? 1 : 0)),
    [managedSubjects]
  );

  const pendingFraudAlerts = scopedViolations.filter((item) => item.status === 'PENDING');
  const trend = dashboard.trend[viewMode];
  const trendItems = trend.items;
  const semesterLabel =
    mockTeacherDashboard.semesters.find((item) => item.value === semester)?.label ?? semester;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Tổng quan" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Xin chào, {mockTeacherUser.title} {mockTeacherUser.name}
              </h1>
              <p className="text-xs text-[#475569] mt-1">
                {mockTeacherUser.department} - {mockTeacherUser.faculty}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Thẻ Học kỳ hiện tại + chọn học kỳ để xem số liệu */}
              <div className="flex items-center gap-2.5 px-4 py-2">
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Học kỳ hiện tại
                  </p>
                </div>
                <div className="w-40 ml-1">
                  <CustomDropdown
                    options={mockTeacherDashboard.semesters}
                    value={semester}
                    onChange={(value) => {
                      setSemester(value);
                      showToast(`Đã chuyển số liệu sang ${value}.`);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}</span>
              </button>
            </div>
          </div>

          {/* Cảnh báo gian lận: chỉ hiện khi có sự kiện gian lận thật đang chờ xử lý */}
          {pendingFraudAlerts.length > 0 && (
            <section className="border border-[#FDE68A] bg-[#FFFBEB] rounded-[16px] p-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#92400E]">
                    Cảnh báo gian lận phòng thi ({pendingFraudAlerts.length})
                  </p>
                  <p className="text-[11px] text-[#B45309] mt-0.5">
                    {pendingFraudAlerts
                      .map(
                        (item) =>
                          `${item.studentName} (${item.studentId}) - ${item.examCode}/${item.room}`
                      )
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/teacher/anti-cheat')}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Xử lý ngay
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>
          )}

          {/* 4 thẻ KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {dashboard.kpis.map((kpi) => {
              const Icon = KPI_ICONS[kpi.icon] || Database;

              return (
                <div
                  key={kpi.id}
                  className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center ${KPI_TONES[kpi.tone]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{kpi.label}</p>
                  <p className="text-2xl font-extrabold text-[#0F172A] leading-none mb-2">{kpi.value}</p>
                  <p className="text-[11px] text-[#475569] font-medium">{kpi.delta}</p>
                </div>
              );
            })}
          </div>

          {/* Khối biểu đồ chuyển đổi linh hoạt giữa Bar Chart và Donut Chart */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                {chartType === 'BAR' ? (
                  <TrendingUp className="w-4 h-4 text-[#06B6D4] shrink-0" />
                ) : (
                  <PieChart className="w-4 h-4 text-[#06B6D4] shrink-0" />
                )}
                <h2 className="text-sm font-bold text-[#0F172A] truncate">
                  {chartType === 'BAR'
                    ? trend.label
                    : `Phân bổ loại câu hỏi trong ngân hàng đề - ${semesterLabel}`}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-canvas rounded-[23px] p-1 w-fit">
                  {mockTeacherDashboard.chartTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setChartType(type.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] text-[11px] font-semibold transition-colors cursor-pointer ${
                        chartType === type.value
                          ? 'bg-white text-[#0891B2] shadow-sm'
                          : 'text-[#475569] hover:text-[#0891B2]'
                      }`}
                    >
                      {type.value === 'BAR' ? (
                        <BarChart3 className="w-3.5 h-3.5" />
                      ) : (
                        <PieChart className="w-3.5 h-3.5" />
                      )}
                      {type.label}
                    </button>
                  ))}
                </div>

                {chartType === 'BAR' && (
                  <div className="flex items-center gap-2">
                    {mockTeacherDashboard.chartViewModes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setViewMode(mode.value)}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          viewMode === mode.value
                            ? 'bg-[#06B6D4] text-white'
                            : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E0F2FE]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {chartType === 'BAR' ? (
              <>
                <TrendBarChart
                  items={trendItems}
                  xKey="label"
                  primaryKey="submissions"
                  secondaryKey="averageScore"
                  primaryLabel="Lượt nộp bài (bài)"
                  secondaryLabel="Điểm trung bình (điểm)"
                  secondaryMax={10}
                  emptyMessage={`Chưa có lượt nộp bài nào trong ${semesterLabel}. Số liệu sẽ xuất hiện sau khi có thí sinh nộp bài.`}
                />
                {trendItems.length > 0 && (
                  <p className="text-[10px] text-[#94A3B8] mt-4 leading-relaxed">
                    Hai cột dùng hai thang đo khác nhau: cột lượt nộp bài tính theo số
                    bài đã nộp, cột điểm trung bình tính theo thang điểm 10. Chỉ so sánh
                    chiều cao giữa các kỳ ở cùng một cột.
                  </p>
                )}
              </>
            ) : (
              <DonutChart
                items={dashboard.questionTypeDistribution}
                totalLabel="Câu hỏi"
                emptyMessage="Chưa có dữ liệu phân bổ câu hỏi."
              />
            )}
          </section>

          {/* Phòng thi đang diễn ra */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-[#0F172A]">Phòng thi đang diễn ra</h2>
              <button
                type="button"
                onClick={() => navigate('/teacher/anti-cheat')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
              >
                Xem bàn giám sát
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {visibleRooms.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                Hiện không có phòng thi nào đang diễn ra trong các môn bạn phụ trách.
              </p>
            ) : (
              <LiveRoomsTable
                rooms={visibleRooms}
                onMonitor={() => navigate('/teacher/anti-cheat')}
              />
            )}
          </section>

          {/* Nhật ký vi phạm gần nhất */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-bold text-[#0F172A]">Nhật ký vi phạm gần nhất</h2>
            </div>

            {scopedViolations.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                Chưa ghi nhận vi phạm nào trong các môn bạn phụ trách.
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {scopedViolations.slice(0, 4).map((violation) => (
                  <li key={violation.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A]">
                        {violation.studentName} - {violation.studentId}
                      </p>
                      <p className="text-[11px] text-[#475569] mt-0.5">
                        {violation.type} ({violation.occurrences}/{violation.maxOccurrences} lần) · {violation.examCode} · {violation.room}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-semibold text-[#0891B2] whitespace-nowrap">
                        Rủi ro AI {violation.aiRiskScore}%
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${RISK_TONES[violation.riskLevel]}`}>
                        {RISK_LEVEL_LABELS[violation.riskLevel]}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#F1F5F9] text-[10px] font-semibold text-[#475569] whitespace-nowrap">
                        {VIOLATION_STATUS_LABELS[violation.status]}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-medium">{violation.lastTime}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

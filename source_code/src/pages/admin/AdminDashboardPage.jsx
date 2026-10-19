import React, { useMemo, useState } from 'react';
import {
  RefreshCw,
  Activity,
  Users,
  BookOpen,
  Calendar,
  Radio,
  ShieldAlert,
  BarChart3,
  PieChart,
} from 'lucide-react';
import AdminSidebar from '../../components/common/AdminSidebar';
import AdminHeader from '../../components/common/AdminHeader';
import ToastNotification from '../../components/common/ToastNotification';
import TrendBarChart from '../../components/common/charts/TrendBarChart';
import DonutChart from '../../components/common/charts/DonutChart';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import {
  ADMIN_CURRENT_SEMESTER,
  ADMIN_INCIDENT_HANDLING_LABELS,
  ADMIN_SEMESTER_OPTIONS,
  buildAdminKpis,
  getAdminMonthlyAttempts,
  getAdminSemesterLabel,
  getAdminSemesterRangeLabel,
  getOnlineStudentCount,
  getSemesterAttemptTotal,
  mockAdminAccountByDepartment,
  mockAdminDepartmentSeries,
  mockAdminLiveRooms,
  withPercent,
} from '../../data/admin';

/** Icon + tông màu tương ứng với từng thẻ KPI trong dữ liệu. */
const KPI_VISUALS = {
  totalAccounts: { icon: Users, tone: 'bg-admin-subtle text-admin' },
  onlineStudents: { icon: Activity, tone: 'bg-primary-light text-primary' },
  totalSubjects: { icon: BookOpen, tone: 'bg-success-light text-success' },
  semesterExams: { icon: Calendar, tone: 'bg-warning-light text-warning' },
};

/** Tông màu nhãn xử lý sự cố trong Modal giám sát ca thi. */
const INCIDENT_HANDLING_TONES = {
  AUTO_WARNING: 'bg-warning-light text-warning',
  AUTO_RECONNECT: 'bg-success-light text-success',
  AUTO_LOGGED: 'bg-danger-light text-danger',
};

/** Hai cách thể hiện biểu đồ lượt thi theo tháng (FR-02.1). */
const ATTEMPT_CHART_MODES = [
  { value: 'OVERVIEW', label: 'Tổng quan toàn khoa' },
  { value: 'DEPARTMENT', label: 'Chia theo bộ môn' },
];

/**
 * Dashboard Quản trị viên (màn hình 4.0, FR-02).
 *
 * PHẠM VI DỮ LIỆU là điểm quan trọng nhất của màn hình:
 *  - Mọi số liệu THEO HỌC KỲ (số kỳ thi trong kỳ, biểu đồ lượt thi theo tháng)
 *    đều bám theo học kỳ đang chọn ở dropdown. Bỏ hẳn lựa chọn "Tất cả học kỳ"
 *    để không trộn số liệu nhiều kỳ vào cùng một biểu đồ.
 *  - Khối "Phòng thi đang diễn ra" KHÔNG theo học kỳ mà theo THỜI ĐIỂM HIỆN TẠI
 *    (đề nào đang mở phòng thì hiện), nên khi xem lại học kỳ cũ vẫn thấy đúng ca
 *    thi đang chạy, khối này được ghi rõ nhãn "thời gian thực" trên giao diện.
 *  - Thẻ "Tổng tài khoản" và biểu đồ "Phân bổ tài khoản" là TRẠNG THÁI HIỆN TẠI
 *    của hệ thống (tài khoản không gắn với học kỳ), cũng được ghi nhãn tương ứng
 *    để người xem không hiểu nhầm là số liệu của học kỳ đang chọn.
 */
export default function AdminDashboardPage() {
  const [semester, setSemester] = useState(ADMIN_CURRENT_SEMESTER);
  const [chartMode, setChartMode] = useState('OVERVIEW');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [inspectRoom, setInspectRoom] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const semesterLabel = getAdminSemesterLabel(semester);
  const semesterRangeLabel = getAdminSemesterRangeLabel(semester);

  /** 4 thẻ KPI: hai thẻ trạng thái hiện tại, hai thẻ theo học kỳ đang chọn. */
  const kpiCards = useMemo(
    () =>
      buildAdminKpis(semester).map((kpi) => ({
        ...kpi,
        ...KPI_VISUALS[kpi.id],
      })),
    [semester]
  );

  /** Lượt thi theo tháng của ĐÚNG học kỳ đang chọn (trục tháng theo khung học kỳ). */
  const monthlyAttempts = useMemo(() => getAdminMonthlyAttempts(semester), [semester]);
  const semesterAttemptTotal = useMemo(() => getSemesterAttemptTotal(semester), [semester]);

  /** Phân bổ tài khoản theo Bộ môn: trạng thái hiện tại, không theo học kỳ. */
  const accountDistribution = useMemo(() => withPercent(mockAdminAccountByDepartment), []);
  const accountTotal = useMemo(
    () => mockAdminAccountByDepartment.reduce((sum, item) => sum + item.count, 0),
    []
  );

  /**
   * Hai chế độ biểu đồ: tổng quan (một chuỗi) hoặc chia theo Bộ môn (nhiều chuỗi
   * cùng đơn vị "lượt thi", dùng chung một thang đo nên so sánh được với nhau).
   */
  const attemptChart =
    chartMode === 'DEPARTMENT'
      ? {
          series: mockAdminDepartmentSeries,
          primaryLabel: 'Lượt thi',
          emptyMessage: `Chưa có lượt thi nào được ghi nhận theo Bộ môn trong ${semesterLabel}.`,
        }
      : {
          series: null,
          primaryLabel: 'Lượt thi (bài đã nộp)',
          emptyMessage: `Chưa có lượt thi nào được ghi nhận trong ${semesterLabel}.`,
        };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Làm mới dữ liệu thành công!');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas flex font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Tổng quan" />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Header + bộ chọn học kỳ */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-textMain">Tổng quan hệ thống khảo thí</h1>
              <p className="text-xs text-textSub mt-1">
                Số liệu tài khoản, môn học và lượt thi của Khoa Công nghệ thông tin - đang xem{' '}
                <strong className="text-textMain">{semesterLabel}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2"></div>
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Học kỳ hiện tại
                  </p>
                </div>
              <div className="min-w-[230px]">
                <Dropdown
                  options={ADMIN_SEMESTER_OPTIONS}
                  value={semester}
                  onChange={(value) => {
                    setSemester(value);
                    showToast(`Đã chuyển số liệu sang ${getAdminSemesterLabel(value)}.`);
                  }}
                />
              </div>

              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-admin hover:bg-admin-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white p-5 rounded-card border border-borderLine shadow-card relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-textSub">{card.label}</span>
                    <div
                      className={`w-9 h-9 rounded-widget flex items-center justify-center ${card.tone}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-textMain tabular-nums">{card.value}</span>
                  </div>
                  <div
                    className={`mt-2 text-[11px] flex items-center gap-1 ${
                      card.isLive ? 'text-primary font-medium' : 'text-textSub'
                    }`}
                  >
                    <span>{card.isLive ? `● ${card.detail}` : card.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Biểu đồ lượt thi theo tháng, theo học kỳ đang chọn */}
            <section className="xl:col-span-full bg-white border border-borderLine rounded-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart3 className="w-4 h-4 text-admin shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-textMain">
                      Lượt thi theo tháng - {semesterLabel}
                    </h2>
                    <p className="text-[11px] text-textMuted mt-0.5">
                      Trục tháng của học kỳ: {semesterRangeLabel} · Tổng{' '}
                      <strong className="text-textMain">
                        {semesterAttemptTotal.toLocaleString('vi-VN')}
                      </strong>{' '}
                      lượt thi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-canvas rounded-[23px] p-1">
                  {ATTEMPT_CHART_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setChartMode(mode.value)}
                      className={`px-3 py-1.5 rounded-[24px] text-[11px] font-semibold transition-colors cursor-pointer ${
                        chartMode === mode.value
                          ? 'bg-white text-admin shadow-card'
                          : 'text-textSub hover:text-admin'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <TrendBarChart
                items={monthlyAttempts}
                xKey="label"
                tooltipLabelKey="fullLabel"
                primaryKey="attempts"
                secondaryKey={null}
                series={attemptChart.series}
                primaryLabel={attemptChart.primaryLabel}
                emptyMessage={attemptChart.emptyMessage}
              />

              {monthlyAttempts.length > 0 && (
                <p className="text-[10px] text-textMuted mt-4 leading-relaxed">
                  Tháng chưa có lượt thi vẫn hiển thị cột 0 để thấy đúng độ dài học kỳ. Một lượt thi
                  được tính khi thí sinh nộp bài thành công. Ở chế độ chia theo Bộ môn, các cột dùng
                  chung một thang đo nên so sánh được trực tiếp với nhau.
                </p>
              )}
            </section>

            {/* Phân bổ tài khoản, trạng thái hiện tại, không theo học kỳ */}
            <section className="xl:col-span-full bg-white border border-borderLine rounded-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-admin" />
                  <h2 className="text-sm font-bold text-textMain">
                    Phân bổ tài khoản theo bộ môn
                  </h2>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-textMuted bg-canvas border border-borderLine px-2 py-1 rounded-btn">
                  Số liệu hiện tại
                </span>
              </div>

              <DonutChart
                items={accountDistribution}
                totalLabel="Tài khoản"
                emptyMessage="Chưa có tài khoản nào trong hệ thống."
              />

              <p className="text-[10px] text-textMuted mt-4 leading-relaxed">
                Tổng {accountTotal} tài khoản .Tài khoản không gắn với học
                kỳ nên khối này không đổi theo bộ chọn học kỳ phía trên.
              </p>
            </section>
          </div>

          {/* Phòng thi đang diễn ra theo thời điểm hiện tại */}
          <div className="bg-white rounded-card border border-borderLine shadow-card overflow-hidden">
            <div className="p-5 border-b border-borderLine flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
                  Phòng thi đang diễn ra
                </h2>
                <p className="text-xs text-textSub mt-0.5">
                  Giám sát tiến độ, số lượng thí sinh kết nối và sự cố ca thi, luôn theo thời điểm
                  hiện tại, không phụ thuộc học kỳ đang chọn
                </p>
              </div>

              <div className="text-xs text-textSub bg-canvas border border-borderLine px-3 py-1.5 rounded-btn font-medium">
                Đang mở: <strong className="text-textMain">{mockAdminLiveRooms.length}</strong> phòng
                thi · <strong className="text-textMain">{getOnlineStudentCount()}</strong> thí sinh
              </div>
            </div>

            {mockAdminLiveRooms.length === 0 ? (
              <p className="p-8 text-center text-xs text-textMuted">
                Hiện không có phòng thi nào đang diễn ra.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-canvas border-b border-borderLine text-textMuted font-semibold">
                      <th className="py-3 px-4">Kỳ thi</th>
                      <th className="py-3 px-4">Môn thi</th>
                      <th className="py-3 px-4">Phòng thi</th>
                      <th className="py-3 px-4 text-center">Tiến độ thí sinh</th>
                      <th className="py-3 px-4">Khung giờ</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderLine text-textMain">
                    {mockAdminLiveRooms.map((room) => {
                      const ratio =
                        room.candidates > 0 ? Math.round((room.online / room.candidates) * 100) : 0;
                      return (
                        <tr key={room.id} className="hover:bg-canvas/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-textMain">{room.examCode}</td>
                          <td className="py-3.5 px-4 font-medium text-textMain">{room.subjectName}</td>
                          <td className="py-3.5 px-4 text-textSub">{room.room}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-xs tabular-nums">
                                {room.online}/{room.candidates} ({ratio}%)
                              </span>
                              <div className="w-24 bg-canvas h-1.5 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    ratio >= 90 ? 'bg-success' : 'bg-primary'
                                  }`}
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-textSub">{room.timeRange}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setInspectRoom(room)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-admin hover:bg-admin-dark text-white text-[10px] font-bold rounded-btn transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              Giám sát
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal giám sát ca thi (dùng Modal chung của Design System) */}
      <Modal
        isOpen={Boolean(inspectRoom)}
        onClose={() => setInspectRoom(null)}
        title={`Chi tiết giám sát ca thi: ${inspectRoom?.examCode ?? ''}`}
        icon={ShieldAlert}
        tone="admin"
        size="lg"
      >
        {inspectRoom && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-canvas border border-borderLine rounded-widget">
              <div>
                <span className="text-textMuted block">Môn thi:</span>
                <span className="font-semibold text-textMain">{inspectRoom.subjectName}</span>
              </div>
              <div>
                <span className="text-textMuted block">Phòng thi / Khung giờ:</span>
                <span className="font-semibold text-textMain">
                  {inspectRoom.room} • {inspectRoom.timeRange}
                </span>
              </div>
              <div>
                <span className="text-textMuted block">Thí sinh đang làm bài:</span>
                <span className="font-semibold text-textMain">
                  {inspectRoom.online} / {inspectRoom.candidates} thí sinh
                </span>
              </div>
              <div>
                <span className="text-textMuted block">Giám thị:</span>
                <span className="font-semibold text-textMain">{inspectRoom.proctorName}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-textMuted block">Tình trạng hệ thống:</span>
                <span className="font-semibold text-textMain">{inspectRoom.systemHealth}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-textMain mb-2">Nhật ký sự cố & vi phạm vừa ghi nhận</h4>

              {inspectRoom.incidents.length === 0 ? (
                <p className="p-4 bg-success-light border border-success-border rounded-widget text-success font-medium">
                  Ca thi này chưa ghi nhận sự cố hay vi phạm nào.
                </p>
              ) : (
                <div className="border border-borderLine rounded-widget overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-canvas text-textMuted font-semibold border-b border-borderLine">
                        <th className="py-2 px-3">Thời gian</th>
                        <th className="py-2 px-3">Thí sinh</th>
                        <th className="py-2 px-3">Sự kiện ghi nhận</th>
                        <th className="py-2 px-3">Xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderLine text-textMain">
                      {inspectRoom.incidents.map((incident) => (
                        <tr key={incident.id}>
                          <td className="py-2.5 px-3 text-textSub whitespace-nowrap">
                            {incident.at}
                          </td>
                          <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                            {incident.studentId} - {incident.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-textSub">{incident.event}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                                INCIDENT_HANDLING_TONES[incident.handling] ?? ''
                              }`}
                            >
                              {ADMIN_INCIDENT_HANDLING_LABELS[incident.handling] ??
                                incident.handling}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

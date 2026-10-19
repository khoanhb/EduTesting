/**
 * src/data/shared/semesters.js
 *
 * NGUỒN SỰ THẬT DUY NHẤT về học kỳ cho cả ba phân hệ (Sinh viên / Giảng viên /
 * Quản trị viên). Trước đây mỗi phân hệ tự khai báo danh sách học kỳ riêng nên
 * nhãn và thứ tự hiển thị có thể lệch nhau; nay tất cả cùng đọc từ đây.
 *
 * QUY ƯỚC KHUNG THỜI GIAN CỦA MỘT NĂM HỌC (cả hai đầu mút đều TÍNH VÀO học kỳ):
 *   - HK1      : Tháng 8  đến Tháng 12 của năm bắt đầu.
 *   - HK2      : Tháng 12 của năm bắt đầu đến Tháng 5 của năm kết thúc.
 *   - HK3 (hè) : Tháng 5  đến Tháng 8 của năm kết thúc.
 *
 * Tháng 12 giao giữa HK1–HK2 (kỳ thi cuối HK1 đồng thời là lúc bắt đầu HK2) và
 * Tháng 5 giao giữa HK2–HK3 (hết HK2 chính là lúc bắt đầu HK3 hè). Việc LỌC dữ
 * liệu vẫn dựa trên trường `semester` của từng đề thi nên không có đề nào bị
 * đếm hai lần; hai tháng giao nhau chỉ mở rộng trục tháng hiển thị của mỗi kỳ.
 *
 * Khi nối API: GET /semesters?schoolYear=2025-2026
 */

/** Các năm học đang có dữ liệu trong hệ thống. */
export const ACADEMIC_YEARS = ['2025-2026'];

/** Năm học mặc định của hệ thống (dùng cho tiêu đề, nhãn phụ). */
export const ACADEMIC_YEAR = ACADEMIC_YEARS[0];

/** Mã học kỳ theo đúng thứ tự thời gian trong một năm học. */
export const SEMESTER_CODES = ['HK1', 'HK2', 'HK3'];

/** Nhãn hiển thị ngắn của từng mã học kỳ. */
export const SEMESTER_CODE_LABELS = {
  HK1: 'HK1',
  HK2: 'HK2',
  HK3: 'HK3 (Hè)',
};

/**
 * Khung tháng của từng học kỳ.
 * `startYearOffset` cho biết tháng bắt đầu nằm ở năm nào trong cặp năm học:
 * 0 = năm bắt đầu, 1 = năm kết thúc.
 */
const SEMESTER_MONTH_RULES = {
  HK1: { startMonth: 8, endMonth: 12, startYearOffset: 0 },
  HK2: { startMonth: 12, endMonth: 5, startYearOffset: 0 },
  HK3: { startMonth: 5, endMonth: 8, startYearOffset: 1 },
};

const pad2 = (value) => String(value).padStart(2, '0');

/** Tách 'HK2/2025-2026' thành { code, startYear, endYear }; trả về null nếu sai định dạng. */
export function parseSemesterId(semesterId) {
  const [code, years] = String(semesterId ?? '').split('/');
  const [startYear, endYear] = String(years ?? '').split('-').map(Number);

  if (!SEMESTER_MONTH_RULES[code] || !startYear || !endYear) return null;

  return { code, startYear, endYear };
}

/** Danh sách học kỳ của toàn hệ thống (mọi năm học), theo thứ tự thời gian. */
export const SEMESTER_IDS = ACADEMIC_YEARS.flatMap((academicYear) =>
  SEMESTER_CODES.map((code) => `${code}/${academicYear}`)
);

/** Nhãn hiển thị của một học kỳ, ví dụ 'HK2 2025/2026'. */
export function getSemesterLabel(semesterId) {
  const parsed = parseSemesterId(semesterId);
  if (!parsed) return String(semesterId ?? '');

  return `${SEMESTER_CODE_LABELS[parsed.code]} ${parsed.startYear}/${parsed.endYear}`;
}

/** Tuỳ chọn cho dropdown chọn học kỳ. */
export const SEMESTER_OPTIONS = SEMESTER_IDS.map((semesterId) => ({
  value: semesterId,
  label: getSemesterLabel(semesterId),
}));

/**
 * Danh sách tháng của một học kỳ, đúng thứ tự thời gian.
 * Mỗi phần tử có `monthKey` ('2025-12') để lọc dữ liệu, nhãn trục `label` ('T12')
 * và nhãn đầy đủ `fullLabel` ('T12/2025') để hiển thị trong tooltip.
 */
export function getSemesterMonths(semesterId) {
  const parsed = parseSemesterId(semesterId);
  if (!parsed) return [];

  const rule = SEMESTER_MONTH_RULES[parsed.code];
  const monthNumbers = [];

  let cursor = rule.startMonth;
  for (let guard = 0; guard < 12; guard += 1) {
    monthNumbers.push(cursor);
    if (cursor === rule.endMonth) break;
    cursor = cursor === 12 ? 1 : cursor + 1;
  }

  let year = parsed.startYear + rule.startYearOffset;

  return monthNumbers.map((month, index) => {
    // Vòng qua tháng 1 thì năm phải tăng thêm 1 (HK2 đi từ T12 năm trước sang T1 năm sau).
    if (index > 0 && month === 1) year += 1;

    return {
      monthKey: `${year}-${pad2(month)}`,
      label: `T${month}`,
      fullLabel: `T${month}/${year}`,
      year,
      month,
    };
  });
}

/** Số tháng của một học kỳ. */
export const getSemesterMonthCount = (semesterId) => getSemesterMonths(semesterId).length;

/** Nhãn khoảng thời gian của học kỳ, ví dụ 'T12/2025 - T4/2026'. */
export function getSemesterRangeLabel(semesterId) {
  const months = getSemesterMonths(semesterId);
  if (months.length === 0) return '';

  return `${months[0].fullLabel} - ${months[months.length - 1].fullLabel}`;
}

/** Khóa tháng 'YYYY-MM' của một thời điểm. */
export const getMonthKeyOfDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

/** Khóa tháng 'YYYY-MM' của một mốc ISO; trả về null nếu không hợp lệ. */
export function getMonthKeyOfIso(isoValue) {
  if (!isoValue) return null;

  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return null;

  return getMonthKeyOfDate(date);
}

/** Kiểm tra một thời điểm có nằm trong học kỳ hay không. */
export function isDateInSemester(date, semesterId) {
  const monthKey = getMonthKeyOfDate(date);
  return getSemesterMonths(semesterId).some((month) => month.monthKey === monthKey);
}

/**
 * Mọi học kỳ có chứa một thời điểm. Tháng giao nhau (Tháng 12, Tháng 5) trả về
 * hai học kỳ, đúng với quy ước khung thời gian ở đầu tệp.
 */
export function getSemestersOfDate(date = new Date()) {
  const monthKey = getMonthKeyOfDate(date);

  return SEMESTER_IDS.filter((semesterId) =>
    getSemesterMonths(semesterId).some((month) => month.monthKey === monthKey)
  );
}

/**
 * Học kỳ để hiển thị mặc định cho một thời điểm.
 * Nếu thời điểm rơi vào tháng giao nhau, chọn học kỳ ĐẦU TIÊN theo thứ tự thời
 * gian (Tháng 12 đến HK2 vì HK2 vừa bắt đầu; Tháng 5 đến HK2 vì HK2 chưa kết thúc).
 */
export function getSemesterOfDate(date = new Date()) {
  return getSemestersOfDate(date)[0] ?? null;
}

/**
 * Học kỳ có dữ liệu gần nhất của bộ mock.
 * Dùng làm ĐÍCH LÙI khi thời điểm thực của máy không nằm trong năm học nào đang
 * có dữ liệu (ví dụ máy đang ở tháng 10/2026 trong khi dữ liệu mẫu thuộc năm học
 * 2025-2026). Nhờ vậy Dashboard luôn mở ở một học kỳ CÓ số liệu thay vì trắng.
 */
export const DATA_CURRENT_SEMESTER = 'HK2/2025-2026';

/** Học kỳ hiện tại: suy từ đồng hồ hệ thống, có đích lùi về học kỳ có dữ liệu. */
export const CURRENT_SEMESTER = getSemesterOfDate() ?? DATA_CURRENT_SEMESTER;

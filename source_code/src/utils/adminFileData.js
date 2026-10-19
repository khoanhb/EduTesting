import { mockClasses, mockDepartments, mockFaculties } from '../data/shared/organization';

export const STUDENT_COLUMNS = [
  { key: 'studentId', label: 'MSSV' }, { key: 'name', label: 'Họ và tên' },
  { key: 'email', label: 'Email' }, { key: 'departmentId', label: 'Mã ngành' },
  { key: 'classId', label: 'Mã lớp' }, { key: 'status', label: 'Trạng thái', optional: true },
];
export const TEACHER_COLUMNS = [
  { key: 'teacherId', label: 'MSGV' }, { key: 'name', label: 'Họ và tên' },
  { key: 'email', label: 'Email' }, { key: 'departmentId', label: 'Mã bộ môn' },
  { key: 'degree', label: 'Học vị', optional: true },
  { key: 'position', label: 'Chức danh', optional: true },
  { key: 'status', label: 'Trạng thái', optional: true },
];
export const SUBJECT_COLUMNS = [
  { key: 'code', label: 'Mã môn' }, { key: 'name', label: 'Tên môn' },
  { key: 'credits', label: 'Số tín chỉ' }, { key: 'departmentId', label: 'Mã bộ môn' },
  { key: 'status', label: 'Trạng thái', optional: true },
];
export const SCORE_COLUMNS = [
  { key: 'examCode', label: 'Mã kỳ thi' }, { key: 'studentId', label: 'MSSV' },
  { key: 'name', label: 'Họ và tên' }, { key: 'class', label: 'Lớp sinh hoạt' },
  { key: 'mcqScore', label: 'Điểm TN' }, { key: 'essayScore', label: 'Điểm TL' },
  { key: 'totalScore', label: 'Tổng điểm' }, { key: 'status', label: 'Trạng thái' },
];

const valueText = (value) => typeof value === 'string' || typeof value === 'number'
  ? String(value).trim() : value == null ? '' : '[Kiểu dữ liệu không hợp lệ]';
const normalize = (value) => valueText(value).toLocaleLowerCase('vi');
const statusOf = (value) => ({
  '': 'ACTIVE', active: 'ACTIVE', locked: 'LOCKED',
  'hoạt động': 'ACTIVE', 'đang khóa': 'LOCKED',
})[normalize(value)];

// Reject the entire file on any error: never silently overwrite existing rows.
export function validateImport(rows, kind, existing, otherUsers = []) {
  const columns = kind === 'STUDENT' ? STUDENT_COLUMNS : kind === 'TEACHER' ? TEACHER_COLUMNS : SUBJECT_COLUMNS;
  const errors = [], records = [];
  if (!rows.length) return { errors: ['File không có dòng tiêu đề.'], records };
  const header = rows[0].map(valueText);
  while (header.at(-1) === '') header.pop();
  for (const column of columns) {
    if (!column.optional && !header.includes(column.label)) errors.push('Thiếu cột: ' + column.label);
  }
  if (new Set(header).size !== header.length) errors.push('Tiêu đề có cột trùng tên.');
  if (header.some((label) => !columns.some((column) => column.label === label))) errors.push('File có cột không được hỗ trợ hoặc không đúng loại danh sách.');
  if (errors.length) return { errors, records };
  const identifierKey = kind === 'STUDENT' ? 'studentId' : kind === 'TEACHER' ? 'teacherId' : 'code';
  const identifiers = new Set(existing.map((item) => normalize(item[identifierKey])));
  const emails = new Set([...existing, ...otherUsers].map((item) => normalize(item.email)));
  rows.slice(1).forEach((row, index) => {
    if (row.every((value) => valueText(value) === '')) return;
    const line = index + 2;
    const reject = (message) => errors.push('Dòng ' + line + ': ' + message);
    const before = errors.length;
    const record = {};
    columns.forEach((column) => {
      const colIndex = header.indexOf(column.label);
      record[column.key] = colIndex < 0 ? '' : valueText(row[colIndex]);
      if (!column.optional && !record[column.key]) reject(column.label + ' không được để trống.');
      if (record[column.key].length > 254) reject(column.label + ' quá dài (tối đa 254 ký tự).');
      if (colIndex >= 0 && typeof row[colIndex] === 'number' && column.key !== 'credits'
        && !Number.isSafeInteger(row[colIndex])) reject(column.label + ' phải là văn bản hoặc số nguyên chính xác.');
      if (colIndex >= 0 && row[colIndex] != null && !['string', 'number'].includes(typeof row[colIndex])) reject(column.label + ' sai kiểu dữ liệu.');
    });
    if (row.slice(header.length).some((cell) => valueText(cell) !== '')) reject('Có dữ liệu ngoài các cột tiêu đề.');
    const code = record[identifierKey];
    const codePattern = kind === 'STUDENT' ? /^\d+$/ : kind === 'TEACHER' ? /^GV[A-Z0-9_-]+$/i : /^[A-Z0-9_-]+$/i;
    if (!codePattern.test(code)) reject('Mã định danh sai định dạng.');
    if (identifiers.has(normalize(code))) reject('Mã "' + code + '" đã tồn tại hoặc bị trùng trong file.');
    identifiers.add(normalize(code));
    const department = mockDepartments.find((item) => item.id === record.departmentId);
    if (!department) reject('Mã ngành/bộ môn không có trong danh mục.');
    const status = statusOf(record.status);
    if (!status) reject('Trạng thái chỉ nhận ACTIVE/LOCKED hoặc Hoạt động/Đang khóa.');
    const base = {
      ...record, status, facultyId: mockFaculties[0].id, faculty: mockFaculties[0].name,
      department: department?.name ?? '',
    };
    if (kind === 'SUBJECT') {
      const credits = Number(record.credits);
      if (!Number.isSafeInteger(credits) || credits <= 0) reject('Số tín chỉ phải là số nguyên dương.');
      Object.assign(base, { credits, chapters: [], teachers: [], chapterCount: 0, totalHours: 0, questionCount: 0, examCount: 0 });
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) reject('Email không hợp lệ.');
      if (emails.has(normalize(record.email))) reject('Email đã tồn tại hoặc bị trùng trong file.');
      emails.add(normalize(record.email));
      Object.assign(base, { role: kind });
      if (kind === 'STUDENT') {
        const classItem = mockClasses.find((item) => item.id === record.classId);
        if (!classItem || classItem.departmentId !== record.departmentId) reject('Mã lớp không tồn tại hoặc không thuộc ngành đã chọn.');
        Object.assign(base, { class: classItem?.name ?? '', majorId: record.departmentId, major: department?.majorName ?? '' });
      } else {
        const degree = record.degree || 'ThS.';
        const position = record.position || 'Giảng viên';
        if (!['ThS.', 'TS.', 'PGS.TS.', 'GS.TS.'].includes(degree)) reject('Học vị không hợp lệ.');
        if (!['Giảng viên', 'Giảng viên chính', 'Trưởng bộ môn', 'Phó trưởng bộ môn'].includes(position)) reject('Chức danh không hợp lệ.');
        Object.assign(base, { degree, position, academicTitle: position, managedSubjectCodes: [] });
      }
    }
    if (errors.length === before) records.push(base);
  });
  if (!records.length && !errors.length) errors.push('File không có dòng dữ liệu.');
  return { errors, records: errors.length ? [] : records };
}

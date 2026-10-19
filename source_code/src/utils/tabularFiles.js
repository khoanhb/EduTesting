export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;

// CSV UTF-8, quoted fields, escaped quotes and CRLF/newlines inside cells.
export function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
  const rows = [];
  let row = [], cell = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === delimiter || char === '\n' || char === '\r') {
      row.push(cell); cell = ''; closed = false;
      if (char !== delimiter) {
        rows.push(row); row = [];
        if (char === '\r' && text[i + 1] === '\n') i += 1;
      }
    } else if (char === '"') {
      if (cell !== '' || closed) throw new Error('CSV sai định dạng dấu ngoặc kép.');
      quoted = true;
    } else {
      if (closed) throw new Error('CSV có ký tự ngoài ô đã đóng ngoặc kép.');
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV thiếu dấu ngoặc kép kết thúc.');
  if (cell !== '' || row.length || closed) { row.push(cell); rows.push(row); }
  return rows;
}

export function createCsv(columns, rows) {
  const quote = (value) => {
    let text = String(value ?? '');
    // Keep spreadsheet applications from executing user-entered formulas.
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return '\uFEFF' + [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => row[column.key] ?? '')),
  ].map((row) => row.map(quote).join(',')).join('\r\n');
}

export async function readTabularFile(file) {
  if (!/\.(xlsx|csv)$/i.test(file.name)) throw new Error('Chỉ hỗ trợ file .xlsx hoặc .csv.');
  if (file.size > MAX_IMPORT_BYTES) throw new Error('File vượt giới hạn 5 MB.');
  if (file.size === 0) throw new Error('File không có dữ liệu.');
  let rows;
  if (/\.csv$/i.test(file.name)) {
    const buffer = await file.arrayBuffer();
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
    catch { throw new Error('CSV phải dùng mã hóa UTF-8.'); }
    rows = parseCsv(text);
  } else {
    const { readSheet } = await import('read-excel-file/browser');
    try { rows = await readSheet(file); }
    catch { throw new Error('Không đọc được XLSX. Kiểm tra file không hỏng hoặc có mật khẩu.'); }
  }
  if (rows.length > MAX_IMPORT_ROWS + 1) throw new Error('Chỉ nhập tối đa 5.000 dòng dữ liệu mỗi file.');
  return rows;
}

export async function exportTable(columns, rows, filename, format = 'xlsx') {
  if (rows.length === 0) throw new Error('Không có dữ liệu theo bộ lọc hiện tại để xuất.');
  if (format === 'csv') {
    const blob = new Blob([createCsv(columns, rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename + '.csv';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const data = [
    columns.map((column) => ({ value: column.label, type: String, fontWeight: 'bold' })),
    ...rows.map((row) => columns.map((column) => {
      const value = row[column.key] ?? '';
      return { value, type: typeof value === 'number' && Number.isFinite(value) ? Number : String };
    })),
  ];
  await writeExcelFile(data, { sheet: 'Du lieu' }).toFile(filename + '.xlsx');
}

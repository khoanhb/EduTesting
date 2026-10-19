import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { parseCsv, createCsv, readTabularFile, MAX_IMPORT_BYTES } from '../src/utils/tabularFiles.js';
const require = createRequire(import.meta.url);
const jiti = require('jiti')(import.meta.url);
const { validateImport, STUDENT_COLUMNS, TEACHER_COLUMNS, SUBJECT_COLUMNS } = jiti('../src/utils/adminFileData.js');
const student = ['00001234', 'Nguyễn, "An"', 'an@example.test', 'DEPT_CNPM', 'CLS_21050301', 'ACTIVE'];
const header = STUDENT_COLUMNS.map(c => c.label);

test('CSV handles BOM, Unicode, quotes, embedded newlines and semicolon', () => {
  const csv = createCsv(STUDENT_COLUMNS, [Object.fromEntries(STUDENT_COLUMNS.map((c, i) => [c.key, student[i]]))]);
  assert.deepEqual(parseCsv(csv), [header, student]);
  assert.deepEqual(parseCsv('A;B\r\n"một\nhai";"a""b"'), [['A','B'], ['một\nhai','a"b']]);
  assert.throws(() => parseCsv('A\n"unclosed'), /ngoặc kép/);
  assert.throws(() => parseCsv('A\n"x"garbage'), /ngoặc kép/);
});
test('CSV export neutralizes formulas', () => {
  const csv = createCsv([{ key:'v', label:'Nội dung' }], ['=1+1', '+SUM(A1)', '-2', '@x', '\t=3'].map(v=>({v})));
  assert.deepEqual(parseCsv(csv).slice(1).map(r=>r[0]), ["'=1+1", "'+SUM(A1)", "'-2", "'@x", "'\t=3"]);
});
test('file reader enforces type, size, encoding and row limits', async () => {
  assert.deepEqual(await readTabularFile(new File(['A,B\n1,2'], 'ok.CSV')), [['A','B'],['1','2']]);
  await assert.rejects(readTabularFile(new File(['x'], 'old.xls')), /xlsx/);
  await assert.rejects(readTabularFile(new File([], 'empty.csv')), /không có dữ liệu/);
  await assert.rejects(readTabularFile({ name:'big.csv', size:MAX_IMPORT_BYTES+1 }), /5 MB/);
  await assert.rejects(readTabularFile(new File([new Uint8Array([255])], 'bad.csv')), /UTF-8/);
  await assert.rejects(readTabularFile(new File(['A\n'+'x\n'.repeat(5001)], 'rows.csv')), /5.000/);
});
test('valid student derives canonical class/major and preserves zero prefix', () => {
  const r=validateImport([header,student], 'STUDENT', []);
  assert.deepEqual(r.errors, []);
  assert.equal(r.records[0].studentId,'00001234');
  assert.equal(r.records[0].class,'21050301');
  assert.equal(r.records[0].majorId,'DEPT_CNPM');
});
test('invalid or duplicate data rejects whole file with row numbers', () => {
  const bad=[...student]; bad[0]='999999'; bad[2]='broken'; bad[4]='CLS_21050305';
  const r=validateImport([header,student,bad], 'STUDENT', []);
  assert.equal(r.records.length,0);
  assert.ok(r.errors.every(e=>e.startsWith('Dòng 3:')));
  assert.ok(r.errors.some(e=>e.includes('Email')));
  assert.ok(r.errors.some(e=>e.includes('Mã lớp')));
  assert.equal(validateImport([header,student,student], 'STUDENT', []).records.length,0);
  assert.ok(validateImport([header,student], 'STUDENT', [{studentId:student[0]}]).errors.length);
  assert.ok(validateImport([header,student], 'STUDENT', [], [{email:'AN@EXAMPLE.TEST'}]).errors.length);
});
test('headers and unsupported cell values fail explicitly', () => {
  assert.ok(validateImport([['MSSV'],['123']], 'STUDENT', []).errors.some(e=>e.includes('Thiếu cột')));
  assert.ok(validateImport([[...header,'Email'],student], 'STUDENT', []).errors.some(e=>e.includes('trùng')));
  assert.ok(validateImport([[...header,'Unknown'],student], 'STUDENT', []).errors.some(e=>e.includes('không được hỗ trợ')));
  const invalid=[...student]; invalid[1]=true;
  assert.ok(validateImport([header,invalid], 'STUDENT', []).errors.some(e=>e.includes('sai kiểu')));
  assert.ok(validateImport([header], 'STUDENT', []).errors.some(e=>e.includes('không có dòng dữ liệu')));
});
test('teacher and subject imports initialize local record shapes', () => {
  const teacher=validateImport([TEACHER_COLUMNS.map(c=>c.label),['GV_TEST','Cô An','teacher@example.test','DEPT_CNPM','','','']], 'TEACHER', []);
  assert.deepEqual(teacher.errors,[]);
  assert.equal(teacher.records[0].degree,'ThS.');
  assert.deepEqual(teacher.records[0].managedSubjectCodes,[]);
  const columns=SUBJECT_COLUMNS.map(c=>c.label);
  const row=['TEST_01','Môn thử',3,'DEPT_CNPM','LOCKED'];
  const subject=validateImport([columns,row], 'SUBJECT', []);
  assert.deepEqual(subject.errors,[]);
  assert.equal(subject.records[0].credits,3);
  assert.deepEqual(subject.records[0].chapters,[]);
  for(const credits of [0,-1,1.5,'bad']) {
    assert.ok(validateImport([columns,[...row.slice(0,2),credits,...row.slice(3)]], 'SUBJECT', []).errors.length);
  }
  assert.ok(validateImport([columns,row], 'SUBJECT', [{code:'test_01'}]).errors.length);
});

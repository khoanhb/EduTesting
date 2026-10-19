import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { transform } = require('sucrase');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter, Routes, Route } = require('react-router-dom');
const root = path.resolve(import.meta.dirname, '..');
const cache = new Map();

// Render the actual JSX pages without a browser or effects; all dependencies stay real.
function load(file) {
  const full = path.resolve(root, file);
  if (cache.has(full)) return cache.get(full).exports;
  if (/\.png$/.test(full)) return full;
  const module = { exports: {} };
  cache.set(full, module);
  const source = transform(fs.readFileSync(full, 'utf8'), { transforms: ['jsx', 'imports'], production: true }).code;
  const scopedRequire = (ref) => {
    if (!ref.startsWith('.')) return require(ref);
    const base = path.resolve(path.dirname(full), ref);
    const target = ['', '.js', '.jsx', '/index.js'].map((ext) => base + ext)
      .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(target, `Unresolved ${ref} in ${full}`);
    return load(target);
  };
  new Function('require', 'module', 'exports', source)(scopedRequire, module, module.exports);
  return module.exports;
}

const render = (page, route, url) => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [url] },
  React.createElement(Routes, null, React.createElement(Route, { path: route, element: React.createElement(load(page).default) }))));
const resultPage = 'src/pages/student/ExamResultPage.jsx';
const reviewPage = 'src/pages/student/ExamReviewPage.jsx';
const resultRoute = '/student/exam-result/:id';
const reviewRoute = '/student/exam-review/:id';

test('room entry rejects missing, upcoming and exhausted exams without falling back', () => {
  const { canEnterStudentExam, getStudentExamConfig } = load('src/data/student/mockStudentExams.js');
  assert.equal(canEnterStudentExam(null), false);
  assert.equal(canEnterStudentExam({ status: 'UPCOMING', currentAttempt: 1, maxAttempts: 3 }), false);
  assert.equal(canEnterStudentExam({ status: 'ACTIVE', currentAttempt: 4, maxAttempts: 3 }), false);
  assert.equal(canEnterStudentExam({ status: 'ACTIVE', currentAttempt: 3, maxAttempts: 3 }), true);
  assert.equal(canEnterStudentExam({ status: 'ACTIVE', currentAttempt: 20, maxAttempts: 0 }), true);
  assert.equal(getStudentExamConfig({ examCode: 'AI_QT01_01' }).antiCheat, false);
  for (const page of ['ExamDetailPage', 'ExamRoomPage']) {
    const segment = page === 'ExamDetailPage' ? 'exam-detail' : 'exam-room';
    const html = render(`src/pages/student/${page}.jsx`, `/student/${segment}/:id`, `/student/${segment}/INVALID`);
    assert.ok(html.includes('Không tìm thấy bài thi'));
    assert.ok(!html.includes('CSDL_ONTAP_C3'));
  }
  const upcoming = render('src/pages/student/ExamRoomPage.jsx', '/student/exam-room/:id', '/student/exam-room/TCMT_QT02_01');
  assert.ok(upcoming.includes('Bài thi chưa mở'));
  assert.ok(!upcoming.includes('Nộp bài'));
});

test('publication, review and pending/resolved violations control actual student markup', () => {
  const access = load('src/utils/examAccess.js').getExamAccess;
  for (const score of [false, true]) for (const review of [false, true]) {
    const exam = { config: { showScoreImmediately: score, allowReview: review } };
    const normal = access(exam, { score: 0 });
    assert.equal(normal.canShowScore, score);
    assert.equal(normal.canReview, review);
    assert.equal(normal.canShowDetails, score && review);
    const held = access(exam, { score: 8, isSuspended: true });
    assert.equal(held.canShowScore, false);
    assert.equal(held.canReview, false);
    const resolved = access(exam, { score: 8, isSuspended: true, report: { penalty: 'Trừ 50% số điểm bài thi' } });
    assert.equal(resolved.canShowScore, score);
    assert.equal(resolved.canReview, review);
  }
  assert.ok(render(resultPage, resultRoute, '/student/exam-result/CSDL_ONTAP_C3').includes('Số câu đúng'));
  const suspended = render(resultPage, resultRoute, '/student/exam-result/CSDL_ONTAP_C10');
  assert.ok(suspended.includes('Đang chờ xử lý'));
  assert.ok(!suspended.includes('Số câu đúng'));
  assert.ok(!suspended.includes('Số câu sai'));
  assert.ok(render(resultPage, resultRoute, '/student/exam-result/TCMT_QT02_01').includes('Chưa có kết quả'));
  assert.ok(render(reviewPage, reviewRoute, '/student/exam-review/CSDL_ONTAP_C6').includes('chưa được phép'));
  assert.ok(render(reviewPage, reviewRoute, '/student/exam-review/CSDL_ONTAP_C9?attempt=99').includes('chưa được phép'));
  assert.ok(render(reviewPage, reviewRoute, '/student/exam-review/CSDL_ONTAP_C9?attempt=1').includes('Điểm:'));
  const canonical = load('src/data/teacher/mockExams.js').getExamById('CSDL_ONTAP_C3');
  canonical.showScoreImmediately = false;
  canonical.allowReview = true;
  const unpublished = render(reviewPage, reviewRoute, '/student/exam-review/CSDL_ONTAP_C3');
  for (const hidden of ['Điểm:', 'Giải thích chi tiết:', 'Đáp án chấp nhận:', 'Đúng:', 'Sai:']) assert.ok(!unpublished.includes(hidden), hidden);
  assert.ok(unpublished.includes('Đã trả lời'));
  canonical.showScoreImmediately = true;
  canonical.allowReview = false;
  const scoreOnly = render(resultPage, resultRoute, '/student/exam-result/CSDL_ONTAP_C3');
  assert.ok(scoreOnly.includes('ĐIỂM SỐ CỦA BẠN'));
  assert.ok(!scoreOnly.includes('Số câu đúng'));
  assert.ok(render(reviewPage, reviewRoute, '/student/exam-review/CSDL_ONTAP_C3').includes('chưa được phép'));
  canonical.allowReview = true;
});

test('retakes respect unlimited attempts and clear results from the previous attempt', () => {
  const { mockStudentExams, canRetakeStudentExam, advanceStudentExamAttempt, getStudentExamResult } = load('src/data/student/mockStudentExams.js');
  const original = mockStudentExams[0];
  try {
    assert.equal(canRetakeStudentExam(undefined), false);
    assert.equal(advanceStudentExamAttempt('INVALID'), false);
    for (const currentAttempt of [1, 3, 20]) {
      mockStudentExams[0] = { ...original, currentAttempt, maxAttempts: 0 };
      assert.equal(canRetakeStudentExam(mockStudentExams[0]), true);
      assert.ok(render('src/pages/student/ExamDetailPage.jsx', '/student/exam-detail/:id', '/student/exam-detail/' + original.id).includes('Không giới hạn'));
      const resultHtml = render(resultPage, resultRoute, '/student/exam-result/' + original.id);
      assert.ok(resultHtml.includes('Không giới hạn lượt'));
      assert.ok(!resultHtml.includes('Infinity'));
      assert.equal(advanceStudentExamAttempt(original.id), true);
      assert.equal(mockStudentExams[0].currentAttempt, currentAttempt + 1);
      assert.equal(getStudentExamResult(mockStudentExams[0]), null);
      assert.equal(advanceStudentExamAttempt(original.id), false);
      assert.ok(render(resultPage, resultRoute, '/student/exam-result/' + original.id).includes('Chưa có kết quả'));
    }
    for (const patch of [
      { currentAttempt: 3, maxAttempts: 3 },
      { currentAttempt: 0, maxAttempts: 3 },
      { currentAttempt: 1.5, maxAttempts: 3 },
      { status: 'UPCOMING' },
      { lastResult: null },
    ]) {
      mockStudentExams[0] = { ...original, ...patch };
      assert.equal(canRetakeStudentExam(mockStudentExams[0]), false);
      assert.equal(advanceStudentExamAttempt(original.id), false);
    }
    mockStudentExams[0] = { ...original, currentAttempt: 2, maxAttempts: 3 };
    assert.equal(advanceStudentExamAttempt(original.id), true);
    assert.equal(mockStudentExams[0].currentAttempt, 3);
  } finally {
    mockStudentExams[0] = original;
  }
});


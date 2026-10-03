const S = {
  CONFIG: 'CONFIG', TEACHERS: 'TEACHERS', STUDENTS: 'STUDENTS', SUBJECTS: 'SUBJECTS',
  EXAMS: 'EXAMS', QUESTIONS: 'QUESTIONS', ATTEMPTS: 'ATTEMPTS', RESULTS: 'RESULTS', MATERIALS: 'MATERIALS'
};

/* ================= HELPER ================= */
const isTrue_ = v => String(v).toUpperCase() === 'TRUE';
const sheet_ = n => SpreadsheetApp.getActive().getSheetByName(n);
function rows(n) { return sheet_(n).getDataRange().getValues(); }
function toDate_(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function iso_(v) {
  if (v instanceof Date) return v.toISOString();
  return String(v || '');
}

/* ================= SETUP (HATI-HATI: MENGHAPUS SEMUA DATA) ================= */
function setupV3() {
  const ss = SpreadsheetApp.getActive();
  const schemas = {
    CONFIG: ['KEY', 'VALUE'],
    TEACHERS: ['TEACHER_ID', 'PIN', 'NAME', 'ACTIVE'],
    STUDENTS: ['STUDENT_ID', 'PIN', 'NAME', 'CLASS', 'ACTIVE'],
    SUBJECTS: ['SUBJECT_ID', 'SUBJECT_NAME', 'ACTIVE'],
    EXAMS: ['EXAM_ID', 'SUBJECT_ID', 'EXAM_TITLE', 'DESCRIPTION', 'DURATION_MINUTES', 'ACTIVE', 'START_DATE', 'END_DATE'],
    QUESTIONS: ['EXAM_ID', 'NO', 'QUESTION', 'OPTION_A', 'OPTION_B', 'OPTION_C', 'OPTION_D', 'ANSWER', 'POINT'],
    ATTEMPTS: ['ATTEMPT_ID', 'EXAM_ID', 'STUDENT_ID', 'START_TIME', 'DEADLINE', 'STATUS', 'SUBMITTED_AT'],
    RESULTS: ['TIMESTAMP', 'ATTEMPT_ID', 'EXAM_ID', 'SUBJECT_ID', 'STUDENT_ID', 'NAME', 'CLASS', 'SCORE', 'CORRECT', 'WRONG', 'TOTAL', 'DURATION_SECONDS', 'STATUS'],
    MATERIALS: ['MATERIAL_ID', 'SUBJECT_ID', 'TITLE', 'DESCRIPTION', 'FILE_URL', 'FILE_ID', 'ACTIVE', 'CREATED_AT', 'CREATED_BY']
  };

  Object.entries(schemas).forEach(([n, h]) => {
    const sh = ss.getSheetByName(n) || ss.insertSheet(n);
    sh.clear();
    sh.getRange(1, 1, 1, h.length).setValues([h]);
    sh.setFrozenRows(1);
  });

  // Format teks agar ID/PIN (mis. "0123") dan pilihan jawaban (mis. "3.051") tidak diubah jadi angka
  const asText = (name, c1, c2) => {
    const sh = ss.getSheetByName(name);
    sh.getRange(2, c1, sh.getMaxRows() - 1, c2 - c1 + 1).setNumberFormat('@');
  };
  asText(S.TEACHERS, 1, 2);
  asText(S.STUDENTS, 1, 2);
  asText(S.QUESTIONS, 3, 8);

  ss.getSheetByName(S.CONFIG).getRange(2, 1, 2, 2).setValues([
    ['SCHOOL_NAME', 'Sekolah Dasar'], ['APP_TITLE', 'Sistem Ujian Online SD V3']
  ]);
  ss.getSheetByName(S.TEACHERS).getRange(2, 1, 2, 4).setValues([
    ['G001', 'admin123', 'Guru Admin', 'TRUE'], ['G002', '1234', 'Guru Kelas 4', 'TRUE']
  ]);
  ss.getSheetByName(S.STUDENTS).getRange(2, 1, 3, 5).setValues([
    ['S001', '1234', 'Andi', '4A', 'TRUE'], ['S002', '1234', 'Budi', '4A', 'TRUE'], ['S003', '1234', 'Citra', '4B', 'TRUE']
  ]);
  ss.getSheetByName(S.SUBJECTS).getRange(2, 1, 3, 3).setValues([
    ['MTK', 'Matematika', 'TRUE'], ['IPAS', 'IPAS', 'TRUE'], ['PPKN', 'Pendidikan Pancasila', 'TRUE']
  ]);
  ss.getSheetByName(S.EXAMS).getRange(2, 1, 3, 8).setValues([
    ['MTK4-01', 'MTK', 'Matematika Kelas 4 - Operasi Hitung', 'Penjumlahan, pengurangan, perkalian, pembagian.', 15, 'TRUE', '', ''],
    ['IPAS4-01', 'IPAS', 'IPAS Kelas 4 - Wujud Zat', 'Materi dan perubahan wujud zat.', 20, 'TRUE', '', ''],
    ['PPKN4-01', 'PPKN', 'Pendidikan Pancasila Kelas 4', 'BPUPK dan sejarah kelahiran Pancasila.', 20, 'TRUE', '', '']
  ]);
  const q = [
    ['MTK4-01', 1, 'Hasil dari 82 - 9 adalah ...', '71', '72', '73', '74', 'C', 10],
    ['MTK4-01', 2, 'Hasil dari 824 - 637 adalah ...', '187', '197', '207', '217', 'A', 10],
    ['MTK4-01', 3, 'Hasil dari 37 + 2.934 + 180 adalah ...', '3.051', '3.151', '3.251', '3.351', 'B', 10],
    ['MTK4-01', 4, 'Hasil dari 87 × 6 adalah ...', '512', '522', '532', '542', 'C', 10],
    ['MTK4-01', 5, 'Hasil dari 79 × 63 adalah ...', '4.877', '4.977', '5.077', '5.177', 'B', 10],
    ['MTK4-01', 6, 'Hasil dari 275 × 982 adalah ...', '270.050', '270.150', '270.250', '270.350', 'C', 10],
    ['MTK4-01', 7, 'Hasil dari 98 : 3 adalah ...', '32 sisa 1', '31 sisa 2', '33 sisa 1', '32 sisa 2', 'A', 10],
    ['MTK4-01', 8, 'Hasil dari 695 : 8 adalah ...', '86 sisa 7', '87 sisa 1', '88 sisa 1', '86 sisa 1', 'A', 10]
  ];
  ss.getSheetByName(S.QUESTIONS).getRange(2, 1, q.length, 9).setValues(q);
}

/* ================= WEB APP ================= */
function doGet(e) {
  const page = e && e.parameter && e.parameter.mode === 'guru' ? 'Guru' : 'Index';
  return HtmlService.createHtmlOutputFromFile(page)
    .setTitle('Sistem Ujian Online SD')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ================= LOGIN ================= */
function loginStudent(id, pin) {
  const r = rows(S.STUDENTS).slice(1).find(x =>
    String(x[0]).trim() === String(id).trim() &&
    String(x[1]).trim() === String(pin).trim() &&
    isTrue_(x[4]));
  return r
    ? { ok: true, student: { id: String(r[0]), name: String(r[2]), className: String(r[3]) } }
    : { ok: false, message: 'ID siswa atau PIN salah, atau akun tidak aktif.' };
}

function loginTeacher(id, pin) {
  const r = rows(S.TEACHERS).slice(1).find(x =>
    String(x[0]).trim() === String(id).trim() &&
    String(x[1]).trim() === String(pin).trim() &&
    isTrue_(x[3]));
  if (!r) return { ok: false, message: 'ID guru atau PIN salah.' };
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('T:' + token, JSON.stringify({ id: String(r[0]), name: String(r[2]) }), 21600);
  return { ok: true, token, name: String(r[2]) };
}

function teacher_(token) {
  const s = CacheService.getScriptCache().get('T:' + token);
  if (!s) throw Error('Sesi guru berakhir. Silakan login kembali.');
  return JSON.parse(s);
}

/* ================= SISWA ================= */
function getSubjects() {
  return rows(S.SUBJECTS).slice(1)
    .filter(r => isTrue_(r[2]))
    .map(r => ({ id: String(r[0]), name: String(r[1]) }));
}

function getExams(sub, student) {
  const exams = rows(S.EXAMS).slice(1).filter(r => String(r[1]) === String(sub) && isTrue_(r[5]));
  const attempts = rows(S.ATTEMPTS).slice(1).filter(r => String(r[2]) === String(student));
  const now = new Date();
  return exams.map(r => {
    const st = toDate_(r[6]), en = toDate_(r[7]);
    const done = attempts.some(z => String(z[1]) === String(r[0]));
    return {
      id: String(r[0]), subjectId: String(r[1]), title: String(r[2]), description: String(r[3]),
      duration: Number(r[4] || 15),
      available: (!st || now >= st) && (!en || now <= en),
      done: done
    };
  });
}

function getStudentResults(id) {
  const titles = {};
  rows(S.EXAMS).slice(1).forEach(r => titles[String(r[0])] = String(r[2]));
  return rows(S.RESULTS).slice(1)
    .filter(r => String(r[4]) === String(id))
    .map(r => ({
      examId: String(r[2]), examTitle: titles[String(r[2])] || String(r[2]),
      score: Number(r[7]), correct: Number(r[8]), total: Number(r[10]), status: String(r[12])
    }));
}

function exam_(id) {
  const e = rows(S.EXAMS).slice(1).find(r => String(r[0]) === String(id));
  if (!e) throw Error('Ujian tidak ditemukan.');
  const q = rows(S.QUESTIONS).slice(1)
    .filter(r => String(r[0]) === String(id))
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  return {
    id: String(e[0]), subjectId: String(e[1]), title: String(e[2]), description: String(e[3]),
    duration: Number(e[4] || 15),
    questions: q.map(r => ({
      no: Number(r[1]), question: String(r[2]),
      options: { A: String(r[3]), B: String(r[4]), C: String(r[5]), D: String(r[6]) }
    }))
  };
}

function startExam(student, examId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (rows(S.ATTEMPTS).slice(1).some(r => String(r[1]) === String(examId) && String(r[2]) === String(student)))
      return { ok: false, message: 'Ujian ini sudah pernah dikerjakan.' };

    const row = rows(S.EXAMS).slice(1).find(r => String(r[0]) === String(examId));
    if (!row || !isTrue_(row[5])) return { ok: false, message: 'Ujian tidak tersedia.' };

    const now = new Date(), st = toDate_(row[6]), en = toDate_(row[7]);
    if ((st && now < st) || (en && now > en)) return { ok: false, message: 'Ujian belum dibuka atau sudah ditutup.' };

    const e = exam_(examId);
    if (!e.questions.length) return { ok: false, message: 'Ujian ini belum memiliki soal.' };

    const dead = new Date(now.getTime() + e.duration * 60000);
    const id = Utilities.getUuid();
    sheet_(S.ATTEMPTS).appendRow([id, e.id, student, now, dead, 'STARTED', '']);
    return { ok: true, attemptId: id, exam: e, deadline: dead.getTime(), serverNow: now.getTime() };
  } finally {
    lock.releaseLock();
  }
}

function submitExam(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(S.ATTEMPTS);
    const d = sh.getDataRange().getValues();
    const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(p.attemptId));
    if (i < 1) throw Error('Percobaan tidak ditemukan.');
    const a = d[i];
    if (['SUBMITTED', 'TIMEOUT'].includes(String(a[5]))) throw Error('Ujian sudah dikumpulkan.');

    const now = new Date();
    const status = now > new Date(a[4]) ? 'TIMEOUT' : 'SUBMITTED';
    const qs = rows(S.QUESTIONS).slice(1).filter(r => String(r[0]) === String(a[1]));
    const answers = p.answers || {};

    let cor = 0, max = 0, earned = 0;
    qs.forEach(q => {
      const pt = Number(q[8] || 10);
      max += pt;
      if (String(answers[q[1]] || '').toUpperCase() === String(q[7]).toUpperCase()) { cor++; earned += pt; }
    });

    const total = qs.length;
    const score = max ? Math.round(earned / max * 100) : 0;
    const student = rows(S.STUDENTS).slice(1).find(r => String(r[0]) === String(a[2])) || [];
    const exam = rows(S.EXAMS).slice(1).find(r => String(r[0]) === String(a[1])) || [];

    sh.getRange(i + 1, 6, 1, 2).setValues([[status, now]]);
    ss.getSheetByName(S.RESULTS).appendRow([
      now, p.attemptId, a[1], exam[1], a[2], student[2], student[3],
      score, cor, total - cor, total, Math.round((now - new Date(a[3])) / 1000), status
    ]);
    return { score, correct: cor, total, status };
  } finally {
    lock.releaseLock();
  }
}

/* ================= GURU ================= */
function teacherData(token) {
  teacher_(token);
  const results = rows(S.RESULTS).slice(1).map(x => ({
    examId: String(x[2]), subjectId: String(x[3]), studentId: String(x[4]), name: String(x[5]),
    className: String(x[6]), score: Number(x[7]), correct: Number(x[8]), wrong: Number(x[9]),
    total: Number(x[10]), status: String(x[12])
  }));
  const students = rows(S.STUDENTS).slice(1).filter(x => isTrue_(x[4]))
    .map(x => ({ id: String(x[0]), name: String(x[2]), className: String(x[3]) }));
  const subjects = rows(S.SUBJECTS).slice(1).filter(x => isTrue_(x[2]))
    .map(x => ({ id: String(x[0]), name: String(x[1]) }));
  const exams = rows(S.EXAMS).slice(1).map(x => ({
    id: String(x[0]), subjectId: String(x[1]), title: String(x[2]), description: String(x[3]),
    duration: Number(x[4]), active: String(x[5]).toUpperCase(),
    start: iso_(x[6]), end: iso_(x[7])
  }));
  const materials = rows(S.MATERIALS).slice(1).map(x => ({
    id: String(x[0]), subjectId: String(x[1]), title: String(x[2]), description: String(x[3]),
    url: String(x[4]), active: String(x[6]).toUpperCase()
  }));
  return { results, students, subjects, exams, materials };
}

function saveExam(token, p) {
  teacher_(token);
  if (!p.title || !String(p.title).trim()) throw Error('Judul ujian wajib diisi.');
  if (!(Number(p.duration) > 0)) throw Error('Durasi harus lebih dari 0 menit.');
  if (!p.id) p.id = p.subjectId + '-' + Utilities.getUuid().slice(0, 8);

  const sh = sheet_(S.EXAMS), d = sh.getDataRange().getValues();
  const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(p.id));
  const v = [p.id, p.subjectId, p.title, p.description || '', Number(p.duration), p.active ? 'TRUE' : 'FALSE', p.start || '', p.end || ''];
  if (i < 1) sh.appendRow(v); else sh.getRange(i + 1, 1, 1, 8).setValues([v]);
  return { ok: true, id: p.id };
}

function deleteExam(token, id) {
  teacher_(token);
  if (rows(S.ATTEMPTS).slice(1).some(r => String(r[1]) === String(id)))
    throw Error('Ujian sudah memiliki percobaan siswa. Nonaktifkan ujian jika tidak ingin digunakan lagi.');

  const sh = sheet_(S.EXAMS), d = sh.getDataRange().getValues();
  const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(id));
  if (i > 0) sh.deleteRow(i + 1);

  const qs = sheet_(S.QUESTIONS), qd = qs.getDataRange().getValues();
  for (let n = qd.length - 1; n >= 1; n--) {
    if (String(qd[n][0]) === String(id)) qs.deleteRow(n + 1);
  }
  return true;
}

function getQuestions(token, examId) {
  teacher_(token);
  return rows(S.QUESTIONS).slice(1)
    .filter(r => String(r[0]) === String(examId))
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map(r => ({
      examId: String(r[0]), no: Number(r[1]), question: String(r[2]),
      A: String(r[3]), B: String(r[4]), C: String(r[5]), D: String(r[6]),
      answer: String(r[7]), point: Number(r[8] || 10)
    }));
}

function saveQuestion(token, p) {
  teacher_(token);
  if (!p.examId) throw Error('Pilih ujian terlebih dahulu.');
  if (!(Number(p.no) > 0)) throw Error('Nomor soal wajib diisi.');
  if (!p.question || !String(p.question).trim()) throw Error('Pertanyaan wajib diisi.');

  const sh = sheet_(S.QUESTIONS), d = sh.getDataRange().getValues();
  const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(p.examId) && Number(r[1]) === Number(p.no));
  const v = [p.examId, Number(p.no), p.question, p.A, p.B, p.C, p.D, p.answer, Number(p.point || 10)];
  // Pastikan teks tidak diubah otomatis menjadi angka/tanggal
  const target = i < 1 ? sh.getLastRow() + 1 : i + 1;
  sh.getRange(target, 3, 1, 6).setNumberFormat('@');
  sh.getRange(target, 1, 1, 9).setValues([v]);
  return true;
}

function deleteQuestion(token, examId, no) {
  teacher_(token);
  const sh = sheet_(S.QUESTIONS), d = sh.getDataRange().getValues();
  const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(examId) && Number(r[1]) === Number(no));
  if (i > 0) sh.deleteRow(i + 1);
  return true;
}

function saveMaterial(token, p) {
  const t = teacher_(token);
  const sh = sheet_(S.MATERIALS);
  let url = p.url || '', fileId = p.fileId || '';
  if (!p.base64 && !url) throw Error('Pilih file atau isi URL materi.');
  if (!p.title || !String(p.title).trim()) throw Error('Judul materi wajib diisi.');

  if (p.base64) {
    const bytes = Utilities.base64Decode(p.base64);
    const blob = Utilities.newBlob(bytes, p.mime || MimeType.PDF, p.filename || 'materi');
    const file = DriveApp.createFile(blob);
    url = file.getUrl();
    fileId = file.getId();
  }
  const id = 'MAT-' + Utilities.getUuid().slice(0, 8);
  sh.appendRow([id, p.subjectId, p.title, p.description || '', url, fileId, 'TRUE', new Date(), t.name]);
  return { ok: true, url };
}

function deleteMaterial(token, id) {
  teacher_(token);
  const sh = sheet_(S.MATERIALS), d = sh.getDataRange().getValues();
  const i = d.findIndex((r, n) => n > 0 && String(r[0]) === String(id));
  if (i > 0) sh.deleteRow(i + 1);
  return true;
}

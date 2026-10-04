/* ====== PENGATURAN: ubah bagian ini saja ====== */
const CONFIG = {
  NAMA: 'MCN 75',
  TAGLINE: 'Belajar, berlatih, dan berprestasi bersama.',
  EMAIL: 'mcnplg@gmail.com',
  ALAMAT: 'Palembang Sumatera Selatan',
  // URL Web App hasil Deploy Apps Script (berakhiran /exec)
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwbnlVZoMuaJH1isyKh5dFIN5yb3Cur-ZTzKxtUS6Mu4cz-3_R0faZQBDK7dMQDg45DxA/exec'
};

const ARTICLES = [
  { id: 'belajar-efektif', cat: 'Tips Belajar', date: '28 Sep 2026', read: '4 menit', title: 'Lima Kebiasaan Belajar yang Membuat Anak Lebih Fokus',
    excerpt: 'Kebiasaan kecil yang konsisten lebih berdampak daripada belajar lama tetapi tidak teratur.',
    body: 'Mulailah dengan jadwal tetap, tempat belajar yang rapi, dan sesi singkat 25 menit diselingi istirahat. Biasakan anak merangkum pelajaran dengan kata-katanya sendiri, lalu menutup sesi dengan satu pertanyaan: apa yang paling saya pahami hari ini?' },
  { id: 'literasi-dasar', cat: 'Literasi', date: '21 Sep 2026', read: '5 menit', title: 'Menumbuhkan Minat Baca Sejak Sekolah Dasar',
    excerpt: 'Membaca menjadi kebiasaan ketika anak merasa senang, bukan terpaksa.',
    body: 'Sediakan buku sesuai usia, bacakan cerita sebelum tidur, dan beri anak kebebasan memilih bacaan. Diskusi ringan tentang tokoh dan alur cerita melatih pemahaman sekaligus kosakata.' },
  { id: 'siap-ujian', cat: 'Ujian', date: '14 Sep 2026', read: '4 menit', title: 'Cara Tenang Menghadapi Ujian Online',
    excerpt: 'Persiapan teknis dan mental sama pentingnya sebelum ujian dimulai.',
    body: 'Pastikan perangkat terisi daya dan koneksi stabil, kenali tampilan soal lewat latihan, dan kerjakan soal yang mudah lebih dulu. Perhatikan penghitung waktu, dan jangan lupa menekan tombol kumpulkan setelah selesai.' },
  { id: 'peran-orang-tua', cat: 'Orang Tua', date: '07 Sep 2026', read: '5 menit', title: 'Peran Orang Tua dalam Pendampingan Belajar di Rumah',
    excerpt: 'Pendampingan bukan berarti mengerjakan tugas, melainkan hadir dan mendorong.',
    body: 'Tanyakan proses, bukan hanya hasil. Apresiasi usaha anak, bantu mengatur waktu, dan jalin komunikasi rutin dengan guru agar kemajuan anak terpantau bersama.' },
  { id: 'matematika-asyik', cat: 'Tips Belajar', date: '31 Agu 2026', read: '6 menit', title: 'Membuat Matematika Terasa Menyenangkan',
    excerpt: 'Hitungan terasa mudah ketika dikaitkan dengan kehidupan sehari-hari.',
    body: 'Gunakan contoh nyata seperti berbelanja, membagi kue, atau mengukur bahan masakan. Permainan kartu angka dan kuis singkat membantu anak menguasai operasi hitung tanpa tekanan.' },
  { id: 'atur-waktu', cat: 'Orang Tua', date: '24 Agu 2026', read: '3 menit', title: 'Mengatur Waktu Belajar dan Bermain Secara Seimbang',
    excerpt: 'Anak yang cukup bermain dan beristirahat justru belajar lebih baik.',
    body: 'Buat jadwal harian bersama anak, batasi waktu layar, dan sisakan ruang untuk aktivitas fisik. Keseimbangan ini menjaga semangat dan kesehatan anak sepanjang semester.' }
];

const $ = s => document.querySelector(s);

function articleCard(a, expandable) {
  const act = expandable
    ? `<a href="#${a.id}" class="more" onclick="toggleCard('${a.id}');return false">Baca selengkapnya →</a>`
    : `<a href="artikel.html#${a.id}" class="more">Baca selengkapnya →</a>`;
  return `<article class="card" id="${a.id}">
    <div class="meta"><span class="tag">${a.cat}</span>${a.date} · ${a.read}</div>
    <h3>${a.title}</h3><p>${a.excerpt}</p>
    <div class="body" hidden style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">${a.body}</div>
    <div style="margin-top:12px">${act}</div>
  </article>`;
}
function toggleCard(id) {
  const el = document.getElementById(id), b = el.querySelector('.body'), m = el.querySelector('.more');
  b.hidden = !b.hidden; m.textContent = b.hidden ? 'Baca selengkapnya →' : 'Tutup ←';
}

function layout() {
  const p = location.pathname.split('/').pop() || 'index.html';
  const L = [['index.html', 'Beranda'], ['artikel.html', 'Artikel'], ['tentang.html', 'Tentang']];
  if ($('#hdr')) $('#hdr').innerHTML = `<header class="site"><div class="container bar">
    <a class="brand" href="index.html"><span class="logo">🎓</span>${CONFIG.NAMA}</a>
    <button class="burger" aria-label="Menu" onclick="document.body.classList.toggle('open')">☰</button>
    <nav>${L.map(([h, t]) => `<a href="${h}" class="${p === h ? 'on' : ''}">${t}</a>`).join('')}<a class="btn btn-primary" href="login.html">Masuk</a></nav>
  </div></header>`;
  if ($('#ftr')) $('#ftr').innerHTML = `<footer class="site"><div class="container"><div class="cols">
    <div><div class="brand" style="color:#fff;margin-bottom:10px"><span class="logo" style="background:#ffffff1f">🎓</span>${CONFIG.NAMA}</div><p>${CONFIG.TAGLINE}</p></div>
    <div><h4>Navigasi</h4>${L.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="login.html">Masuk</a></div>
    <div><h4>Kontak</h4><a href="mailto:${CONFIG.EMAIL}">${CONFIG.EMAIL}</a><span>${CONFIG.ALAMAT}</span></div>
  </div><div class="copy">© ${new Date().getFullYear()} ${CONFIG.NAMA}. Seluruh hak cipta dilindungi.</div></div></footer>`;
}

document.addEventListener('DOMContentLoaded', layout);

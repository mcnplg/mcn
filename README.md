# Website Pendidikan

Situs statis (Beranda, Artikel, Tentang, Masuk) + dashboard Siswa/Admin dari Google Apps Script.

## Struktur
- `index.html`, `artikel.html`, `tentang.html`, `login.html`, `dashboard.html`
- `assets/style.css`, `assets/site.js` (nama sekolah, kontak, artikel, dan URL Apps Script)
- `apps-script/` : `Code.gs`, `Index.html` (siswa), `Guru.html` (admin). File ini hanya arsip, tidak dijalankan GitHub.

## Langkah
1. **Apps Script**: buat project terikat Google Sheet, salin 3 file di `apps-script/`, jalankan `setupV3()` sekali.
2. **Deploy** → New deployment → Web app. Execute as: *Me*. Who has access: *Anyone*. Salin URL `/exec`.
3. Tempel URL tersebut ke `APPS_SCRIPT_URL` di `assets/site.js`.
4. **GitHub**: unggah isi folder ini ke repository, lalu Settings → Pages → Deploy from a branch → `main` / root.
5. Setiap mengubah kode Apps Script: Deploy → Manage deployments → Edit → New version.

Dashboard admin: `dashboard.html?role=admin`. Dashboard siswa: `dashboard.html?role=siswa`.

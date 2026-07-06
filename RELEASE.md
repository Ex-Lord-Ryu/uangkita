# UangKu v1.0.0

Tanggal rilis: 2026-07-06  
Status: Initial stable release  
Lisensi: MIT  
Tag yang disarankan: `v1.0.0`

## Ringkasan

Rilis awal UangKu sebagai aplikasi manajemen keuangan pribadi berbasis Laravel, Inertia, React, dan Tailwind CSS. Versi ini sudah mencakup alur utama untuk mencatat transaksi, mengelola kategori dan tabungan, membaca laporan bulanan, mengirim feedback, serta panel admin untuk operasional dasar.

## Highlight

- Dashboard user dengan summary keuangan, grafik tren, breakdown kategori, dan transaksi terbaru.
- Transaksi manual, quick input teks, dan OCR struk dengan halaman review sebelum disimpan.
- Kategori per user dengan keyword untuk auto-guess dari quick input dan OCR.
- Tabungan dengan rekening, mutasi setor/tarik, ringkasan saldo, dan estimasi bunga.
- Laporan bulanan dengan summary, breakdown kategori, rata-rata pengeluaran harian, dan komparasi 6 bulan.
- Feedback user dengan lampiran, reply thread, dan pengelolaan status dari admin.
- Panel admin untuk statistik agregat, manajemen user, toggle registrasi/OCR, dan feedback.
- Landing page baru dengan preview fitur, mobile preview, FAQ, favicon, dark mode, dan screenshot preview.

## Perubahan Penting

- README diganti dari template Laravel menjadi dokumentasi proyek UangKu.
- `LICENSE` MIT ditambahkan.
- Preview landing page ditambahkan di `public/preview/landing-page.png`.
- File konfigurasi agent/MCP lokal dihapus dari tracking git dan dimasukkan ke `.gitignore`.

## Upgrade

Ini rilis awal, jadi belum ada breaking change dari versi aplikasi sebelumnya.

Untuk environment development yang sudah ada:

```bash
php artisan migrate
npm install
npm run build
```

Untuk instalasi fresh:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run build
```

## Akun Seeder

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@gmail.com` | `admin123` |

Ganti kredensial seed sebelum production.

## Validasi

- `git diff --check` passed.
- `php artisan test --compact` passed: 90 tests, 355 assertions.
- `npm run build` passed.

## Catatan

- OCR bergantung pada kualitas gambar struk; user tetap perlu review draft sebelum menyimpan.
- Estimasi bunga tabungan adalah perhitungan aplikasi, bukan perhitungan resmi bank.
- Belum ada API publik eksternal dan pipeline CI/CD bawaan.

## GitHub Release Body

```text
Rilis awal UangKu sebagai aplikasi manajemen keuangan pribadi.

Highlight:
- Dashboard keuangan user.
- Transaksi manual, quick input teks, dan OCR struk.
- Kategori, tabungan, laporan bulanan, dan feedback user.
- Panel admin untuk statistik, user, settings registrasi/OCR, dan feedback.
- Landing page, README lengkap, preview screenshot, dan lisensi MIT.

Validasi:
- php artisan test --compact: passed, 90 tests, 355 assertions.
- npm run build: passed.
```

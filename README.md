# UangKu

UangKu adalah aplikasi manajemen keuangan pribadi berbasis Laravel, Inertia, dan React. Aplikasi ini membantu pengguna mencatat transaksi, mengelola kategori, memantau tabungan, membaca laporan bulanan, dan mengirim feedback ke admin.

## Fitur

- Dashboard ringkasan saldo, pemasukan, pengeluaran, dan transaksi terbaru.
- Manajemen transaksi harian dengan kategori pemasukan atau pengeluaran.
- Input cepat dan OCR struk untuk membantu mencatat banyak item dari gambar.
- Kategori pribadi yang bisa dibuat, diperbarui, dan dihapus.
- Tabungan dengan mutasi setoran atau penarikan.
- Laporan keuangan untuk membaca tren transaksi.
- Feedback pengguna dengan balasan dari admin.
- Panel admin untuk mengelola user, feedback, pengaturan registrasi, OCR, dan akses transaksi user.
- Reset password memakai kode email dan autentikasi bawaan Laravel.

## Stack

- PHP 8.3
- Laravel 13
- Inertia Laravel 2
- React 18
- Tailwind CSS 4
- Vite 8
- PHPUnit 12

## Setup Lokal

Pastikan Composer, Node.js, npm, dan database lokal sudah tersedia.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
```

Jalankan server pengembangan:

```bash
composer run dev
```

Atau jalankan backend dan frontend secara terpisah:

```bash
php artisan serve
npm run dev
```

## Akun Seeder

Seeder bawaan membuat akun super admin untuk kebutuhan pengembangan lokal:

- Email: `superadmin@gmail.com`
- Password: `admin123`

Ubah kredensial ini sebelum dipakai di lingkungan produksi.

## Command Harian

```bash
php artisan test --compact
npm run build
vendor/bin/pint --dirty --format agent
```

## Struktur Utama

- `app/Http/Controllers` - controller fitur user dan admin.
- `app/Models` - model transaksi, kategori, tabungan, feedback, dan user.
- `resources/js/Pages` - halaman Inertia React.
- `resources/js/Components` - komponen UI reusable.
- `database/migrations` - struktur tabel aplikasi.
- `database/seeders` - data awal untuk pengembangan.

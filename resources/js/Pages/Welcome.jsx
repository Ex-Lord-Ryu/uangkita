import Icon from '@/Components/Icon';
import ThemeToggle from '@/Components/ThemeToggle';
import { formatRupiah } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';

const previewSummary = [
    { label: 'Pemasukan', value: 12500000, icon: 'arrowDown', tone: 'emerald' },
    { label: 'Pengeluaran', value: 4650000, icon: 'arrowUp', tone: 'red' },
    { label: 'Saldo', value: 7850000, icon: 'wallet', tone: 'brand' },
    { label: 'Tabungan', value: 18500000, icon: 'savings', tone: 'amber' },
];

const navLinks = [
    ['#fitur', 'Fitur'],
    ['#mobile', 'Mobile'],
    ['#untuk-siapa', 'Untuk siapa'],
    ['#alur', 'Alur'],
    ['#faq', 'FAQ'],
];

const trustBadges = [
    ['settings', 'Password hash Laravel'],
    ['bell', 'Reset kode email'],
    ['wallet', 'Data akun pribadi'],
    ['camera', 'OCR bisa direview'],
];

const benefitStats = [
    ['Cepat', 'Catat transaksi harian tanpa banyak langkah.'],
    ['Rapi', 'Kategori, tabungan, dan laporan tetap terpisah.'],
    ['Terbaca', 'Ringkasan bulanan mudah dipahami sekilas.'],
];

const userFeatures = [
    {
        icon: 'dashboard',
        title: 'Dashboard ringkas',
        description:
            'Lihat pemasukan, pengeluaran, saldo, tabungan, jumlah transaksi, tren harian, dan transaksi terbaru dalam satu layar.',
    },
    {
        icon: 'transactions',
        title: 'Transaksi harian',
        description:
            'Catat pemasukan dan pengeluaran manual, edit data, hapus transaksi, dan pantau detail per periode hari, minggu, atau bulan.',
    },
    {
        icon: 'camera',
        title: 'Scan struk OCR',
        description:
            'Upload foto atau screenshot struk, lalu review hasil OCR sebelum disimpan sebagai transaksi.',
    },
    {
        icon: 'savings',
        title: 'Tabungan terpisah',
        description:
            'Kelola rekening tabungan, saldo awal, setoran, penarikan, estimasi bunga, dan mutasi tabungan tanpa mencampur arus kas harian.',
    },
    {
        icon: 'categories',
        title: 'Kategori fleksibel',
        description:
            'Atur kategori pemasukan dan pengeluaran sendiri supaya laporan lebih rapi dan sesuai kebiasaanmu.',
    },
    {
        icon: 'reports',
        title: 'Laporan bulanan',
        description:
            'Analisis pemasukan vs pengeluaran, rata-rata harian, komposisi kategori, dan perbandingan 6 bulan terakhir.',
    },
    {
        icon: 'bell',
        title: 'Feedback ke admin',
        description:
            'Kirim masukan, lampiran, dan balasan dalam thread agar perbaikan aplikasi mudah ditindaklanjuti.',
    },
    {
        icon: 'wallet',
        title: 'Tampilan mobile',
        description:
            'Layout dibuat responsif untuk pencatatan cepat dari HP, termasuk card ringkas dan navigasi yang nyaman disentuh.',
    },
];

const workflow = [
    ['1', 'Catat transaksi', 'Input cepat, manual, atau scan struk.'],
    ['2', 'Kelompokkan otomatis', 'Kategori dan periode membuat data lebih mudah dibaca.'],
    ['3', 'Pantau dashboard', 'Lihat saldo, tabungan, tren, dan ringkasan terbaru.'],
    ['4', 'Review laporan', 'Ambil keputusan dari laporan bulanan yang jelas.'],
];

const audienceGroups = [
    {
        icon: 'reports',
        title: 'Pelajar & mahasiswa',
        description:
            'Bantu mengatur uang saku, jajan, transportasi, dan target tabungan kecil.',
    },
    {
        icon: 'wallet',
        title: 'Pekerja harian',
        description:
            'Pantau pemasukan rutin, pengeluaran harian, dan sisa saldo setiap bulan.',
    },
    {
        icon: 'transactions',
        title: 'Freelancer',
        description:
            'Pisahkan pemasukan proyek, biaya operasional, dan tabungan pribadi.',
    },
    {
        icon: 'savings',
        title: 'Keluarga kecil',
        description:
            'Catat belanja, kebutuhan rumah, cicilan, dan rencana tabungan bersama.',
    },
];

const privacyHighlights = [
    {
        icon: 'settings',
        title: 'Password terenkripsi',
        description:
            'Password akun disimpan dengan mekanisme hash Laravel, bukan teks biasa.',
    },
    {
        icon: 'bell',
        title: 'Reset pakai kode email',
        description:
            'Lupa password memakai kode 6 digit agar proses pemulihan tetap simpel dan terarah.',
    },
    {
        icon: 'eye',
        title: 'Data pribadi tetap pribadi',
        description:
            'Catatan transaksi, kategori, dan tabungan hanya ditampilkan di akun pemiliknya.',
    },
];

const faqs = [
    [
        'Apakah UangKu bisa dipakai gratis?',
        'Bisa. Pengguna dapat membuat akun dan mulai mencatat transaksi tanpa konfigurasi tambahan.',
    ],
    [
        'Apakah bisa dipakai dari HP?',
        'Bisa. Tampilan dashboard, transaksi, laporan, dan tabungan dibuat responsif untuk layar mobile.',
    ],
    [
        'Kalau lupa password bagaimana?',
        'Masukkan email akun, lalu gunakan kode reset 6 digit yang dikirim ke email untuk membuat password baru.',
    ],
    [
        'Apakah bisa scan struk?',
        'Bisa. Foto atau screenshot struk dapat diunggah, lalu hasil OCR bisa direview sebelum disimpan.',
    ],
];

const dashboardRows = [
    ['Makanan & Minuman', 2, 125000, 'red'],
    ['Transportasi', 4, 94000, 'amber'],
    ['Gaji', 1, 8500000, 'emerald'],
];

const toneClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    red: 'border-red-500/20 bg-red-500/10 text-red-300',
    brand: 'border-brand-500/20 bg-brand-500/10 text-brand-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
};

export default function Welcome({ auth }) {
    const { flags } = usePage().props;
    const canRegister = flags?.registrationEnabled !== false;

    return (
        <>
            <Head title="UangKu - Manajemen Keuangan Pribadi" />

            <div className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-gray-950/85">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-950/40">
                                <Icon name="wallet" className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-bold">
                                Uang<span className="text-brand-600 dark:text-brand-300">Ku</span>
                            </span>
                        </Link>

                        <nav
                            aria-label="Navigasi landing page"
                            className="hidden items-center gap-1 rounded-2xl border border-gray-200 bg-gray-50/70 p-1 dark:border-white/10 dark:bg-white/5 lg:flex"
                        >
                            {navLinks.map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <nav className="flex items-center gap-2">
                            <ThemeToggle />
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                                        >
                                            Daftar
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="pt-[73px]">
                    <section className="relative overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src="/images/auth-finance-visual.svg"
                                alt="Ilustrasi dashboard manajemen keuangan"
                                className="h-full w-full object-cover opacity-25 dark:opacity-45"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 via-gray-50/95 to-gray-50 dark:from-gray-950/80 dark:via-gray-950/92 dark:to-gray-950" />
                        </div>

                        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
                            <div className="flex flex-col justify-center">
                                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                    <Icon name="reports" className="h-4 w-4" />
                                    Keuangan pribadi lebih terbaca
                                </p>
                                <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-gray-950 sm:text-5xl lg:text-6xl dark:text-white">
                                    Kelola uang harian, tabungan, dan laporan tanpa ribet.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-300">
                                    UangKu membantu kamu mencatat transaksi, membaca pola pengeluaran,
                                    memantau tabungan, dan melihat laporan keuangan dalam satu dashboard
                                    yang rapi.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-950/40 transition hover:bg-brand-700"
                                        >
                                            Buka Dashboard
                                            <Icon name="arrowDown" className="h-4 w-4 rotate-[-90deg]" />
                                        </Link>
                                    ) : (
                                        <>
                                            {canRegister && (
                                                <Link
                                                    href={route('register')}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-950/40 transition hover:bg-brand-700"
                                                >
                                                    Mulai gratis
                                                    <Icon name="arrowDown" className="h-4 w-4 rotate-[-90deg]" />
                                                </Link>
                                            )}
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white hover:text-gray-950 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
                                            >
                                                Masuk ke akun
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-gray-200 bg-white/85 p-4 shadow-2xl shadow-gray-200/70 backdrop-blur sm:p-5 dark:border-white/10 dark:bg-gray-900/80 dark:shadow-gray-950/50">
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-950">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-950 dark:text-white">Dashboard Bulan Ini</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">Preview fitur user</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                            Live summary
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {previewSummary.map((item) => (
                                            <div
                                                key={item.label}
                                                className={`rounded-2xl border p-4 ${toneClasses[item.tone]}`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                                    <Icon name={item.icon} className="h-4 w-4" />
                                                </div>
                                                <p className="mt-2 break-words text-lg font-bold text-gray-950 dark:text-white">
                                                    {formatRupiah(item.value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-900">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-950 dark:text-white">Tren Harian</p>
                                                    <p className="text-xs text-gray-500">Pemasukan vs pengeluaran</p>
                                                </div>
                                                <Icon name="reports" className="h-5 w-5 text-brand-300" />
                                            </div>
                                            <div className="flex h-40 items-end gap-2">
                                                {[35, 62, 45, 80, 54, 90, 68, 74].map((height, index) => (
                                                    <div key={index} className="flex flex-1 flex-col justify-end gap-1">
                                                        <div
                                                            className="rounded-t-lg bg-brand-500"
                                                            style={{ height: `${height}%` }}
                                                        />
                                                        <div
                                                            className="rounded-t-lg bg-emerald-400"
                                                            style={{ height: `${Math.max(18, height - 24)}%` }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-900">
                                            <p className="text-sm font-semibold text-gray-950 dark:text-white">Pengeluaran Kategori</p>
                                            <div className="mt-4 space-y-3">
                                                {dashboardRows.map(([name, count, amount, tone]) => (
                                                    <div key={name}>
                                                        <div className="flex items-center justify-between gap-3 text-sm">
                                                            <span className="text-gray-600 dark:text-gray-300">{name}</span>
                                                            <span className="font-semibold text-gray-950 dark:text-white">
                                                                {formatRupiah(amount)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    tone === 'red'
                                                                        ? 'bg-red-400'
                                                                        : tone === 'amber'
                                                                          ? 'bg-amber-400'
                                                                          : 'bg-emerald-400'
                                                                }`}
                                                                style={{ width: `${Math.min(100, count * 22)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-gray-200 bg-white/70 dark:border-white/10 dark:bg-gray-900/60">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                                {trustBadges.map(([icon, label]) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:border-white/10 dark:bg-gray-950 dark:text-gray-200"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                                            <Icon name={icon} className="h-4 w-4" />
                                        </span>
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {benefitStats.map(([title, description]) => (
                                    <div
                                        key={title}
                                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-950"
                                    >
                                        <p className="text-lg font-bold text-gray-950 dark:text-white">
                                            {title}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="fitur" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">
                                Semua fitur user
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl dark:text-white">
                                Dari catatan kecil sampai laporan bulanan, semuanya kebuka.
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                Landing page ini menampilkan fitur utama yang tersedia di dashboard user,
                                sehingga pengguna tahu persis apa yang bisa dilakukan setelah login.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {userFeatures.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-400/40 dark:border-white/10 dark:bg-gray-900 dark:hover:bg-gray-900/80"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                                        <Icon name={feature.icon} className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-base font-semibold text-gray-950 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="mobile" className="scroll-mt-24 border-y border-gray-200 bg-white/70 dark:border-white/10 dark:bg-gray-900/60">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                                    Preview mobile
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl dark:text-white">
                                    Catat transaksi cepat dari layar HP.
                                </h2>
                                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Tampilan mobile dibuat ringkas untuk input harian, cek saldo,
                                    melihat tabungan, dan membaca transaksi terbaru tanpa harus membuka
                                    layar besar.
                                </p>

                                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {[
                                        ['wallet', 'Saldo cepat'],
                                        ['transactions', 'Input harian'],
                                        ['reports', 'Laporan ringkas'],
                                    ].map(([icon, label]) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:border-white/10 dark:bg-gray-950 dark:text-gray-200"
                                        >
                                            <Icon name={icon} className="h-4 w-4 text-brand-300" />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-gray-200 bg-gray-950 p-3 shadow-2xl shadow-gray-300/70 dark:border-white/10 dark:shadow-gray-950/70">
                                <div className="overflow-hidden rounded-[1.5rem] bg-gray-50 dark:bg-gray-900">
                                    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-gray-950">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Hari ini</p>
                                            <p className="text-sm font-bold text-gray-950 dark:text-white">UangKu Mobile</p>
                                        </div>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                                            <Icon name="wallet" className="h-4 w-4" />
                                        </span>
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <div className="rounded-2xl bg-brand-600 p-4 text-white">
                                            <p className="text-xs text-brand-100">Saldo aktif</p>
                                            <p className="mt-2 text-2xl font-bold">{formatRupiah(7850000)}</p>
                                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                                <span className="rounded-xl bg-white/15 px-3 py-2">Masuk 12,5 jt</span>
                                                <span className="rounded-xl bg-white/15 px-3 py-2">Keluar 4,65 jt</span>
                                            </div>
                                        </div>

                                        {[
                                            ['Makan siang', 'Makanan', 35000, 'red'],
                                            ['Setoran tabungan', 'Tabungan', 500000, 'emerald'],
                                            ['Transport online', 'Transportasi', 28000, 'amber'],
                                        ].map(([title, category, amount, tone]) => (
                                            <div
                                                key={title}
                                                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-950"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                            tone === 'red'
                                                                ? 'bg-red-500/10 text-red-400'
                                                                : tone === 'amber'
                                                                  ? 'bg-amber-500/10 text-amber-400'
                                                                  : 'bg-emerald-500/10 text-emerald-400'
                                                        }`}
                                                    >
                                                        <Icon
                                                            name={tone === 'emerald' ? 'savings' : 'transactions'}
                                                            className="h-4 w-4"
                                                        />
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-950 dark:text-white">
                                                            {title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-gray-950 dark:text-white">
                                                    {formatRupiah(amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="untuk-siapa" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">
                                Cocok untuk siapa
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl dark:text-white">
                                Dipakai siapa pun yang ingin catatan uang lebih jelas.
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                UangKu cukup ringan untuk kebutuhan pribadi, tapi tetap rapi untuk
                                kebiasaan finansial yang mulai serius.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {audienceGroups.map((group) => (
                                <div
                                    key={group.title}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/40 dark:border-white/10 dark:bg-gray-900"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                                        <Icon name={group.icon} className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-base font-semibold text-gray-950 dark:text-white">
                                        {group.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                        {group.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="alur" className="scroll-mt-24 border-y border-gray-200 bg-white/70 dark:border-white/10 dark:bg-gray-900/60">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                                    Alur penggunaan
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
                                    Dibuat untuk rutinitas harian, bukan cuma laporan akhir bulan.
                                </h2>
                                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Catat cepat saat transaksi terjadi, lalu biarkan dashboard dan laporan
                                    membantu membaca arah keuanganmu.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {workflow.map(([number, title, description]) => (
                                    <div
                                        key={number}
                                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-950"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                                            {number}
                                        </span>
                                        <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="keamanan" className="mx-auto grid max-w-7xl scroll-mt-24 grid-cols-1 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">
                                Keamanan & privasi
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
                                Data keuangan perlu terasa aman sejak halaman pertama.
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                UangKu dibuat untuk catatan finansial pribadi, jadi informasi penting
                                seperti akun, reset password, dan transaksi ditangani dengan alur yang
                                jelas.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-4">
                                {privacyHighlights.map((item) => (
                                    <div
                                        key={item.title}
                                        className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900"
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                                            <Icon name={item.icon} className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-gray-950 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div id="faq" className="scroll-mt-24 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                                        FAQ
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">
                                        Pertanyaan yang sering muncul.
                                    </h2>
                                </div>
                                <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300 sm:flex">
                                    <Icon name="bell" className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="mt-6 divide-y divide-gray-200 dark:divide-white/10">
                                {faqs.map(([question, answer]) => (
                                    <details key={question} className="group py-4 first:pt-0 last:pb-0">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-950 dark:text-white">
                                            <span>{question}</span>
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-open:rotate-45 dark:bg-gray-800 dark:text-gray-300">
                                                <Icon name="plus" className="h-4 w-4" />
                                            </span>
                                        </summary>
                                        <p className="mt-3 pr-10 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                            {answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-3xl border border-brand-400/20 bg-gradient-to-br from-brand-600 to-gray-900 p-6 shadow-2xl shadow-brand-950/40 sm:p-10">
                            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100">
                                        Siap dicoba
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold text-white">
                                        Mulai dari satu transaksi hari ini.
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-100/80">
                                        Setelah data masuk, dashboard akan langsung terasa hidup: saldo,
                                        kategori, tabungan, dan laporan ikut terbaca.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                                        >
                                            Buka Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            {canRegister && (
                                                <Link
                                                    href={route('register')}
                                                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                                                >
                                                    Daftar sekarang
                                                </Link>
                                            )}
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                            >
                                                Masuk
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                                <Icon name="wallet" className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-bold text-gray-950 dark:text-white">
                                    Uang<span className="text-brand-600 dark:text-brand-300">Ku</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manajemen keuangan pribadi yang rapi dan mudah dibaca.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            <a href="#fitur" className="hover:text-brand-600 dark:hover:text-brand-300">Fitur</a>
                            <a href="#mobile" className="hover:text-brand-600 dark:hover:text-brand-300">Mobile</a>
                            <a href="#faq" className="hover:text-brand-600 dark:hover:text-brand-300">FAQ</a>
                            <Link href={route('login')} className="hover:text-brand-600 dark:hover:text-brand-300">
                                Masuk
                            </Link>
                            {canRegister && (
                                <Link href={route('register')} className="hover:text-brand-600 dark:hover:text-brand-300">
                                    Daftar
                                </Link>
                            )}
                            <span className="text-gray-400 dark:text-gray-600">Copyright 2026 UangKu</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

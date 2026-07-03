import { Head, router, useForm } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import Icon from '@/Components/Icon';
import Button from '@/Components/ui/Button';

function ToggleSwitch({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
                checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

function StatusDot({ ok, label }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
            <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {label}
        </span>
    );
}

export default function AdminSettings({
    viewUserTx,
    registrationEnabled,
    ocrEnabled,
}) {
    const ocrForm = useForm({
        enabled: ocrEnabled,
    });

    const toggleViewTx = () =>
        router.put(route('admin.settings.view-user-tx'), { enabled: !viewUserTx }, { preserveScroll: true });

    const toggleRegistration = () =>
        router.put(route('admin.settings.registration'), { enabled: !registrationEnabled }, { preserveScroll: true });

    const saveOcr = (e) => {
        e.preventDefault();
        ocrForm.put(route('admin.settings.ocr'), { preserveScroll: true });
    };

    return (
        <SidebarLayout
            title="Pengaturan"
            header={<p className="text-sm text-gray-500 dark:text-gray-400">Kontrol fitur & konfigurasi aplikasi</p>}
        >
            <Head title="Pengaturan" />

            <div className="max-w-2xl space-y-6">

                {/* ── 1. View User Transactions (session) ── */}
                <Card>
                    <CardHeader
                        title="Lihat Transaksi User"
                        subtitle="Berlaku hanya untuk sesi ini — otomatis mati saat logout"
                    />
                    <CardBody className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Saat aktif, menu <strong>Transaksi User</strong> muncul di sidebar dan
                                kamu bisa melihat detail transaksi tiap pengguna. Saat nonaktif, menu
                                disembunyikan dan akses URL-nya diblokir (403).
                            </p>
                            <ToggleSwitch checked={viewUserTx} onChange={toggleViewTx} />
                        </div>
                        <StatusDot ok={viewUserTx} label={viewUserTx ? 'Aktif (sesi ini)' : 'Nonaktif'} />
                    </CardBody>
                </Card>

                {/* ── 2. Registration toggle (DB-persisted) ── */}
                <Card>
                    <CardHeader
                        title="Registrasi Pengguna"
                        subtitle="Disimpan permanen di database — berlaku sampai diubah lagi"
                    />
                    <CardBody className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Saat <strong>dinonaktifkan</strong>, halaman <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">/register</code> akan
                                    mengembalikan redirect ke login, dan tombol "Daftar" disembunyikan di
                                    halaman welcome. Cocok untuk mode closed-beta atau production terbatas.
                                </p>
                            </div>
                            <ToggleSwitch checked={registrationEnabled} onChange={toggleRegistration} />
                        </div>
                        <StatusDot
                            ok={registrationEnabled}
                            label={registrationEnabled ? 'Terbuka — siapa saja bisa daftar' : 'Tertutup — registrasi diblokir'}
                        />
                        {!registrationEnabled && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                Registrasi sedang dinonaktifkan. Pengguna baru tidak bisa membuat akun.
                                Admin tetap bisa membuat akun melalui halaman <strong>Kelola User</strong>.
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* ── 3. OCR settings (DB-persisted) ── */}
                <Card>
                    <CardHeader
                        title="Scan Struk (OCR)"
                        subtitle="OCR berjalan di browser lewat tesseract.js"
                    />
                    <CardBody>
                        <form onSubmit={saveOcr} className="space-y-5">
                            {/* Enable toggle */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Aktifkan fitur scan struk</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Saat nonaktif, tombol "Scan Struk" disembunyikan dan endpoint OCR menolak hasil scan.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={ocrForm.data.enabled}
                                    onChange={() => ocrForm.setData('enabled', !ocrForm.data.enabled)}
                                    disabled={ocrForm.processing}
                                />
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Mode OCR
                                </p>
                                <StatusDot
                                    ok={ocrForm.data.enabled}
                                    label={ocrForm.data.enabled ? 'Aktif - tesseract.js di browser' : 'Nonaktif'}
                                />
                                <p className="mt-2 text-xs text-gray-400">
                                    Server hanya menerima teks hasil OCR untuk diparse. Tidak perlu install binary
                                    Tesseract atau mengatur path di shared hosting.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={ocrForm.processing}>
                                    {ocrForm.processing ? 'Menyimpan…' : 'Simpan Pengaturan OCR'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
                    <Icon name="bell" className="mb-1 inline h-4 w-4" />{' '}
                    Pengaturan Registrasi dan OCR disimpan permanen di database.
                    Pengaturan "Lihat Transaksi User" hanya berlaku untuk sesi login saat ini.
                </div>
            </div>
        </SidebarLayout>
    );
}

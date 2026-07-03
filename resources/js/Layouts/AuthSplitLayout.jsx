import Icon from '@/Components/Icon';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';

export default function AuthSplitLayout({
    title,
    subtitle,
    children,
    footer,
}) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 p-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:p-6">
                <section className="relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 lg:flex">
                    <img
                        src="/images/auth-finance-visual.svg"
                        alt="Ilustrasi dashboard manajemen keuangan"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-950/40 via-gray-950/10 to-gray-950/70" />

                    <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-950/40">
                                <Icon name="wallet" className="h-5 w-5" />
                            </span>
                            <span className="text-xl font-bold">
                                Uang<span className="text-brand-300">Ku</span>
                            </span>
                        </Link>

                        <div className="max-w-md">
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
                                Manajemen Keuangan
                            </p>
                            <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
                                Pantau arus kas, tabungan, dan laporan dalam satu tempat.
                            </h1>
                            <p className="mt-4 text-sm leading-6 text-gray-300">
                                Tampilan yang rapi untuk mencatat pemasukan, pengeluaran, dan keputusan finansial harian.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                ['Kas', 'Tercatat'],
                                ['Tabungan', 'Terpantau'],
                                ['Laporan', 'Rapi'],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                                >
                                    <p className="text-xs text-gray-300">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <main className="flex min-h-screen items-center justify-center py-4 lg:min-h-0">
                    <div className="w-full max-w-md">
                        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                                    <Icon name="wallet" className="h-5 w-5" />
                                </span>
                                <span className="text-lg font-bold">
                                    Uang<span className="text-brand-600 dark:text-brand-300">Ku</span>
                                </span>
                            </Link>
                        </div>

                        <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:hidden dark:border-white/10 dark:bg-gray-900">
                            <img
                                src="/images/auth-finance-visual.svg"
                                alt="Ilustrasi dashboard manajemen keuangan"
                                className="h-40 w-full object-cover"
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/70 sm:p-8 dark:border-white/10 dark:bg-gray-900/95 dark:shadow-gray-950/40">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">
                                        UangKu
                                    </p>
                                    <h2 className="mt-3 text-2xl font-bold text-gray-950 dark:text-white">{title}</h2>
                                    {subtitle && (
                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>

                                <ThemeToggle className="-mt-1" />
                            </div>

                            {children}

                            {footer && (
                                <div className="mt-6 border-t border-gray-200 pt-5 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import StatCard from '@/Components/ui/StatCard';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import LineChartCard from '@/Components/charts/LineChartCard';
import PieChartCard from '@/Components/charts/PieChartCard';
import BarChartCard from '@/Components/charts/BarChartCard';
import Icon from '@/Components/Icon';
import { formatRupiah, formatShortDate } from '@/lib/format';

export default function Dashboard({
    summary,
    daily_trend,
    category_breakdown,
    monthly_comparison,
    recent,
}) {
    return (
        <SidebarLayout
            title="Dashboard"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ringkasan keuanganmu bulan ini
                </p>
            }
            actions={
                <Link
                    href={route('transactions.index')}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
                >
                    <Icon name="plus" className="h-4 w-4" /> Catat Transaksi
                </Link>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        label="Pemasukan"
                        value={formatRupiah(summary.income)}
                        icon="arrowDown"
                        tone="green"
                    />
                    <StatCard
                        label="Pengeluaran"
                        value={formatRupiah(summary.expense)}
                        icon="arrowUp"
                        tone="red"
                    />
                    <StatCard
                        label="Saldo"
                        value={formatRupiah(summary.balance)}
                        icon="wallet"
                        tone={summary.balance >= 0 ? 'brand' : 'red'}
                    />
                    <StatCard
                        label="Tabungan"
                        value={formatRupiah(summary.savings)}
                        icon="savings"
                        tone="green"
                    />
                    <StatCard
                        label="Transaksi"
                        value={summary.transaction_count}
                        icon="transactions"
                        tone="amber"
                        hint="Bulan ini"
                    />
                </div>

                {/* Charts — 3 kolom: kiri lebar (tren + perbandingan), kanan sempit (pie + terbaru) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Kiri: dua chart bertumpuk */}
                    <div className="space-y-6 lg:col-span-2">
                        <LineChartCard
                            title="Tren Harian"
                            subtitle="Pemasukan vs pengeluaran bulan ini"
                            data={daily_trend}
                            xKey="date"
                            formatX={formatShortDate}
                        />
                        <BarChartCard
                            title="Perbandingan Bulanan"
                            subtitle="6 bulan terakhir"
                            data={monthly_comparison}
                        />
                    </div>

                    {/* Kanan: pie chart + transaksi terbaru */}
                    <div className="space-y-6">
                        <PieChartCard
                            title="Pengeluaran per Kategori"
                            subtitle="Bulan ini"
                            data={category_breakdown}
                        />

                        <Card>
                            <CardHeader
                                title="Transaksi Terbaru"
                                action={
                                    <Link
                                        href={route('transactions.index')}
                                        className="text-xs font-medium text-brand-600 hover:underline"
                                    >
                                        Lihat semua
                                    </Link>
                                }
                            />
                            <CardBody className="space-y-1 p-2">
                                {recent.length === 0 && (
                                    <p className="px-3 py-8 text-center text-sm text-gray-400">
                                        Belum ada transaksi.
                                    </p>
                                )}
                                {recent.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                                    >
                                        <span
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                                            style={{
                                                backgroundColor:
                                                    (tx.category?.color ?? '#9ca3af') + '20',
                                            }}
                                        >
                                            {tx.category?.icon ?? '📋'}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                                                {tx.description}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatShortDate(tx.occurred_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-sm font-semibold ${
                                                tx.type === 'income'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {tx.type === 'income' ? '+' : '-'}
                                            {formatRupiah(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}

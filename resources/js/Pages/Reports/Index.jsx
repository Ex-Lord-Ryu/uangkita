import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import StatCard from '@/Components/ui/StatCard';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import PieChartCard from '@/Components/charts/PieChartCard';
import BarChartCard from '@/Components/charts/BarChartCard';
import { formatRupiah } from '@/lib/format';

export default function ReportsIndex({
    month,
    summary,
    expense_by_category,
    income_by_category,
    monthly_comparison,
}) {
    const changeMonth = (value) => {
        router.get(route('reports.index', { month: value }), {}, { preserveState: true });
    };

    const expensePercentage = (value) =>
        summary.expense > 0 ? Math.round((value / summary.expense) * 100) : 0;

    return (
        <SidebarLayout
            title="Laporan"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analisis keuangan per bulan
                </p>
            }
            actions={
                <input
                    type="month"
                    value={month}
                    onChange={(e) => changeMonth(e.target.value)}
                    className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
            }
        >
            <Head title="Laporan" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Pemasukan" value={formatRupiah(summary.income)} icon="arrowDown" tone="green" />
                    <StatCard label="Pengeluaran" value={formatRupiah(summary.expense)} icon="arrowUp" tone="red" />
                    <StatCard label="Saldo" value={formatRupiah(summary.balance)} icon="wallet" tone={summary.balance >= 0 ? 'brand' : 'red'} />
                    <StatCard label="Rata-rata / hari" value={formatRupiah(summary.avg_per_day)} icon="reports" tone="amber" hint={`${summary.transaction_count} transaksi`} />
                </div>

                <BarChartCard
                    title="Tren 6 Bulan"
                    subtitle="Pemasukan vs pengeluaran"
                    data={monthly_comparison}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PieChartCard
                        title="Pengeluaran per Kategori"
                        data={expense_by_category}
                    />
                    <PieChartCard
                        title="Pemasukan per Kategori"
                        data={income_by_category}
                    />
                </div>

                {/* Detailed table */}
                <Card>
                    <CardHeader title="Rincian Pengeluaran" subtitle="Per kategori bulan ini" />
                    <CardBody className="p-0">
                        {expense_by_category.length === 0 ? (
                            <p className="py-10 text-center text-sm text-gray-400">
                                Belum ada pengeluaran bulan ini.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3 p-4 sm:hidden">
                                    {expense_by_category.map((row) => {
                                        const percentage = expensePercentage(row.value);

                                        return (
                                            <div
                                                key={row.name}
                                                className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700/60 dark:bg-gray-700/30"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <span
                                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                                style={{ backgroundColor: row.color }}
                                                            />
                                                            <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {row.name}
                                                            </span>
                                                        </span>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {row.count} transaksi
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                            {formatRupiah(row.value)}
                                                        </p>
                                                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            {percentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: row.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <table className="hidden w-full table-fixed text-sm sm:table">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-700/60">
                                        <th className="w-[42%] px-5 py-3 font-medium">Kategori</th>
                                        <th className="w-[18%] px-5 py-3 text-right font-medium">Transaksi</th>
                                        <th className="w-[28%] px-5 py-3 text-right font-medium">Total</th>
                                        <th className="w-[12%] px-5 py-3 text-right font-medium">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {expense_by_category.map((row) => {
                                        const percentage = expensePercentage(row.value);

                                        return (
                                            <tr key={row.name}>
                                                <td className="px-5 py-3">
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <span
                                                            className="h-3 w-3 shrink-0 rounded-full"
                                                            style={{ backgroundColor: row.color }}
                                                        />
                                                        <span className="truncate text-gray-800 dark:text-gray-200">
                                                            {row.name}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right text-gray-500">
                                                    {row.count}
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                                                    {formatRupiah(row.value)}
                                                </td>
                                                <td className="px-5 py-3 text-right text-gray-500">
                                                    {percentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                </table>
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
        </SidebarLayout>
    );
}

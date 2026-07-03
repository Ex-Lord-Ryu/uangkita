import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import StatCard from '@/Components/ui/StatCard';
import BarChartCard from '@/Components/charts/BarChartCard';
import { formatNumber } from '@/lib/format';

export default function AdminDashboard({ stats, signups_trend, activity_trend }) {
    return (
        <SidebarLayout
            title="Dashboard Admin"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Statistik agregat — tanpa detail transaksi pengguna
                </p>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard label="Total Pengguna" value={formatNumber(stats.total_users)} icon="users" tone="brand" />
                    <StatCard label="Pengguna Aktif" value={formatNumber(stats.active_users)} icon="dashboard" tone="green" hint="Punya transaksi" />
                    <StatCard label="User Baru Bln Ini" value={formatNumber(stats.new_users_this_month)} icon="arrowDown" tone="amber" />
                    <StatCard label="Total Transaksi" value={formatNumber(stats.total_transactions)} icon="transactions" tone="brand" />
                    <StatCard label="Transaksi Bln Ini" value={formatNumber(stats.transactions_this_month)} icon="reports" tone="green" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <BarChartCard
                        title="Pendaftaran User"
                        subtitle="6 bulan terakhir"
                        data={signups_trend}
                        money={false}
                        series={[{ key: 'users', name: 'User Baru', color: '#6366f1' }]}
                    />
                    <BarChartCard
                        title="Aktivitas Transaksi"
                        subtitle="Total transaksi semua user / bulan"
                        data={activity_trend}
                        money={false}
                        series={[{ key: 'transactions', name: 'Transaksi', color: '#22c55e' }]}
                    />
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                    <strong>Privasi:</strong> Sebagai admin, kamu hanya melihat statistik
                    agregat. Detail transaksi tiap pengguna tidak ditampilkan kecuali kamu
                    mengaktifkan fitur "Lihat Transaksi User" di Pengaturan (berlaku per sesi).
                </div>
            </div>
        </SidebarLayout>
    );
}

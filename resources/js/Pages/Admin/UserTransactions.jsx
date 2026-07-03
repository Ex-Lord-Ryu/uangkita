import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Icon from '@/Components/Icon';
import { formatRupiah, formatDate, formatShortDate } from '@/lib/format';

const SOURCE_LABEL = { manual: 'Manual', text: 'Ketik', ocr: 'Struk' };
const SOURCE_TONE = { manual: 'gray', text: 'brand', ocr: 'amber' };

export default function AdminUserTransactions({
    users,
    selectedUser,
    summary,
    transactions,
    savingAccounts = [],
}) {
    const selectUser = (id) => {
        router.get(route('admin.user-transactions.index', { user: id }), {}, { preserveState: true });
    };

    const goTo = (url) =>
        url && router.get(url, {}, { preserveState: true, preserveScroll: true });

    return (
        <SidebarLayout
            title="Transaksi User"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fitur aktif untuk sesi ini — pilih pengguna untuk melihat transaksinya
                </p>
            }
        >
            <Head title="Transaksi User" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* ── User list (kiri) ── */}
                <Card className="h-fit lg:sticky lg:top-20">
                    <CardBody className="p-2">
                        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Pengguna ({users.length})
                        </p>
                        <div className="max-h-[75vh] space-y-0.5 overflow-y-auto">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                        selectedUser?.id === user.id
                                            ? 'bg-brand-600 text-white'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                    }`}
                                >
                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                            selectedUser?.id === user.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-brand-600 text-white'
                                        }`}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`truncate text-sm font-medium ${
                                                selectedUser?.id === user.id
                                                    ? 'text-white'
                                                    : 'text-gray-900 dark:text-gray-100'
                                            }`}
                                        >
                                            {user.name}
                                        </p>
                                        <p
                                            className={`truncate text-xs ${
                                                selectedUser?.id === user.id
                                                    ? 'text-white/70'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {user.transactions_count} kas · {user.saving_accounts_count} tabungan
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* ── Detail panel (kanan) ── */}
                <div className="space-y-5 lg:col-span-3">
                    {!selectedUser ? (
                        <Card>
                            <CardBody className="flex flex-col items-center justify-center py-24 text-center">
                                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
                                    <Icon name="users" className="h-7 w-7" />
                                </span>
                                <p className="font-medium text-gray-500 dark:text-gray-400">
                                    Pilih pengguna di sebelah kiri
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    untuk melihat detail transaksinya
                                </p>
                            </CardBody>
                        </Card>
                    ) : (
                        <>
                            {/* ── User info card ── */}
                            <Card>
                                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {selectedUser.name}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {selectedUser.email}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Bergabung{' '}
                                                {new Date(
                                                    selectedUser.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge tone="brand">
                                            {selectedUser.transactions_count} Transaksi Kas
                                        </Badge>
                                        <Badge tone="green">
                                            {summary?.saving_accounts_count ?? 0} Rekening Tabungan
                                        </Badge>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* ── Summary stats ── */}
                            {summary && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            <Icon name="wallet" className="h-4 w-4" />
                                            Arus Kas Harian
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {[
                                                { label: 'Pemasukan', value: summary.total_income, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                                { label: 'Pengeluaran', value: summary.total_expense, tone: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                                                { label: 'Saldo Kas', value: summary.balance, tone: summary.balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400', bg: 'bg-brand-50 dark:bg-brand-900/20' },
                                                { label: 'Transaksi Kas', value: summary.total_transactions, tone: 'text-gray-800 dark:text-gray-100', bg: 'bg-gray-50 dark:bg-gray-700/40', isCount: true },
                                            ].map((s) => (
                                                <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                                    <p className={`mt-1 text-lg font-bold ${s.tone}`}>
                                                        {s.isCount ? s.value : formatRupiah(s.value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            <Icon name="savings" className="h-4 w-4" />
                                            Tabungan
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {[
                                                { label: 'Saldo Tabungan', value: summary.saving_balance, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                                { label: 'Estimasi Bunga', value: summary.saving_interest, tone: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                                { label: 'Estimasi Total', value: summary.saving_total, tone: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/20' },
                                                { label: 'Mutasi Tabungan', value: summary.saving_transactions_count, tone: 'text-gray-800 dark:text-gray-100', bg: 'bg-gray-50 dark:bg-gray-700/40', isCount: true },
                                            ].map((s) => (
                                                <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                                    <p className={`mt-1 text-lg font-bold ${s.tone}`}>
                                                        {s.isCount ? s.value : formatRupiah(s.value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Savings accounts ── */}
                            <Card>
                                <CardHeader
                                    title="Tabungan User"
                                    subtitle={`${summary?.saving_accounts_count ?? 0} rekening, ${summary?.saving_transactions_count ?? 0} mutasi tabungan`}
                                />
                                {savingAccounts.length === 0 ? (
                                    <CardBody className="py-10 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <Icon name="savings" />
                                        </div>
                                        <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">
                                            Belum ada rekening tabungan.
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Kalau user menambah rekening, saldo dan mutasinya akan muncul di sini.
                                        </p>
                                    </CardBody>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                        {savingAccounts.map((account) => {
                                            const mutations = account.saving_transactions ?? [];

                                            return (
                                                <div key={account.id} className="px-5 py-4">
                                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                        <div className="flex min-w-0 items-start gap-3">
                                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                <Icon name="savings" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                        {account.name}
                                                                    </p>
                                                                    <Badge tone="green">{account.bank_name}</Badge>
                                                                    {account.has_interest && (
                                                                        <Badge tone="amber">
                                                                            Bunga {account.annual_interest_rate}% / tahun
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    Saldo awal {formatRupiah(account.principal_amount)}
                                                                    {account.has_interest && account.interest_started_at
                                                                        ? ` · mulai bunga ${formatShortDate(account.interest_started_at)}`
                                                                        : ' · tanpa bunga'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 text-right sm:min-w-[420px]">
                                                            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                                                    Saldo
                                                                </p>
                                                                <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                                    {formatRupiah(account.stored_balance_amount)}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
                                                                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                                                    Bunga
                                                                </p>
                                                                <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                                                                    {formatRupiah(account.estimated_interest_amount)}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
                                                                <p className="text-[11px] text-brand-700 dark:text-brand-300">
                                                                    Total
                                                                </p>
                                                                <p className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-300">
                                                                    {formatRupiah(account.estimated_balance_amount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 dark:border-gray-700/60 dark:bg-gray-900/20">
                                                        <div className="flex items-center justify-between px-4 py-3">
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                Mutasi Tabungan
                                                            </p>
                                                            <span className="text-xs text-gray-400">
                                                                {mutations.length} catatan
                                                            </span>
                                                        </div>
                                                        {mutations.length === 0 ? (
                                                            <p className="border-t border-gray-100 px-4 py-5 text-center text-sm text-gray-400 dark:border-gray-700/60">
                                                                Belum ada setoran atau penarikan.
                                                            </p>
                                                        ) : (
                                                            <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-700/60 dark:border-gray-700/60">
                                                                {mutations.slice(0, 6).map((mutation) => (
                                                                    <div key={mutation.id} className="flex items-center gap-3 px-4 py-3">
                                                                        <span
                                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                                                mutation.type === 'deposit'
                                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                            }`}
                                                                        >
                                                                            <Icon
                                                                                name={mutation.type === 'deposit' ? 'arrowDown' : 'arrowUp'}
                                                                                className="h-4 w-4"
                                                                            />
                                                                        </span>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                    {mutation.description ?? mutation.type_label}
                                                                                </p>
                                                                                <Badge tone={mutation.type === 'deposit' ? 'green' : 'red'}>
                                                                                    {mutation.type_label}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                                {formatDate(mutation.occurred_at, {
                                                                                    day: 'numeric',
                                                                                    month: 'long',
                                                                                    year: 'numeric',
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                        <p
                                                                            className={`shrink-0 text-right text-sm font-bold ${
                                                                                mutation.type === 'deposit'
                                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                                    : 'text-red-600 dark:text-red-400'
                                                                            }`}
                                                                        >
                                                                            {mutation.type === 'deposit' ? '+' : '-'}
                                                                            {formatRupiah(mutation.amount)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>

                            {/* ── Transaction list ── */}
                            <Card>
                                <CardHeader
                                    title="Riwayat Transaksi Kas"
                                    subtitle={`${summary?.total_transactions ?? 0} transaksi pemasukan/pengeluaran`}
                                />
                                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {transactions.data.length === 0 && (
                                        <p className="py-12 text-center text-sm text-gray-400">
                                            Tidak ada transaksi.
                                        </p>
                                    )}
                                    {transactions.data.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                                        >
                                            {/* Ikon kategori */}
                                            <span
                                                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                                                style={{
                                                    backgroundColor:
                                                        (tx.category?.color ?? '#9ca3af') + '20',
                                                }}
                                            >
                                                {tx.category?.icon ?? '📋'}
                                            </span>

                                            {/* Detail utama */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {tx.description}
                                                    </p>
                                                    <Badge
                                                        tone={tx.type === 'income' ? 'green' : 'red'}
                                                    >
                                                        {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </Badge>
                                                    <Badge tone={SOURCE_TONE[tx.source] ?? 'gray'}>
                                                        {SOURCE_LABEL[tx.source] ?? tx.source}
                                                    </Badge>
                                                </div>

                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="categories" className="h-3.5 w-3.5" />
                                                        {tx.category?.name ?? 'Tanpa Kategori'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="reports" className="h-3.5 w-3.5" />
                                                        {formatDate(tx.occurred_at, {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>

                                                {tx.raw_input && (
                                                    <p className="mt-1 italic text-xs text-gray-400">
                                                        "{tx.raw_input}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Jumlah */}
                                            <div className="shrink-0 text-right">
                                                <p
                                                    className={`font-bold ${
                                                        tx.type === 'income'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {tx.type === 'income' ? '+' : '-'}
                                                    {formatRupiah(tx.amount)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    #{tx.id}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {transactions.last_page > 1 && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 dark:border-gray-700/60">
                                        <p className="text-xs text-gray-400">
                                            {transactions.from}–{transactions.to} dari {transactions.total}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {transactions.links.map((link, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!link.url}
                                                    onClick={() => goTo(link.url)}
                                                    className={`min-w-9 rounded-lg px-3 py-1.5 text-sm transition ${
                                                        link.active
                                                            ? 'bg-brand-600 text-white'
                                                            : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}

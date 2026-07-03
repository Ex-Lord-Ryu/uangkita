import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';
import OcrScan from '@/Components/OcrScan';
import PeriodSwitcher from '@/Components/PeriodSwitcher';
import { formatRupiah, formatDate, formatRupiahInput } from '@/lib/format';

export default function TransactionsIndex({
    transactions,
    summary,
    category_breakdown,
    categories,
    period,
}) {
    const { flags } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const quickForm = useForm({ raw_input: '' });
    const submitQuick = (e) => {
        e.preventDefault();
        quickForm.post(route('transactions.quick'), {
            preserveScroll: true,
            onSuccess: () => quickForm.reset(),
        });
    };

    const form = useForm({
        type: 'expense',
        description: '',
        amount: '',
        category_id: '',
        occurred_at: period.date,
    });

    const openAdd = () => {
        form.reset();
        form.setData('occurred_at', period.date);
        form.clearErrors();
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (tx) => {
        form.setData({
            type: tx.type,
            description: tx.description,
            amount: tx.formatted_amount ?? tx.amount,
            category_id: tx.category_id ?? '',
            occurred_at: tx.occurred_at,
        });
        form.clearErrors();
        setEditing(tx);
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setEditing(null);
            },
        };
        if (editing) {
            form.patch(route('transactions.update', editing.id), opts);
        } else {
            form.post(route('transactions.store'), opts);
        }
    };

    // `transactions` is a Laravel paginator; group the current page by date.
    const grouped = transactions.data.reduce((acc, tx) => {
        (acc[tx.occurred_at] ??= []).push(tx);
        return acc;
    }, {});
    const groups = Object.entries(grouped);
    const breakdown = Object.entries(category_breakdown);

    const goTo = (url) =>
        url && router.get(url, {}, { preserveState: true, preserveScroll: true });

    return (
        <SidebarLayout
            title="Transaksi"
            actions={
                <>
                    {flags.ocrEnabled && <OcrScan />}
                    <Button onClick={openAdd}>
                        <Icon name="plus" className="h-4 w-4" /> Tambah
                    </Button>
                </>
            }
        >
            <Head title="Transaksi" />

            <div className="min-w-0 space-y-6">
                <PeriodSwitcher period={period} />

                {/* Summary */}
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Pemasukan</p>
                        <p className="mt-1 break-words text-xl font-bold text-emerald-700 sm:text-2xl dark:text-emerald-300">
                            {formatRupiah(summary.total_income)}
                        </p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">Pengeluaran</p>
                        <p className="mt-1 break-words text-xl font-bold text-red-700 sm:text-2xl dark:text-red-300">
                            {formatRupiah(summary.total_expense)}
                        </p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
                        <p className="text-sm text-brand-700 dark:text-brand-300">Saldo</p>
                        <p className="mt-1 break-words text-xl font-bold text-brand-700 sm:text-2xl dark:text-brand-300">
                            {formatRupiah(summary.balance)}
                        </p>
                    </div>
                </div>

                {/* Quick add */}
                <Card>
                    <CardBody>
                        <form onSubmit={submitQuick} className="flex flex-col gap-3 sm:flex-row">
                            <TextInput
                                value={quickForm.data.raw_input}
                                onChange={(e) => quickForm.setData('raw_input', e.target.value)}
                                placeholder='Ketik cepat, mis. "beli esteh 5000" atau "gaji 5jt"'
                                className="flex-1 rounded-xl"
                            />
                            <Button disabled={quickForm.processing} className="shrink-0">
                                <Icon name="plus" className="h-4 w-4" />
                                {quickForm.processing ? 'Menyimpan…' : 'Catat Cepat'}
                            </Button>
                        </form>
                        {quickForm.errors.raw_input && (
                            <p className="mt-2 text-sm text-red-600">{quickForm.errors.raw_input}</p>
                        )}
                    </CardBody>
                </Card>

                <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Transaction list */}
                    <div className="space-y-4 lg:col-span-2">
                        {groups.length === 0 && (
                            <Card>
                                <CardBody className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Belum ada transaksi di periode ini.
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Gunakan catat cepat di atas atau tombol Tambah.
                                    </p>
                                </CardBody>
                            </Card>
                        )}
                        {groups.map(([date, txs]) => (
                            <div key={date}>
                                <h3 className="mb-2 px-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {formatDate(date)}
                                </h3>
                                <Card>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                        {txs.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex min-w-0 items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                            >
                                                <span
                                                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                                                    style={{
                                                        backgroundColor:
                                                            (tx.category?.color ?? '#9ca3af') + '20',
                                                    }}
                                                >
                                                    {tx.category?.icon ?? '📋'}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {tx.category?.name ?? 'Tanpa Kategori'}
                                                        {tx.source === 'text' && ' • ketik'}
                                                        {tx.source === 'ocr' && ' • struk'}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-2">
                                                    <span
                                                        className={`text-right text-sm font-bold ${
                                                            tx.type === 'income'
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {tx.type === 'income' ? '+' : '-'}
                                                        {formatRupiah(tx.amount)}
                                                    </span>
                                                    <div className="flex">
                                                        <button
                                                            onClick={() => openEdit(tx)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                                        >
                                                            <Icon name="edit" className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(tx)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                                        >
                                                            <Icon name="trash" className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        ))}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <p className="text-xs text-gray-400">
                                    Menampilkan {transactions.from ?? 0}–{transactions.to ?? 0} dari{' '}
                                    {transactions.total} transaksi
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
                    </div>

                    {/* Category breakdown (sticky on scroll) */}
                    <Card className="h-fit lg:sticky lg:top-20">
                        <CardBody>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Pengeluaran per Kategori
                                </h3>
                                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                    {formatRupiah(summary.total_expense)}
                                </span>
                            </div>
                            {breakdown.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">
                                    Belum ada pengeluaran.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {breakdown.map(([name, amount]) => {
                                        const pct =
                                            summary.total_expense > 0
                                                ? Math.round((amount / summary.total_expense) * 100)
                                                : 0;
                                        return (
                                            <div key={name}>
                                                <div className="mb-1 flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {name}
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                                        {formatRupiah(amount)}
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                    <div
                                                        className="h-full rounded-full bg-brand-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Add / Edit modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submitForm} className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editing ? 'Edit Transaksi' : 'Tambah Transaksi'}
                    </h2>

                    <div className="mb-4 grid grid-cols-2 gap-2">
                        {['expense', 'income'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => form.setData('type', t)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                    form.data.type === t
                                        ? t === 'expense'
                                            ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'border-gray-300 text-gray-500 dark:border-gray-600'
                                }`}
                            >
                                {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            </button>
                        ))}
                    </div>

                    <div className="mb-3">
                        <InputLabel htmlFor="description" value="Deskripsi" />
                        <TextInput
                            id="description"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.description} className="mt-1" />
                    </div>

                    <div className="mb-3">
                        <InputLabel htmlFor="amount" value="Jumlah (Rp)" />
                        <TextInput
                            id="amount"
                            type="text"
                            inputMode="numeric"
                            value={form.data.amount}
                            onChange={(e) =>
                                form.setData('amount', formatRupiahInput(e.target.value))
                            }
                            className="mt-1 block w-full rounded-xl"
                            placeholder="1.000.000"
                        />
                        <InputError message={form.errors.amount} className="mt-1" />
                    </div>

                    <div className="mb-3">
                        <InputLabel htmlFor="category_id" value="Kategori" />
                        <select
                            id="category_id"
                            value={form.data.category_id}
                            onChange={(e) => form.setData('category_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                            <option value="">Pilih kategori…</option>
                            {categories
                                .filter((c) => c.type === form.data.type)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.icon} {c.name}
                                    </option>
                                ))}
                        </select>
                        <InputError message={form.errors.category_id} className="mt-1" />
                    </div>

                    <div className="mb-5">
                        <InputLabel htmlFor="occurred_at" value="Tanggal" />
                        <TextInput
                            id="occurred_at"
                            type="date"
                            value={form.data.occurred_at}
                            onChange={(e) => form.setData('occurred_at', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.occurred_at} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Batal
                        </Button>
                        <Button disabled={form.processing}>
                            {form.processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirm */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Hapus Transaksi
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Yakin hapus "{deleteTarget?.description}" sebesar{' '}
                        {deleteTarget ? formatRupiah(deleteTarget.amount) : ''}?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                router.delete(route('transactions.destroy', deleteTarget.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setDeleteTarget(null),
                                })
                            }
                        >
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </SidebarLayout>
    );
}

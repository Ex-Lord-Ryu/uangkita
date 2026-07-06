import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';
import StatCard from '@/Components/ui/StatCard';
import { formatDate, formatRupiah, formatRupiahInput } from '@/lib/format';

function dateOnly(value) {
    return value ? String(value).replace(' ', 'T').split('T')[0] : '';
}

export default function SavingsIndex({
    saving_accounts,
    summary,
    interest_periods,
    today,
}) {
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [mutationTarget, setMutationTarget] = useState(null);

    const accountForm = useForm({
        bank_name: '',
        name: '',
        principal_amount: '',
        has_interest: false,
        annual_interest_rate: '',
        interest_period: 'monthly',
        interest_started_at: '',
    });

    const mutationForm = useForm({
        type: 'deposit',
        description: '',
        amount: '',
        occurred_at: today,
    });

    const openAdd = () => {
        accountForm.reset();
        accountForm.clearErrors();
        setEditing(null);
        setShowAccountModal(true);
    };

    const openEdit = (savingAccount) => {
        accountForm.setData({
            bank_name: savingAccount.bank_name,
            name: savingAccount.name,
            principal_amount:
                savingAccount.formatted_principal_amount ?? savingAccount.principal_amount,
            has_interest: savingAccount.has_interest,
            annual_interest_rate: savingAccount.annual_interest_rate ?? '',
            interest_period: savingAccount.interest_period ?? 'monthly',
            interest_started_at: dateOnly(savingAccount.interest_started_at),
        });
        accountForm.clearErrors();
        setEditing(savingAccount);
        setShowAccountModal(true);
    };

    const openMutation = (savingAccount, type) => {
        mutationForm.setData({
            type,
            description: type === 'deposit' ? 'Setor tabungan' : 'Tarik tabungan',
            amount: '',
            occurred_at: today,
        });
        mutationForm.clearErrors();
        setMutationTarget(savingAccount);
    };

    const toggleInterest = (checked) => {
        accountForm.setData({
            ...accountForm.data,
            has_interest: checked,
            annual_interest_rate: checked ? accountForm.data.annual_interest_rate : '',
            interest_period: checked ? accountForm.data.interest_period : 'monthly',
            interest_started_at: checked ? accountForm.data.interest_started_at : '',
        });
    };

    const submitAccount = (e) => {
        e.preventDefault();

        if (accountForm.processing) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowAccountModal(false);
                setEditing(null);
            },
        };

        if (editing) {
            accountForm.patch(route('savings.update', editing.id), options);
        } else {
            accountForm.post(route('savings.store'), options);
        }
    };

    const submitMutation = (e) => {
        e.preventDefault();

        if (mutationForm.processing || !mutationTarget) {
            return;
        }

        mutationForm.post(route('savings.transactions.store', mutationTarget.id), {
            preserveScroll: true,
            onSuccess: () => setMutationTarget(null),
        });
    };

    return (
        <SidebarLayout
            title="Tabungan"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Catat rekening, setoran, penarikan, dan estimasi bunga secara terpisah dari
                    transaksi harian.
                </p>
            }
            actions={
                <Button onClick={openAdd}>
                    <Icon name="plus" className="h-4 w-4" /> Tambah Rekening
                </Button>
            }
        >
            <Head title="Tabungan" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Estimasi Total"
                        value={formatRupiah(summary.total)}
                        icon="savings"
                        tone="green"
                    />
                    <StatCard
                        label="Saldo Aktual"
                        value={formatRupiah(summary.principal)}
                        icon="wallet"
                        tone="brand"
                    />
                    <StatCard
                        label="Estimasi Bunga"
                        value={formatRupiah(summary.interest)}
                        icon="arrowDown"
                        tone="amber"
                    />
                    <StatCard
                        label="Rekening"
                        value={summary.account_count}
                        icon="transactions"
                        tone="gray"
                    />
                </div>

                {saving_accounts.length === 0 ? (
                    <Card>
                        <CardBody className="py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Icon name="savings" />
                            </div>
                            <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">
                                Belum ada rekening tabungan.
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Tambahkan rekening, lalu catat setoran dan penarikan kapan saja.
                            </p>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {saving_accounts.map((savingAccount) => {
                            const transactions = savingAccount.saving_transactions ?? [];

                            return (
                                <Card key={savingAccount.id}>
                                    <CardBody>
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <Icon name="savings" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                                                            {savingAccount.bank_name}
                                                        </p>
                                                        <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {savingAccount.name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex">
                                                        <button
                                                            onClick={() => openEdit(savingAccount)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                                            title="Edit rekening"
                                                        >
                                                            <Icon name="edit" className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(savingAccount)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                                            title="Hapus rekening"
                                                        >
                                                            <Icon name="trash" className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/40">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Saldo Awal
                                                        </p>
                                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                                            {formatRupiah(savingAccount.principal_amount)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
                                                        <p className="text-xs text-brand-700 dark:text-brand-300">
                                                            Saldo Aktual
                                                        </p>
                                                        <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300">
                                                            {formatRupiah(
                                                                savingAccount.stored_balance_amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                            Estimasi Total
                                                        </p>
                                                        <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                                                            {formatRupiah(
                                                                savingAccount.estimated_balance_amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => openMutation(savingAccount, 'deposit')}
                                                    >
                                                        <Icon name="plus" className="h-4 w-4" />
                                                        Setor
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            openMutation(savingAccount, 'withdrawal')
                                                        }
                                                    >
                                                        <Icon name="arrowUp" className="h-4 w-4" />
                                                        Tarik
                                                    </Button>
                                                </div>

                                                {savingAccount.has_interest ? (
                                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                                        Bunga {savingAccount.annual_interest_rate}% per
                                                        tahun, dikreditkan{' '}
                                                        {interest_periods.find(
                                                            (period) =>
                                                                period.value ===
                                                                savingAccount.interest_period,
                                                        )?.label ?? 'Bulanan'}{' '}
                                                        sejak{' '}
                                                        {formatDate(
                                                            savingAccount.interest_started_at,
                                                        )}
                                                        . Estimasi bunga:{' '}
                                                        {formatRupiah(
                                                            savingAccount.estimated_interest_amount,
                                                        )}
                                                        .
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-700/30 dark:text-gray-400">
                                                        Tanpa bunga. Saldo aktual dihitung dari saldo
                                                        awal, setoran, dan penarikan.
                                                    </div>
                                                )}

                                                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700/60">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            Mutasi Terbaru
                                                        </h4>
                                                        <span className="text-xs text-gray-400">
                                                            {transactions.length} catatan
                                                        </span>
                                                    </div>
                                                    {transactions.length === 0 ? (
                                                        <p className="rounded-xl bg-gray-50 px-3 py-4 text-center text-sm text-gray-400 dark:bg-gray-700/30">
                                                            Belum ada setoran atau penarikan.
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {transactions.slice(0, 5).map((transaction) => (
                                                                <div
                                                                    key={transaction.id}
                                                                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-700/30"
                                                                >
                                                                    <span
                                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                                            transaction.type === 'deposit'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                        }`}
                                                                    >
                                                                        <Icon
                                                                            name={
                                                                                transaction.type ===
                                                                                'deposit'
                                                                                    ? 'arrowDown'
                                                                                    : 'arrowUp'
                                                                            }
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </span>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                                                                            {transaction.description ??
                                                                                transaction.type_label}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {formatDate(
                                                                                transaction.occurred_at,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={`text-sm font-semibold ${
                                                                            transaction.type === 'deposit'
                                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                                : 'text-red-600 dark:text-red-400'
                                                                        }`}
                                                                    >
                                                                        {transaction.type === 'deposit'
                                                                            ? '+'
                                                                            : '-'}
                                                                        {formatRupiah(transaction.amount)}
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            router.delete(
                                                                                route(
                                                                                    'savings.transactions.destroy',
                                                                                    [
                                                                                        savingAccount.id,
                                                                                        transaction.id,
                                                                                    ],
                                                                                ),
                                                                                {
                                                                                    preserveScroll: true,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                                                        title="Hapus mutasi"
                                                                    >
                                                                        <Icon
                                                                            name="trash"
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                show={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                closeable={!accountForm.processing}
            >
                <form
                    onSubmit={submitAccount}
                    className="relative p-6"
                    aria-busy={accountForm.processing}
                >
                    {accountForm.processing && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px] dark:bg-gray-800/70">
                            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
                                <span
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-r-transparent"
                                    aria-hidden="true"
                                />
                                Rekening tabungan sedang disimpan...
                            </div>
                        </div>
                    )}
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editing ? 'Edit Rekening Tabungan' : 'Tambah Rekening Tabungan'}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="bank_name" value="Bank" />
                            <TextInput
                                id="bank_name"
                                value={accountForm.data.bank_name}
                                onChange={(e) => accountForm.setData('bank_name', e.target.value)}
                                className="mt-1 block w-full rounded-xl"
                                placeholder="BCA, BRI, Mandiri"
                            />
                            <InputError message={accountForm.errors.bank_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Nama Tabungan (opsional)" />
                            <TextInput
                                id="name"
                                value={accountForm.data.name}
                                onChange={(e) => accountForm.setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-xl"
                                placeholder="Dana darurat"
                            />
                            <InputError message={accountForm.errors.name} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <InputLabel htmlFor="principal_amount" value="Saldo Awal (Rp)" />
                        <TextInput
                            id="principal_amount"
                            type="text"
                            inputMode="numeric"
                            value={accountForm.data.principal_amount}
                            onChange={(e) =>
                                accountForm.setData(
                                    'principal_amount',
                                    formatRupiahInput(e.target.value),
                                )
                            }
                            className="mt-1 block w-full rounded-xl"
                            placeholder="1.000.000"
                        />
                        <InputError
                            message={accountForm.errors.principal_amount}
                            className="mt-1"
                        />
                    </div>

                    <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                        <input
                            type="checkbox"
                            checked={accountForm.data.has_interest}
                            onChange={(e) => toggleInterest(e.target.checked)}
                            className="mt-1 rounded border-gray-300 text-brand-600 shadow-sm focus:ring-brand-500"
                        />
                        <span>
                            <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                                Rekening ini memiliki bunga
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                Bunga dihitung dari saldo berjalan dan dikreditkan sesuai periode.
                            </span>
                        </span>
                    </label>

                    {accountForm.data.has_interest && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <InputLabel
                                    htmlFor="annual_interest_rate"
                                    value="Bunga per Tahun (%)"
                                />
                                <TextInput
                                    id="annual_interest_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={accountForm.data.annual_interest_rate}
                                    onChange={(e) =>
                                        accountForm.setData('annual_interest_rate', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl"
                                />
                                <InputError
                                    message={accountForm.errors.annual_interest_rate}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="interest_period" value="Periode Bunga" />
                                <select
                                    id="interest_period"
                                    value={accountForm.data.interest_period}
                                    onChange={(e) =>
                                        accountForm.setData('interest_period', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    {interest_periods.map((period) => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={accountForm.errors.interest_period}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="interest_started_at"
                                    value="Mulai Berjalan Sejak"
                                />
                                <TextInput
                                    id="interest_started_at"
                                    type="date"
                                    value={accountForm.data.interest_started_at}
                                    onChange={(e) =>
                                        accountForm.setData('interest_started_at', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl"
                                />
                                <InputError
                                    message={accountForm.errors.interest_started_at}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-5 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowAccountModal(false)}
                            disabled={accountForm.processing}
                        >
                            Batal
                        </Button>
                        <Button
                            loading={accountForm.processing}
                            loadingText="Menyimpan..."
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                show={!!mutationTarget}
                onClose={() => setMutationTarget(null)}
                maxWidth="md"
                closeable={!mutationForm.processing}
            >
                <form
                    onSubmit={submitMutation}
                    className="relative p-6"
                    aria-busy={mutationForm.processing}
                >
                    {mutationForm.processing && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px] dark:bg-gray-800/70">
                            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
                                <span
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-r-transparent"
                                    aria-hidden="true"
                                />
                                Mutasi tabungan sedang disimpan...
                            </div>
                        </div>
                    )}
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {mutationForm.data.type === 'deposit' ? 'Setor Tabungan' : 'Tarik Tabungan'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {mutationTarget?.name} - {mutationTarget?.bank_name}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {['deposit', 'withdrawal'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => mutationForm.setData('type', type)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                    mutationForm.data.type === type
                                        ? type === 'deposit'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        : 'border-gray-300 text-gray-500 dark:border-gray-600'
                                }`}
                            >
                                {type === 'deposit' ? 'Setor' : 'Tarik'}
                            </button>
                        ))}
                    </div>
                    <InputError message={mutationForm.errors.type} className="mt-1" />

                    <div className="mt-3">
                        <InputLabel htmlFor="mutation_amount" value="Jumlah (Rp)" />
                        <TextInput
                            id="mutation_amount"
                            type="text"
                            inputMode="numeric"
                            value={mutationForm.data.amount}
                            onChange={(e) =>
                                mutationForm.setData('amount', formatRupiahInput(e.target.value))
                            }
                            className="mt-1 block w-full rounded-xl"
                            placeholder="1.000.000"
                        />
                        <InputError message={mutationForm.errors.amount} className="mt-1" />
                    </div>

                    <div className="mt-3">
                        <InputLabel htmlFor="mutation_description" value="Catatan" />
                        <TextInput
                            id="mutation_description"
                            value={mutationForm.data.description}
                            onChange={(e) => mutationForm.setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={mutationForm.errors.description} className="mt-1" />
                    </div>

                    <div className="mt-3">
                        <InputLabel htmlFor="mutation_occurred_at" value="Tanggal" />
                        <TextInput
                            id="mutation_occurred_at"
                            type="date"
                            value={mutationForm.data.occurred_at}
                            onChange={(e) => mutationForm.setData('occurred_at', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={mutationForm.errors.occurred_at} className="mt-1" />
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setMutationTarget(null)}
                            disabled={mutationForm.processing}
                        >
                            Batal
                        </Button>
                        <Button
                            loading={mutationForm.processing}
                            loadingText="Menyimpan..."
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Hapus Rekening Tabungan
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Yakin hapus rekening "{deleteTarget?.name}" di {deleteTarget?.bank_name}?
                        Semua mutasi tabungan rekening ini juga akan terhapus.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                router.delete(route('savings.destroy', deleteTarget.id), {
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

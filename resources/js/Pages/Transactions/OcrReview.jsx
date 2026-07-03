import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';
import { formatRupiah } from '@/lib/format';

export default function OcrReview({ draft, categories, today }) {
    const [type, setType] = useState('expense');
    const [occurredAt, setOccurredAt] = useState(today);
    const [items, setItems] = useState(
        (draft.items ?? []).map((item, i) => ({
            id: i,
            description: item.description ?? '',
            amount: item.amount ?? 0,
            category_id: item.category_id ?? '',
        }))
    );
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const filteredCategories = categories.filter((c) => c.type === type);
    const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const updateItem = (id, field, value) => {
        setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));
    };

    const removeItem = (id) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const addItem = () => {
        setItems((prev) => [...prev, { id: Date.now(), description: '', amount: 0, category_id: '' }]);
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            route('transactions.ocr-items'),
            {
                type,
                occurred_at: occurredAt,
                items: items.map(({ description, amount, category_id }) => ({
                    description,
                    amount: Number(amount) || 0,
                    category_id: category_id || null,
                })),
            },
            {
                onFinish: () => setProcessing(false),
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <SidebarLayout
            title="Review Scan Struk"
            header={
                <Link href={route('transactions.index')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400">
                    <Icon name="chevronLeft" className="h-4 w-4" /> Kembali
                </Link>
            }
        >
            <Head title="Review Scan Struk" />

            <div className="mx-auto max-w-2xl space-y-5">
                {/* Info banner */}
                <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                    <Icon name="camera" className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-medium">
                            Hasil scan struk — {items.length} item terdeteksi
                        </p>
                        <p className="mt-0.5 opacity-80">
                            Periksa koreksi data per item sebelum menyimpan. OCR mungkin tidak 100% akurat.
                        </p>
                    </div>
                </div>

                {/* Raw OCR text preview */}
                {draft.raw_input && (
                    <Card>
                        <CardBody className="p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Teks hasil scan mentah
                            </p>
                            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                                {draft.raw_input}
                            </pre>
                        </CardBody>
                    </Card>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* Global settings */}
                    <Card>
                        <CardBody className="space-y-4 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Pengaturan Transaksi
                            </h3>

                            {/* Type */}
                            <div className="grid grid-cols-2 gap-2">
                                {['expense', 'income'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                            type === t
                                                ? t === 'expense'
                                                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {t === 'expense' ? '↑ Pengeluaran' : '↓ Pemasukan'}
                                    </button>
                                ))}
                            </div>

                            {/* Date */}
                            <div>
                                <InputLabel htmlFor="occurred_at" value="Tanggal" />
                                <TextInput
                                    id="occurred_at"
                                    type="date"
                                    value={occurredAt}
                                    onChange={(e) => setOccurredAt(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Per-item editing */}
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Item Struk ({items.length})
                                </h3>
                                <Button type="button" size="sm" variant="ghost" onClick={addItem}>
                                    <Icon name="plus" className="h-4 w-4" /> Tambah Item
                                </Button>
                            </div>

                            {items.length === 0 && (
                                <p className="py-8 text-center text-sm text-gray-400">
                                    Tidak ada item. Klik "Tambah Item" atau scan ulang.
                                </p>
                            )}

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-semibold text-gray-400">
                                                Item #{idx + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                            >
                                                <Icon name="trash" className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <InputLabel value="Nama Barang" />
                                                <TextInput
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                    placeholder="Contoh: esteh, nasgor"
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors[`items.${idx}.description`]} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel value="Jumlah (Rp)" />
                                                <TextInput
                                                    type="number"
                                                    min="0"
                                                    value={item.amount}
                                                    onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors[`items.${idx}.amount`]} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel value="Kategori" />
                                                <select
                                                    value={item.category_id}
                                                    onChange={(e) => updateItem(item.id, 'category_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                >
                                                    <option value="">Pilih…</option>
                                                    {filteredCategories.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.icon} {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors[`items.${idx}.category_id`]} className="mt-1" />
                                            </div>
                                        </div>

                                        {item.amount > 0 && (
                                            <p className="mt-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {formatRupiah(item.amount)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Total */}
                    <Card>
                        <CardBody className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Keseluruhan</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatRupiah(total)}
                                </p>
                            </div>
                            {draft.total > 0 && Math.abs(total - draft.total) > 1000 && (
                                <Badge tone="amber">
                                    Beda dari struk ({formatRupiah(draft.total)})
                                </Badge>
                            )}
                        </CardBody>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="secondary" href={route('transactions.index')}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || items.length === 0}>
                            {processing ? 'Menyimpan…' : `Simpan ${items.length} Transaksi`}
                        </Button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
}

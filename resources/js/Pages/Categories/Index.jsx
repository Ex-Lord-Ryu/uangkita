import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';

const EMOJIS = ['🍜', '🚗', '🛍️', '🧾', '💊', '🎮', '📦', '💰', '🎁', '➕', '🏠', '✈️', '📚', '🐶', '☕', '🎵'];
const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#ef4444', '#14b8a6', '#8b5cf6', '#22c55e', '#84cc16', '#6b7280', '#0ea5e9'];

export default function CategoriesIndex({ categories }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const form = useForm({
        name: '',
        type: 'expense',
        icon: '📦',
        color: '#6b7280',
        keywords: [],
    });

    const openAdd = () => {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        form.setData({
            name: cat.name,
            type: cat.type,
            icon: cat.icon ?? '📦',
            color: cat.color ?? '#6b7280',
            keywords: cat.keywords ?? [],
        });
        form.clearErrors();
        setEditing(cat);
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => setShowModal(false),
        };
        if (editing) {
            form.put(route('categories.update', editing.id), opts);
        } else {
            form.post(route('categories.store'), opts);
        }
    };

    const grouped = {
        expense: categories.filter((c) => c.type === 'expense'),
        income: categories.filter((c) => c.type === 'income'),
    };

    const Section = ({ title, items, tone }) => (
        <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {title}
                <Badge tone={tone}>{items.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((cat) => (
                    <Card key={cat.id}>
                        <CardBody className="flex items-center gap-3 p-4">
                            <span
                                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                                style={{ backgroundColor: (cat.color ?? '#9ca3af') + '20' }}
                            >
                                {cat.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                    {cat.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {cat.transactions_count} transaksi
                                    {cat.is_default && ' • bawaan'}
                                </p>
                            </div>
                            <div className="flex">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                >
                                    <Icon name="edit" className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(cat)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                >
                                    <Icon name="trash" className="h-4 w-4" />
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <SidebarLayout
            title="Kategori"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Atur kategori pemasukan & pengeluaranmu
                </p>
            }
            actions={
                <Button onClick={openAdd}>
                    <Icon name="plus" className="h-4 w-4" /> Tambah Kategori
                </Button>
            }
        >
            <Head title="Kategori" />

            <div className="space-y-8">
                <Section title="Pengeluaran" items={grouped.expense} tone="red" />
                <Section title="Pemasukan" items={grouped.income} tone="green" />
            </div>

            {/* Add / Edit modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                    </h2>

                    <div className="mb-4 grid grid-cols-2 gap-2">
                        {['expense', 'income'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => form.setData('type', t)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                    form.data.type === t
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                        : 'border-gray-300 text-gray-500 dark:border-gray-600'
                                }`}
                            >
                                {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            </button>
                        ))}
                    </div>

                    <div className="mb-3">
                        <InputLabel htmlFor="name" value="Nama Kategori" />
                        <TextInput
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.name} className="mt-1" />
                    </div>

                    <div className="mb-3">
                        <InputLabel value="Ikon" />
                        <div className="mt-1 flex flex-wrap gap-1.5">
                            {EMOJIS.map((emo) => (
                                <button
                                    key={emo}
                                    type="button"
                                    onClick={() => form.setData('icon', emo)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                                        form.data.icon === emo
                                            ? 'bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-900/40'
                                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    {emo}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <InputLabel value="Warna" />
                        <div className="mt-1 flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => form.setData('color', c)}
                                    className={`h-8 w-8 rounded-full transition ${
                                        form.data.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
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
                        Hapus Kategori
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Yakin hapus kategori "{deleteTarget?.name}"? Transaksi yang memakainya akan
                        menjadi tanpa kategori.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                router.delete(route('categories.destroy', deleteTarget.id), {
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

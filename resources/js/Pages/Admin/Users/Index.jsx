import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';

export default function AdminUsers({ users, filters, canManageRoles }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const currentUserId = auth?.user?.id;

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_admin: false,
    });

    const canModifyUser = (user) => canManageRoles || (!user.is_admin && !user.is_super_admin);
    const canDeleteUser = (user) => canModifyUser(user) && user.id !== currentUserId;

    const openAdd = () => {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (user) => {
        if (!canModifyUser(user)) {
            return;
        }

        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            is_admin: user.is_admin || user.is_super_admin,
        });
        form.clearErrors();
        setEditing(user);
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => setShowModal(false) };
        if (editing) {
            form.put(route('admin.users.update', editing.id), opts);
        } else {
            form.post(route('admin.users.store'), opts);
        }
    };

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    return (
        <SidebarLayout
            title="Kelola Pengguna"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {users.total} pengguna terdaftar
                </p>
            }
            actions={
                <Button onClick={openAdd}>
                    <Icon name="plus" className="h-4 w-4" /> Tambah User
                </Button>
            }
        >
            <Head title="Kelola Pengguna" />

            <div className="space-y-4">
                <form onSubmit={doSearch} className="flex gap-2">
                    <div className="relative flex-1 sm:max-w-xs">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icon name="search" className="h-4 w-4" />
                        </span>
                        <TextInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama / email…"
                            className="w-full rounded-xl pl-9"
                        />
                    </div>
                    <Button variant="secondary" type="submit">
                        Cari
                    </Button>
                </form>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-700/60">
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 text-right font-medium">Transaksi</th>
                                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500">{user.email}</td>
                                        <td className="px-5 py-3">
                                            {user.is_super_admin ? (
                                                <Badge tone="brand">Super Admin</Badge>
                                            ) : user.is_admin ? (
                                                <Badge tone="blue">Admin</Badge>
                                            ) : (
                                                <Badge tone="gray">User</Badge>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-500">
                                            {user.transactions_count}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end">
                                                {canModifyUser(user) && (
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        title="Edit pengguna"
                                                        aria-label={`Edit ${user.name}`}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                                    >
                                                        <Icon name="edit" className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {canDeleteUser(user) && (
                                                    <button
                                                        onClick={() => setDeleteTarget(user)}
                                                        title="Hapus pengguna"
                                                        aria-label={`Hapus ${user.name}`}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                                    >
                                                        <Icon name="trash" className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {!canModifyUser(user) && !canDeleteUser(user) && (
                                                    <span className="px-2 py-1 text-xs text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {users.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`rounded-lg px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editing ? 'Edit Pengguna' : 'Tambah Pengguna'}
                    </h2>

                    <div className="mb-3">
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.name} className="mt-1" />
                    </div>

                    <div className="mb-3">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            autoComplete="off"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.email} className="mt-1" />
                    </div>

                    <div className="mb-3">
                        <InputLabel
                            htmlFor="password"
                            value={editing ? 'Password (kosongkan jika tetap)' : 'Password'}
                        />
                        <TextInput
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                        <InputError message={form.errors.password} className="mt-1" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            className="mt-1 block w-full rounded-xl"
                        />
                    </div>

                    {canManageRoles && !editing?.is_super_admin && (
                        <label className="mb-5 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.data.is_admin}
                                onChange={(e) => form.setData('is_admin', e.target.checked)}
                                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Jadikan administrator
                            </span>
                        </label>
                    )}

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
                        Hapus Pengguna
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Yakin hapus "{deleteTarget?.name}"? Semua transaksi & kategori miliknya
                        ikut terhapus.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                router.delete(route('admin.users.destroy', deleteTarget.id), {
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

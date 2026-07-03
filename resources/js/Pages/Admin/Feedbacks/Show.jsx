import { Head, router, useForm } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';
import { formatDate, formatDateTime } from '@/lib/format';

const STATUS_TONE = { open: 'amber', in_progress: 'brand', resolved: 'green', closed: 'gray' };
const STATUS_LABEL = { open: 'Terbuka', in_progress: 'Diproses', resolved: 'Selesai', closed: 'Ditutup' };

export default function AdminFeedbacksShow({ feedback, statuses }) {
    const form = useForm({ message: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.feedbacks.reply', feedback.id), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const setStatus = (value) => {
        router.patch(route('admin.feedbacks.status', feedback.id), { status: value }, { preserveScroll: true });
    };

    const deleteFeedback = () => {
        if (confirm('Hapus feedback ini beserta semua balasan?')) {
            router.delete(route('admin.feedbacks.destroy', feedback.id));
        }
    };

    const isClosed = feedback.status === 'resolved' || feedback.status === 'closed';

    return (
        <SidebarLayout
            title="Detail Feedback"
            header={
                <a href={route('admin.feedbacks.index')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400">
                    <Icon name="chevronLeft" className="h-4 w-4" /> Kembali
                </a>
            }
            actions={
                <Button variant="danger" size="sm" onClick={deleteFeedback}>
                    <Icon name="trash" className="h-4 w-4" /> Hapus
                </Button>
            }
        >
            <Head title={`Feedback: ${feedback.subject}`} />

            <div className="mx-auto max-w-2xl space-y-5">
                {/* Header */}
                <Card>
                    <CardBody className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{feedback.subject}</h1>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    Dari <strong>{feedback.user?.name}</strong> ({feedback.user?.email})
                                    · {formatDateTime(feedback.created_at)}
                                </p>
                            </div>
                            <Badge tone={STATUS_TONE[feedback.status] ?? 'gray'}>
                                {STATUS_LABEL[feedback.status] ?? feedback.status}
                            </Badge>
                        </div>

                        {/* Status changer */}
                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Ubah Status:</p>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setStatus(s.value)}
                                        disabled={feedback.status === s.value}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${feedback.status === s.value ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 ring-1 ring-brand-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Original message */}
                <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {feedback.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                    <div className="flex-1">
                        <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm dark:bg-gray-800">
                            <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">{feedback.user?.name}</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{feedback.message}</p>

                            {feedback.attachments?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {feedback.attachments.map((att) => (
                                        <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {att.is_image
                                                ? <img src={att.url} alt={att.original_name} className="h-12 w-12 rounded object-cover" />
                                                : <Icon name="transactions" className="h-5 w-5" />
                                            }
                                            <span className="max-w-[120px] truncate">{att.original_name}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 pl-1 text-xs text-gray-400">
                            {formatDate(feedback.created_at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Reply thread */}
                {feedback.replies?.map((reply) => {
                    const isAdmin = reply.is_admin_reply;
                    return (
                        <div key={reply.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isAdmin ? 'bg-emerald-600' : 'bg-brand-600'}`}>
                                {reply.user?.name?.charAt(0).toUpperCase() ?? 'A'}
                            </span>
                            <div className={`flex-1 ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                                <div className={`rounded-2xl p-4 shadow-sm ${isAdmin ? 'rounded-tr-none bg-emerald-50 dark:bg-emerald-900/20' : 'rounded-tl-none bg-white dark:bg-gray-800'}`}>
                                    <p className={`text-sm font-medium mb-1 ${isAdmin ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                                        {reply.user?.name ?? 'Admin'}
                                        {isAdmin && <span className="ml-1 text-xs font-normal text-gray-400">(Admin)</span>}
                                    </p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{reply.message}</p>
                                </div>
                                <p className="mt-1 px-1 text-xs text-gray-400">
                                    {formatDateTime(reply.created_at)}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* Admin reply box */}
                <Card>
                    <CardBody>
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Balas sebagai Admin</p>
                        <form onSubmit={submit} className="space-y-3">
                            <textarea
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                rows={3}
                                placeholder="Tulis balasan untuk pengguna..."
                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                            <InputError message={form.errors.message} />
                            <div className="flex items-center justify-between">
                                {isClosed && (
                                    <p className="text-xs text-gray-400">Thread sudah {STATUS_LABEL[feedback.status]?.toLowerCase()}</p>
                                )}
                                <Button className="ml-auto" disabled={form.processing}>
                                    {form.processing ? 'Mengirim…' : 'Kirim Balasan'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </SidebarLayout>
    );
}

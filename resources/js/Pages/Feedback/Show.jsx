import { Head, useForm, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';
import { formatDate, formatDateTime } from '@/lib/format';

const STATUS_TONE = { open: 'amber', in_progress: 'brand', resolved: 'green', closed: 'gray' };
const STATUS_LABEL = { open: 'Terbuka', in_progress: 'Diproses', resolved: 'Selesai', closed: 'Ditutup' };

export default function FeedbackShow({ feedback }) {
    const { auth } = usePage().props;
    const form = useForm({ message: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('feedback.reply', feedback.id), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const isClosed = feedback.status === 'resolved' || feedback.status === 'closed';

    return (
        <SidebarLayout
            title="Detail Feedback"
            header={
                <a href={route('feedback.index')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400">
                    <Icon name="chevronLeft" className="h-4 w-4" /> Kembali
                </a>
            }
        >
            <Head title={`Feedback: ${feedback.subject}`} />

            <div className="mx-auto max-w-2xl space-y-5">
                {/* Header info */}
                <Card>
                    <CardBody>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {feedback.subject}
                                </h1>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    Dikirim {formatDate(feedback.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <Badge tone={STATUS_TONE[feedback.status] ?? 'gray'}>
                                {STATUS_LABEL[feedback.status] ?? feedback.status}
                            </Badge>
                        </div>
                    </CardBody>
                </Card>

                {/* Original message */}
                <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {auth.user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1">
                        <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm dark:bg-gray-800">
                            <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">{auth.user.name} <span className="text-gray-400 font-normal text-xs">(kamu)</span></p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{feedback.message}</p>

                            {feedback.attachments?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {feedback.attachments.map((att) => (
                                        <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {att.is_image
                                                ? <img src={att.url} alt={att.original_name} className="h-10 w-10 rounded object-cover" />
                                                : <Icon name="transactions" className="h-5 w-5" />
                                            }
                                            <span className="max-w-[120px] truncate">{att.original_name}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 pl-1 text-xs text-gray-400">
                            {formatDateTime(feedback.created_at)}
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

                {/* Reply box */}
                {!isClosed ? (
                    <Card>
                        <CardBody>
                            <form onSubmit={submit} className="space-y-3">
                                <textarea
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    rows={3}
                                    placeholder="Tulis balasan..."
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                />
                                <InputError message={form.errors.message} />
                                <div className="flex justify-end">
                                    <Button disabled={form.processing}>
                                        {form.processing ? 'Mengirim…' : 'Kirim Balasan'}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                        Thread ini telah {STATUS_LABEL[feedback.status]?.toLowerCase() ?? 'ditutup'}.
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

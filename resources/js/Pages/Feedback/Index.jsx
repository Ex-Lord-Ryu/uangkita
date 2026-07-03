import { Head, Link } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Icon from '@/Components/Icon';
import { formatDate } from '@/lib/format';

const STATUS_TONE = {
    open: 'amber',
    in_progress: 'brand',
    resolved: 'green',
    closed: 'gray',
};
const STATUS_LABEL = {
    open: 'Terbuka',
    in_progress: 'Diproses',
    resolved: 'Selesai',
    closed: 'Ditutup',
};

export default function FeedbackIndex({ feedbacks }) {
    return (
        <SidebarLayout
            title="Feedback"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sampaikan masukan atau laporkan masalah
                </p>
            }
            actions={
                <Button href={route('feedback.create')}>
                    <Icon name="plus" className="h-4 w-4" /> Kirim Feedback
                </Button>
            }
        >
            <Head title="Feedback" />

            <div className="space-y-4">
                {feedbacks.data.length === 0 && (
                    <Card>
                        <CardBody className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <Icon name="bell" className="h-7 w-7 text-gray-400" />
                            </span>
                            <p className="font-medium text-gray-500 dark:text-gray-400">
                                Belum ada feedback
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                Kirim feedback jika ada masukan atau kendala
                            </p>
                            <div className="mt-4">
                                <Button href={route('feedback.create')}>
                                    Kirim Feedback
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {feedbacks.data.map((fb) => (
                    <Link key={fb.id} href={route('feedback.show', fb.id)}>
                        <Card className="cursor-pointer transition hover:shadow-md">
                            <CardBody className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {fb.subject}
                                        </span>
                                        <Badge tone={STATUS_TONE[fb.status] ?? 'gray'}>
                                            {STATUS_LABEL[fb.status] ?? fb.status}
                                        </Badge>
                                        {!fb.is_read_by_user && (
                                            <Badge tone="red">Balasan Baru</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {fb.message}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-400">
                                        {formatDate(fb.created_at, {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                        {' · '}
                                        {fb.replies_count} balasan
                                    </p>
                                </div>
                                <Icon
                                    name="chevronLeft"
                                    className="h-5 w-5 rotate-180 text-gray-400 shrink-0"
                                />
                            </CardBody>
                        </Card>
                    </Link>
                ))}

                {/* Pagination */}
                {feedbacks.last_page > 1 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                        {feedbacks.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`min-w-9 rounded-lg px-3 py-1.5 text-sm text-center transition ${
                                    link.active
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

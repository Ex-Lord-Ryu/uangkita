import { Head, Link, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Icon from '@/Components/Icon';
import { formatDate } from '@/lib/format';

const STATUS_TONE = { open: 'amber', in_progress: 'brand', resolved: 'green', closed: 'gray' };
const STATUS_LABEL = { open: 'Terbuka', in_progress: 'Diproses', resolved: 'Selesai', closed: 'Ditutup' };

export default function AdminFeedbacksIndex({ feedbacks, counts, filters }) {
    const setFilter = (status) =>
        router.get(route('admin.feedbacks.index'), { status }, { preserveState: true });

    const filterTabs = [
        { key: '', label: 'Semua', count: counts.all },
        { key: 'open', label: 'Terbuka', count: counts.open },
        { key: 'in_progress', label: 'Diproses', count: counts.in_progress },
        { key: 'resolved', label: 'Selesai', count: counts.resolved },
    ];

    return (
        <SidebarLayout
            title="Feedback"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {counts.unread > 0 && (
                        <span className="font-medium text-red-500">{counts.unread} belum dibaca · </span>
                    )}
                    {counts.all} total feedback
                </p>
            }
        >
            <Head title="Feedback Admin" />

            <div className="space-y-4">
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                                filters.status === tab.key
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-xs ${filters.status === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* List */}
                {feedbacks.data.length === 0 && (
                    <Card>
                        <CardBody className="py-16 text-center">
                            <Icon name="bell" className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                            <p className="mt-3 text-gray-400">Tidak ada feedback</p>
                        </CardBody>
                    </Card>
                )}

                {feedbacks.data.map((fb) => (
                    <Link key={fb.id} href={route('admin.feedbacks.show', fb.id)}>
                        <Card className={`cursor-pointer transition hover:shadow-md ${!fb.is_read_by_admin ? 'border-brand-300 dark:border-brand-700' : ''}`}>
                            <CardBody className="flex items-start gap-4">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${!fb.is_read_by_admin ? 'bg-red-500' : 'bg-gray-400'}`}>
                                    {fb.user?.name?.charAt(0).toUpperCase() ?? '?'}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {fb.subject}
                                        </span>
                                        <Badge tone={STATUS_TONE[fb.status] ?? 'gray'}>
                                            {STATUS_LABEL[fb.status] ?? fb.status}
                                        </Badge>
                                        {!fb.is_read_by_admin && <Badge tone="red">Baru</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {fb.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {fb.user?.name} · {formatDate(fb.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {' · '}{fb.replies_count} balasan
                                    </p>
                                </div>
                                <Icon name="chevronLeft" className="h-5 w-5 rotate-180 text-gray-400 shrink-0 mt-1" />
                            </CardBody>
                        </Card>
                    </Link>
                ))}

                {/* Pagination */}
                {feedbacks.last_page > 1 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                        {feedbacks.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'}
                                className={`min-w-9 rounded-lg px-3 py-1.5 text-sm text-center transition ${link.active ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

import { router } from '@inertiajs/react';

export default function PeriodSwitcher({ period }) {
    const { type, date } = period;

    const periods = [
        { key: 'day', label: 'Hari' },
        { key: 'week', label: 'Minggu' },
        { key: 'month', label: 'Bulan' },
    ];

    const navigate = (newDate) => {
        router.get(
            route('transactions.index', { period: type, date: newDate }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const switchPeriod = (key) => {
        router.get(
            route('transactions.index', { period: key, date }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const prevDate = () => {
        const d = new Date(date);
        if (type === 'day') d.setDate(d.getDate() - 1);
        else if (type === 'week') d.setDate(d.getDate() - 7);
        else d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    };

    const nextDate = () => {
        const d = new Date(date);
        if (type === 'day') d.setDate(d.getDate() + 1);
        else if (type === 'week') d.setDate(d.getDate() + 7);
        else d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };

    const formatLabel = () => {
        const d = new Date(date + 'T00:00:00');
        const options =
            type === 'day'
                ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
                : { month: 'long', year: 'numeric' };
        return d.toLocaleDateString('id-ID', options);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Period type tabs */}
                <div className="grid min-w-0 grid-cols-3 gap-2 sm:flex">
                    {periods.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => switchPeriod(p.key)}
                            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition sm:flex-none ${
                                type === p.key
                                    ? 'bg-brand-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Date label + navigation */}
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                    <span className="truncate text-center text-sm font-medium text-gray-700 capitalize dark:text-gray-300 sm:text-left">
                        {formatLabel()}
                    </span>
                    <div className="grid min-w-0 grid-cols-[2.5rem_1fr_2.5rem] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 sm:flex sm:shrink-0">
                        <button
                            onClick={() => navigate(prevDate())}
                            className="px-3 py-1.5 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => navigate(today)}
                            className="border-x border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Hari Ini
                        </button>
                        <button
                            onClick={() => navigate(nextDate())}
                            className="px-3 py-1.5 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

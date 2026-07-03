import { formatRupiah } from '@/lib/format';

export default function ChartTooltip({ active, payload, label, money = true }) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {label && (
                <p className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                    {label}
                </p>
            )}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color || entry.payload?.color }}
                    />
                    <span className="text-gray-500 dark:text-gray-400">
                        {entry.name}:
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                        {money ? formatRupiah(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

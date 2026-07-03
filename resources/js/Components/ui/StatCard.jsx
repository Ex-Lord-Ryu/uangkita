import Icon from '@/Components/Icon';

const TONES = {
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function StatCard({ label, value, icon, tone = 'brand', hint }) {
    return (
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                {icon && (
                    <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}
                    >
                        <Icon name={icon} className="h-5 w-5" />
                    </span>
                )}
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
            {hint && (
                <p className="mt-1 text-xs text-gray-400">{hint}</p>
            )}
        </div>
    );
}

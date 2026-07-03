export default function SummaryCards({ summary }) {
    const formatRupiah = (amount) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const cards = [
        {
            label: 'Pemasukan',
            value: summary.total_income,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
        },
        {
            label: 'Pengeluaran',
            value: summary.total_expense,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
        },
        {
            label: 'Saldo',
            value: summary.balance,
            color:
                summary.balance >= 0
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-red-600 dark:text-red-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            border: 'border-indigo-200 dark:border-indigo-800',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`rounded-lg border ${card.border} ${card.bg} p-4 shadow-sm`}
                >
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {card.label}
                    </p>
                    <p className={`mt-1 text-2xl font-bold ${card.color}`}>
                        {formatRupiah(card.value)}
                    </p>
                </div>
            ))}
        </div>
    );
}

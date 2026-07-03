import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '@/Components/Icon';

export default function Toast() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const next = [];
        if (flash?.success) next.push({ id: Date.now() + 's', type: 'success', message: flash.success });
        if (flash?.error) next.push({ id: Date.now() + 'e', type: 'error', message: flash.error });
        if (next.length === 0) return;

        setToasts((prev) => [...prev, ...next]);
        const timer = setTimeout(() => {
            setToasts((prev) => prev.filter((t) => !next.some((n) => n.id === t.id)));
        }, 4000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.success, flash?.error]);

    const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex w-auto flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${
                        toast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200'
                    }`}
                >
                    <span className="mt-0.5">
                        <Icon
                            name={toast.type === 'success' ? 'arrowUp' : 'bell'}
                            className="h-5 w-5"
                        />
                    </span>
                    <p className="flex-1 text-sm">{toast.message}</p>
                    <button
                        onClick={() => dismiss(toast.id)}
                        className="text-current/70 hover:text-current"
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

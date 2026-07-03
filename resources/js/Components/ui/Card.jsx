export default function Card({ className = '', children, ...props }) {
    return (
        <div
            className={
                'rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800 ' +
                className
            }
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
    return (
        <div
            className={
                'flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700/60 ' +
                className
            }
        >
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}

export function CardBody({ className = '', children }) {
    return <div className={'p-5 ' + className}>{children}</div>;
}

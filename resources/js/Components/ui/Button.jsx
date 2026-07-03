import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary:
        'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm',
    secondary:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    href,
    method,
    as,
    className = '',
    disabled,
    children,
    ...props
}) {
    const classes =
        `inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ` +
        className;

    if (href) {
        return (
            <Link
                href={href}
                method={method}
                as={as}
                className={classes}
                {...props}
            >
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} disabled={disabled} {...props}>
            {children}
        </button>
    );
}

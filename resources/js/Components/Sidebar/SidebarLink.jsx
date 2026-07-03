import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';

export default function SidebarLink({ href, active, icon, label, collapsed, badge }) {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? 'justify-center' : 'gap-3'
            } ${
                active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-white'
            }`}
        >
            <span className="relative shrink-0">
                <Icon name={icon} className="h-5 w-5" />
                {!!badge && collapsed && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
            </span>
            {!collapsed && (
                <>
                    <span className="flex-1 truncate">{label}</span>
                    {!!badge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );
}

import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '@/Components/Icon';
import SidebarLink from '@/Components/Sidebar/SidebarLink';
import Dropdown from '@/Components/Dropdown';
import Toast from '@/Components/ui/Toast';

export default function SidebarLayout({ title, header, actions, children }) {
    const { auth, flags } = usePage().props;
    const user = auth.user;
    const isAdmin = auth.isAdmin;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dark, setDark] = useState(false);

    // Restore preferences.
    useEffect(() => {
        setCollapsed(localStorage.getItem('sidebar:collapsed') === '1');
        const isDark =
            localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
    };

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
    };

    // Close mobile drawer on navigation.
    useEffect(() => {
        const off = router.on('navigate', () => setMobileOpen(false));
        return off;
    }, []);

    const userMenu = [
        { href: route('dashboard'), label: 'Dashboard', icon: 'dashboard', match: 'dashboard' },
        { href: route('transactions.index'), label: 'Transaksi', icon: 'transactions', match: 'transactions.*' },
        { href: route('savings.index'), label: 'Tabungan', icon: 'savings', match: 'savings.*' },
        { href: route('categories.index'), label: 'Kategori', icon: 'categories', match: 'categories.*' },
        { href: route('reports.index'), label: 'Laporan', icon: 'reports', match: 'reports.*' },
        { href: route('feedback.index'), label: 'Feedback', icon: 'bell', match: 'feedback.*', badge: auth.feedbackUnread ?? 0 },
    ];

    const adminMenu = [
        { href: route('admin.dashboard'), label: 'Dashboard', icon: 'dashboard', match: 'admin.dashboard' },
        { href: route('admin.users.index'), label: 'Kelola User', icon: 'users', match: 'admin.users.*' },
        { href: route('admin.feedbacks.index'), label: 'Feedback', icon: 'bell', match: 'admin.feedbacks.*', badge: flags?.feedbackUnread ?? 0 },
        { href: route('admin.settings.edit'), label: 'Pengaturan', icon: 'settings', match: 'admin.settings.*' },
    ];

    if (isAdmin && flags?.canViewUserTx) {
        adminMenu.splice(2, 0, {
            href: route('admin.user-transactions.index'),
            label: 'Transaksi User',
            icon: 'eye',
            match: 'admin.user-transactions.*',
        });
    }

    const menu = isAdmin ? adminMenu : userMenu;

    const SidebarContent = ({ inDrawer }) => (
        <div className="flex h-full flex-col">
            {/* Brand */}
            <div
                className={`flex h-16 items-center border-b border-gray-100 px-4 dark:border-gray-700/60 ${
                    collapsed && !inDrawer ? 'justify-center' : 'gap-2'
                }`}
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Icon name="wallet" className="h-5 w-5" />
                </span>
                {(!collapsed || inDrawer) && (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Uang<span className="text-brand-600">Ku</span>
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {(!collapsed || inDrawer) && (
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {isAdmin ? 'Admin' : 'Menu'}
                    </p>
                )}
                {menu.map((item) => (
                    <SidebarLink
                        key={item.href}
                        href={item.href}
                        active={route().current(item.match)}
                        icon={item.icon}
                        label={item.label}
                        collapsed={collapsed && !inDrawer}
                    />
                ))}
            </nav>

            {/* Footer / role badge */}
            <div className="border-t border-gray-100 p-3 dark:border-gray-700/60">
                <div
                    className={`flex items-center rounded-xl bg-gray-50 p-2 dark:bg-gray-700/40 ${
                        collapsed && !inDrawer ? 'justify-center' : 'gap-3'
                    }`}
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                    {(!collapsed || inDrawer) && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                                {isAdmin ? 'Administrator' : 'Pengguna'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-900">
            {/* Desktop sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 hidden border-r border-gray-200 bg-white transition-all duration-200 lg:block dark:border-gray-700/60 dark:bg-gray-800 ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                <SidebarContent inDrawer={false} />
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 overflow-hidden lg:hidden">
                    <div
                        className="absolute inset-0 bg-gray-900/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-gray-800">
                        <SidebarContent inDrawer={true} />
                    </aside>
                </div>
            )}

            {/* Main column */}
            <div
                className={`flex min-h-screen min-w-0 flex-col overflow-x-hidden transition-all duration-200 ${
                    collapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-16 w-full min-w-0 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-gray-700/60 dark:bg-gray-800/80">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-700"
                    >
                        <Icon name="menu" />
                    </button>
                    <button
                        onClick={toggleCollapsed}
                        className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:block dark:hover:bg-gray-700"
                    >
                        <Icon
                            name="chevronLeft"
                            className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                    </div>

                    <button
                        onClick={toggleDark}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Ganti tema"
                    >
                        <Icon name={dark ? 'sun' : 'moon'} />
                    </button>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                Profil
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                Keluar
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                {/* Page header (optional) */}
                {(header || actions) && (
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6">
                        <div className="min-w-0 flex-1">{header}</div>
                        <div className="flex max-w-full flex-wrap justify-end gap-2">{actions}</div>
                    </div>
                )}

                {/* Content */}
                <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6">{children}</main>
            </div>

            <Toast />
        </div>
    );
}

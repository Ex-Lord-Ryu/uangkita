import { useEffect, useState } from 'react';
import Icon from '@/Components/Icon';

export default function ThemeToggle({ className = '' }) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleTheme = () => {
        const next = !dark;

        setDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15 dark:hover:text-white ' +
                className
            }
            title={dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            aria-label={dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
        >
            <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" />
        </button>
    );
}

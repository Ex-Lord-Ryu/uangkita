import Icon from '@/Components/Icon';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef(function PasswordInput(
    {
        className = '',
        containerClassName = '',
        isFocused = false,
        style = {},
        ...props
    },
    ref,
) {
    const [visible, setVisible] = useState(false);
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className={'relative ' + containerClassName}>
            <input
                {...props}
                ref={localRef}
                type={visible ? 'text' : 'password'}
                style={{ ...style, paddingRight: '3rem' }}
                className={
                    'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 ' +
                    className
                }
            />

            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                onMouseDown={(event) => event.preventDefault()}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                title={visible ? 'Sembunyikan password' : 'Lihat password'}
                aria-label={visible ? 'Sembunyikan password' : 'Lihat password'}
                aria-pressed={visible}
                disabled={props.disabled}
            >
                <Icon name={visible ? 'eyeOff' : 'eye'} className="h-5 w-5" />
            </button>
        </div>
    );
});

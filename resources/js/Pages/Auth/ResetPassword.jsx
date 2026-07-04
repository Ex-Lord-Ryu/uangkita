import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/ui/Button';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ email, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: email || '',
        code: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            title="Reset password"
            subtitle="Masukkan kode 6 digit dari email, lalu buat password baru untuk akunmu."
            footer={
                <>
                    Kembali ke{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                    >
                        halaman masuk
                    </Link>
                </>
            }
        >
            <Head title="Reset Password" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-gray-700 dark:text-gray-200"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-100 dark:placeholder:text-gray-500"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="code"
                        value="Kode reset"
                        className="text-gray-700 dark:text-gray-200"
                    />

                    <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={data.code}
                        className="mt-2 block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.35em] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-100 dark:placeholder:text-gray-500"
                        placeholder="000000"
                        inputMode="numeric"
                        maxLength="6"
                        autoComplete="one-time-code"
                        isFocused={true}
                        onChange={(e) =>
                            setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                    />

                    <InputError message={errors.code} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-gray-700 dark:text-gray-200"
                    />

                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        containerClassName="mt-2"
                        className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-100 dark:placeholder:text-gray-500"
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password"
                        className="text-gray-700 dark:text-gray-200"
                    />

                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        containerClassName="mt-2"
                        className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-100 dark:placeholder:text-gray-500"
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <Button
                    className="mt-2 w-full py-3"
                    disabled={processing}
                >
                    {processing ? 'Menyimpan...' : 'Reset password'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}

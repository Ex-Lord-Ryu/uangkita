import Checkbox from '@/Components/Checkbox';
import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import TextInput from '@/Components/TextInput';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout
            title="Masuk ke akun"
            subtitle="Lanjutkan pencatatan transaksi dan pantau kondisi keuanganmu dengan lebih tenang."
            footer={
                <>
                    Belum punya akun?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                    >
                        Daftar sekarang
                    </Link>
                </>
            }
        >
            <Head title="Masuk" />

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
                        placeholder="nama@email.com"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
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
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="border-gray-300 bg-white text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-950 dark:focus:ring-offset-gray-900"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                <Button
                    className="mt-2 w-full py-3"
                    disabled={processing}
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}

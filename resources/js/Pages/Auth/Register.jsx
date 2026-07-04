import Button from '@/Components/ui/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import TextInput from '@/Components/TextInput';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            title="Buat akun baru"
            subtitle="Mulai catat pemasukan, pengeluaran, dan tabungan pribadi dari satu dashboard yang rapi."
            footer={
                <>
                    Sudah punya akun?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                    >
                        Masuk
                    </Link>
                </>
            }
        >
            <Head title="Daftar" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Nama"
                        className="text-gray-700 dark:text-gray-200"
                    />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-2 block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-100 dark:placeholder:text-gray-500"
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

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
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
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
                        required
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
                    {processing ? 'Membuat akun...' : 'Daftar'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}

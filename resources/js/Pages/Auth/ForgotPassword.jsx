import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/ui/Button';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthSplitLayout
            title="Lupa password"
            subtitle="Masukkan email akunmu, nanti kami kirim kode 6 digit untuk membuat password baru."
            footer={
                <>
                    Ingat password?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                    >
                        Masuk
                    </Link>
                </>
            }
        >
            <Head title="Lupa Password" />

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

                <Button
                    className="mt-2 w-full py-3"
                    disabled={processing}
                >
                    {processing ? 'Mengirim...' : 'Kirim kode reset password'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}

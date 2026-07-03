import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Card, { CardBody } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Icon from '@/Components/Icon';

export default function FeedbackCreate() {
    const [previews, setPreviews] = useState([]);

    const form = useForm({
        subject: '',
        message: '',
        attachments: [],
    });

    const handleFiles = (e) => {
        const files = Array.from(e.target.files ?? []);
        form.setData('attachments', files);
        setPreviews(
            files.map((f) => ({
                name: f.name,
                isImage: f.type.startsWith('image/'),
                url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
            })),
        );
    };

    const removeFile = (index) => {
        const newFiles = [...form.data.attachments];
        newFiles.splice(index, 1);
        form.setData('attachments', newFiles);
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('feedback.store'), { forceFormData: true });
    };

    return (
        <SidebarLayout
            title="Kirim Feedback"
            header={
                <Link
                    href={route('feedback.index')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400"
                >
                    <Icon name="chevronLeft" className="h-4 w-4" /> Kembali
                </Link>
            }
        >
            <Head title="Kirim Feedback" />

            <div className="mx-auto max-w-xl">
                <Card>
                    <CardBody className="space-y-5 p-6">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Sampaikan masukan atau laporkan masalah
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Tim kami akan merespons sesegera mungkin.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Judul */}
                            <div>
                                <InputLabel htmlFor="subject" value="Judul" />
                                <TextInput
                                    id="subject"
                                    value={form.data.subject}
                                    onChange={(e) => form.setData('subject', e.target.value)}
                                    placeholder="Ringkasan masalah atau masukan"
                                    className="mt-1 block w-full"
                                    autoFocus
                                />
                                <InputError message={form.errors.subject} className="mt-1" />
                            </div>

                            {/* Pesan */}
                            <div>
                                <InputLabel htmlFor="message" value="Pesan" />
                                <textarea
                                    id="message"
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    rows={6}
                                    placeholder="Jelaskan secara detail — apa yang terjadi, langkah reproduksi, atau saran perbaikan..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder-gray-500"
                                />
                                <InputError message={form.errors.message} className="mt-1" />
                            </div>

                            {/* Lampiran */}
                            <div>
                                <InputLabel value="Lampiran (opsional — maks 5 file, 5 MB/file)" />
                                <label className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center transition hover:border-brand-400 dark:border-gray-600 dark:hover:border-brand-500">
                                    <Icon name="camera" className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                                            Klik untuk unggah
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {' '}atau seret file ke sini
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        JPG, PNG, GIF, PDF, TXT
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.txt"
                                        onChange={handleFiles}
                                        className="hidden"
                                    />
                                </label>
                                <InputError
                                    message={form.errors['attachments.0'] ?? form.errors.attachments}
                                    className="mt-1"
                                />

                                {/* Preview lampiran */}
                                {previews.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {previews.map((p, i) => (
                                            <div
                                                key={i}
                                                className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                {p.isImage ? (
                                                    <img
                                                        src={p.url}
                                                        alt={p.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 p-2 text-center">
                                                        <Icon
                                                            name="transactions"
                                                            className="h-6 w-6 text-gray-400"
                                                        />
                                                        <span className="max-w-full truncate text-xs text-gray-500">
                                                            {p.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                                                >
                                                    <Icon name="close" className="h-5 w-5 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    href={route('feedback.index')}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Mengirim…' : 'Kirim Feedback'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </SidebarLayout>
    );
}
